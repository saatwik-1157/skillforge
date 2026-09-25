/**
 * Auth service — business logic for registration, login, token rotation,
 * OTP email verification, password reset, and Google sign-in.
 */
import { OAuth2Client } from 'google-auth-library';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';
import type { Role, User } from '@prisma/client';
import { authRepository } from './auth.repository';
import { hashPassword, verifyPassword } from '../../utils/password';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../../utils/jwt';
import { sendEmail, otpEmailTemplate } from '../../utils/mailer';
import { ApiError } from '../../utils/ApiError';
import { env } from '../../config/env';
import type {
  RegisterDto,
  LoginDto,
  OtpVerifyDto,
  ResetPasswordDto,
} from './auth.schema';

const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const OTP_TTL_MS = 10 * 60 * 1000;
const googleClient = env.GOOGLE_CLIENT_ID ? new OAuth2Client(env.GOOGLE_CLIENT_ID) : null;

/** Public-safe projection of a user (never leak the password hash). */
export function toPublicUser(u: User) {
  const { passwordHash, googleId, ...safe } = u;
  void passwordHash;
  void googleId;
  return safe;
}

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function issueTokens(user: User, ctx: { userAgent?: string; ip?: string }) {
  const accessToken = signAccessToken({ sub: user.id, role: user.role, email: user.email });
  const jti = nanoid();
  const refreshToken = signRefreshToken({ sub: user.id, jti });

  await authRepository.createRefreshToken({
    token: refreshToken,
    userId: user.id,
    expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
    userAgent: ctx.userAgent,
    ip: ctx.ip,
  });

  return { accessToken, refreshToken };
}

async function issueOtp(user: User, purpose: 'EMAIL_VERIFY' | 'PASSWORD_RESET') {
  const code = generateOtp();
  const codeHash = await bcrypt.hash(code, 10);
  await authRepository.createOtp({
    userId: user.id,
    codeHash,
    purpose,
    expiresAt: new Date(Date.now() + OTP_TTL_MS),
  });
  const label = purpose === 'EMAIL_VERIFY' ? 'email verification' : 'password reset';
  await sendEmail(user.email, `Your SkillForge ${label} code`, otpEmailTemplate(user.name, code, label));
}

export const authService = {
  async register(dto: RegisterDto, ctx: { userAgent?: string; ip?: string }) {
    const existing = await authRepository.findUserByEmail(dto.email);
    if (existing) throw ApiError.conflict('An account with this email already exists');

    const passwordHash = await hashPassword(dto.password);
    const user = await authRepository.createUser({
      name: dto.name,
      email: dto.email,
      passwordHash,
      role: dto.role as Role,
    });

    await issueOtp(user, 'EMAIL_VERIFY');
    const tokens = await issueTokens(user, ctx);
    return { user: toPublicUser(user), ...tokens };
  },

  async login(dto: LoginDto, ctx: { userAgent?: string; ip?: string }) {
    const user = await authRepository.findUserByEmail(dto.email);
    if (!user || !user.passwordHash) throw ApiError.unauthorized('Invalid email or password');
    if (!user.isActive) throw ApiError.forbidden('This account has been deactivated');

    const ok = await verifyPassword(dto.password, user.passwordHash);
    if (!ok) throw ApiError.unauthorized('Invalid email or password');

    const tokens = await issueTokens(user, ctx);
    return { user: toPublicUser(user), ...tokens };
  },

  async refresh(refreshToken: string, ctx: { userAgent?: string; ip?: string }) {
    if (!refreshToken) throw ApiError.unauthorized('Refresh token missing');

    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw ApiError.unauthorized('Invalid refresh token');
    }

    const stored = await authRepository.findRefreshToken(refreshToken);
    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      throw ApiError.unauthorized('Refresh token expired or revoked');
    }

    const user = await authRepository.findUserById(payload.sub);
    if (!user || !user.isActive) throw ApiError.unauthorized('Account unavailable');

    // Rotate: revoke the used token, issue a fresh pair.
    await authRepository.revokeRefreshToken(stored.id, new Date());
    const tokens = await issueTokens(user, ctx);
    return { user: toPublicUser(user), ...tokens };
  },

  async logout(refreshToken?: string) {
    if (!refreshToken) return;
    const stored = await authRepository.findRefreshToken(refreshToken);
    if (stored && !stored.revokedAt) {
      await authRepository.revokeRefreshToken(stored.id, new Date());
    }
  },

  async me(userId: string) {
    const user = await authRepository.findUserById(userId);
    if (!user) throw ApiError.notFound('User not found');
    return toPublicUser(user);
  },

  async verifyOtp(dto: OtpVerifyDto) {
    const user = await authRepository.findUserByEmail(dto.email);
    if (!user) throw ApiError.notFound('User not found');

    const otp = await authRepository.findLatestOtp(user.id, 'EMAIL_VERIFY');
    if (!otp || otp.expiresAt < new Date()) throw ApiError.badRequest('Code expired, request a new one');

    const ok = await bcrypt.compare(dto.code, otp.codeHash);
    if (!ok) throw ApiError.badRequest('Invalid code');

    await authRepository.consumeOtp(otp.id, new Date());
    await authRepository.updateUser(user.id, { isEmailVerified: true });
    return { verified: true };
  },

  async forgotPassword(email: string) {
    const user = await authRepository.findUserByEmail(email);
    // Do not reveal whether the account exists.
    if (user) await issueOtp(user, 'PASSWORD_RESET');
    return { message: 'If an account exists, a reset code has been sent' };
  },

  async resetPassword(dto: ResetPasswordDto) {
    const user = await authRepository.findUserByEmail(dto.email);
    if (!user) throw ApiError.badRequest('Invalid reset request');

    const otp = await authRepository.findLatestOtp(user.id, 'PASSWORD_RESET');
    if (!otp || otp.expiresAt < new Date()) throw ApiError.badRequest('Code expired, request a new one');

    const ok = await bcrypt.compare(dto.code, otp.codeHash);
    if (!ok) throw ApiError.badRequest('Invalid code');

    await authRepository.consumeOtp(otp.id, new Date());
    const passwordHash = await hashPassword(dto.password);
    await authRepository.updateUser(user.id, { passwordHash });
    await authRepository.revokeAllUserTokens(user.id, new Date()); // force re-login everywhere
    return { message: 'Password updated successfully' };
  },

  async googleLogin(idToken: string, ctx: { userAgent?: string; ip?: string }) {
    if (!googleClient) throw ApiError.badRequest('Google login is not configured');

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload?.email) throw ApiError.unauthorized('Google account has no email');

    let user =
      (await authRepository.findUserByGoogleId(payload.sub)) ??
      (await authRepository.findUserByEmail(payload.email));

    if (!user) {
      user = await authRepository.createUser({
        name: payload.name ?? payload.email.split('@')[0],
        email: payload.email,
        googleId: payload.sub,
        avatarUrl: payload.picture,
        isEmailVerified: true,
      });
    } else if (!user.googleId) {
      user = await authRepository.updateUser(user.id, {
        googleId: payload.sub,
        isEmailVerified: true,
      });
    }

    const tokens = await issueTokens(user, ctx);
    return { user: toPublicUser(user), ...tokens };
  },
};

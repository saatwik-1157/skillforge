/**
 * Auth repository — the only place auth-related Prisma queries live.
 */
import type { Prisma, Role } from '@prisma/client';
import { prisma } from '../../config/prisma';

export const authRepository = {
  findUserByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  findUserById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  },

  findUserByGoogleId(googleId: string) {
    return prisma.user.findUnique({ where: { googleId } });
  },

  createUser(data: Prisma.UserCreateInput) {
    return prisma.user.create({ data });
  },

  updateUser(id: string, data: Prisma.UserUpdateInput) {
    return prisma.user.update({ where: { id }, data });
  },

  // --- refresh tokens ---
  createRefreshToken(data: Prisma.RefreshTokenUncheckedCreateInput) {
    return prisma.refreshToken.create({ data });
  },

  findRefreshToken(token: string) {
    return prisma.refreshToken.findUnique({ where: { token } });
  },

  revokeRefreshToken(id: string, revokedAt: Date) {
    return prisma.refreshToken.update({ where: { id }, data: { revokedAt } });
  },

  revokeAllUserTokens(userId: string, revokedAt: Date) {
    return prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt },
    });
  },

  // --- otp ---
  createOtp(data: Prisma.OtpTokenUncheckedCreateInput) {
    return prisma.otpToken.create({ data });
  },

  findLatestOtp(userId: string, purpose: string) {
    return prisma.otpToken.findFirst({
      where: { userId, purpose, consumedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  },

  consumeOtp(id: string, consumedAt: Date) {
    return prisma.otpToken.update({ where: { id }, data: { consumedAt } });
  },

  countRole(role: Role) {
    return prisma.user.count({ where: { role } });
  },
};

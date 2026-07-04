/**
 * Auth controller — thin HTTP mapping. Sets the refresh token as an httpOnly
 * cookie and returns the access token + user in the response body.
 */
import type { Request, Response } from 'express';
import { authService } from './auth.service';
import { sendSuccess } from '../../utils/ApiResponse';
import { isProd } from '../../config/env';

const REFRESH_COOKIE = 'refreshToken';
const cookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

function ctxOf(req: Request) {
  return { userAgent: req.headers['user-agent'], ip: req.ip };
}

function setRefresh(res: Response, token: string) {
  res.cookie(REFRESH_COOKIE, token, cookieOptions);
}

export const authController = {
  async register(req: Request, res: Response) {
    const { refreshToken, ...rest } = await authService.register(req.body, ctxOf(req));
    setRefresh(res, refreshToken);
    return sendSuccess(res, rest, { statusCode: 201, message: 'Account created. Check your email for the verification code.' });
  },

  async login(req: Request, res: Response) {
    const { refreshToken, ...rest } = await authService.login(req.body, ctxOf(req));
    setRefresh(res, refreshToken);
    return sendSuccess(res, rest, { message: 'Logged in' });
  },

  async refresh(req: Request, res: Response) {
    const token = req.cookies?.[REFRESH_COOKIE] ?? req.body?.refreshToken;
    const { refreshToken, ...rest } = await authService.refresh(token, ctxOf(req));
    setRefresh(res, refreshToken);
    return sendSuccess(res, rest, { message: 'Token refreshed' });
  },

  async logout(req: Request, res: Response) {
    await authService.logout(req.cookies?.[REFRESH_COOKIE]);
    res.clearCookie(REFRESH_COOKIE, { path: '/' });
    return sendSuccess(res, null, { message: 'Logged out' });
  },

  async me(req: Request, res: Response) {
    const user = await authService.me(req.user!.sub);
    return sendSuccess(res, { user });
  },

  async verifyOtp(req: Request, res: Response) {
    const data = await authService.verifyOtp(req.body);
    return sendSuccess(res, data, { message: 'Email verified' });
  },

  async forgotPassword(req: Request, res: Response) {
    const data = await authService.forgotPassword(req.body.email);
    return sendSuccess(res, data, { message: data.message });
  },

  async resetPassword(req: Request, res: Response) {
    const data = await authService.resetPassword(req.body);
    return sendSuccess(res, data, { message: data.message });
  },

  async google(req: Request, res: Response) {
    const { refreshToken, ...rest } = await authService.googleLogin(req.body.idToken, ctxOf(req));
    setRefresh(res, refreshToken);
    return sendSuccess(res, rest, { message: 'Logged in with Google' });
  },
};

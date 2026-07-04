/**
 * User controller — thin HTTP mapping. Parses the request, delegates to the
 * service, and returns through the standard success envelope.
 */
import type { Request, Response } from 'express';
import { userService } from './user.service';
import { sendSuccess, buildPagination } from '../../utils/ApiResponse';
import { parsePagination } from '../../utils/pagination';

export const userController = {
  async listSkills(_req: Request, res: Response) {
    const items = await userService.listSkills();
    return sendSuccess(res, { items });
  },

  async listInterests(_req: Request, res: Response) {
    const items = await userService.listInterests();
    return sendSuccess(res, { items });
  },

  async getProfile(req: Request, res: Response) {
    const user = await userService.getProfile(req.user!.sub);
    return sendSuccess(res, { user });
  },

  async updateProfile(req: Request, res: Response) {
    const user = await userService.updateProfile(req.user!.sub, req.body);
    return sendSuccess(res, { user }, { message: 'Profile updated' });
  },

  async updateAvatar(req: Request, res: Response) {
    const user = await userService.updateAvatar(req.user!.sub, req.file);
    return sendSuccess(res, { user }, { message: 'Avatar updated' });
  },

  async saveAssessment(req: Request, res: Response) {
    const user = await userService.saveAssessment(req.user!.sub, req.body);
    return sendSuccess(res, { user }, { message: 'Assessment saved' });
  },

  async getDashboard(req: Request, res: Response) {
    const data = await userService.getDashboard(req.user!.sub);
    return sendSuccess(res, data);
  },

  async listBookmarks(req: Request, res: Response) {
    const { page, limit, skip } = parsePagination(req.query);
    const { items, total } = await userService.listBookmarks(req.user!.sub, skip, limit);
    return sendSuccess(res, { items }, { meta: { pagination: buildPagination(page, limit, total) } });
  },

  async createBookmark(req: Request, res: Response) {
    const bookmark = await userService.createBookmark(req.user!.sub, req.body);
    return sendSuccess(res, { bookmark }, { statusCode: 201, message: 'Bookmark added' });
  },

  async deleteBookmark(req: Request, res: Response) {
    const data = await userService.deleteBookmark(req.user!.sub, req.params.id);
    return sendSuccess(res, data, { message: 'Bookmark removed' });
  },

  async listCertificates(req: Request, res: Response) {
    const items = await userService.listCertificates(req.user!.sub);
    return sendSuccess(res, { items });
  },

  async listAchievements(req: Request, res: Response) {
    const items = await userService.listAchievements(req.user!.sub);
    return sendSuccess(res, { items });
  },
};

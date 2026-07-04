/**
 * Notification controller — thin HTTP mapping for in-app notifications.
 */
import type { Request, Response } from 'express';
import { notificationService } from './notification.service';
import { sendSuccess, buildPagination } from '../../utils/ApiResponse';
import { parsePagination } from '../../utils/pagination';

export const notificationController = {
  async list(req: Request, res: Response) {
    const { page, limit, skip } = parsePagination(req.query);
    const { items, total, unreadCount } = await notificationService.list(req.user!.sub, skip, limit);
    return sendSuccess(res, { items }, {
      meta: { pagination: buildPagination(page, limit, total), unreadCount },
    });
  },

  async unreadCount(req: Request, res: Response) {
    const data = await notificationService.unreadCount(req.user!.sub);
    return sendSuccess(res, data);
  },

  async markRead(req: Request, res: Response) {
    const notification = await notificationService.markRead(req.user!.sub, req.params.id);
    return sendSuccess(res, notification, { message: 'Notification marked as read' });
  },

  async markAllRead(req: Request, res: Response) {
    const data = await notificationService.markAllRead(req.user!.sub);
    return sendSuccess(res, data, { message: 'All notifications marked as read' });
  },

  async remove(req: Request, res: Response) {
    const data = await notificationService.remove(req.user!.sub, req.params.id);
    return sendSuccess(res, data, { message: 'Notification deleted' });
  },
};

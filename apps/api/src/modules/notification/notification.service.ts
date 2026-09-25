/**
 * Notification service — business rules for in-app notifications.
 * Also exports a reusable createNotification() helper so other modules can
 * enqueue notifications for a user.
 */
import type { NotificationType } from '@prisma/client';
import { notificationRepository } from './notification.repository';
import { ApiError } from '../../utils/ApiError';

export const notificationService = {
  async list(userId: string, skip: number, take: number) {
    const [items, total, unreadCount] = await Promise.all([
      notificationRepository.findManyByUser(userId, skip, take),
      notificationRepository.countByUser(userId),
      notificationRepository.countUnread(userId),
    ]);
    return { items, total, unreadCount };
  },

  async unreadCount(userId: string) {
    const count = await notificationRepository.countUnread(userId);
    return { count };
  },

  async markRead(userId: string, id: string) {
    const notification = await notificationRepository.findById(id);
    if (!notification) throw ApiError.notFound('Notification not found');
    if (notification.userId !== userId) throw ApiError.forbidden('Not allowed to access this notification');

    return notificationRepository.markRead(id);
  },

  async markAllRead(userId: string) {
    const result = await notificationRepository.markAllRead(userId);
    return { updated: result.count };
  },

  async remove(userId: string, id: string) {
    const notification = await notificationRepository.findById(id);
    if (!notification) throw ApiError.notFound('Notification not found');
    if (notification.userId !== userId) throw ApiError.forbidden('Not allowed to access this notification');

    await notificationRepository.delete(id);
    return { deleted: true };
  },
};

/**
 * Reusable helper for other modules to enqueue an in-app notification.
 */
export async function createNotification(input: {
  userId: string;
  type?: NotificationType;
  title: string;
  body: string;
  link?: string;
}): Promise<void> {
  await notificationRepository.create({
    userId: input.userId,
    type: input.type,
    title: input.title,
    body: input.body,
    link: input.link,
  });
}

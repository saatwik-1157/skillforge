/**
 * Notification repository — the only place notification Prisma queries live.
 */
import type { Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma';

export const notificationRepository = {
  findManyByUser(userId: string, skip: number, take: number) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    });
  },

  countByUser(userId: string) {
    return prisma.notification.count({ where: { userId } });
  },

  countUnread(userId: string) {
    return prisma.notification.count({ where: { userId, isRead: false } });
  },

  findById(id: string) {
    return prisma.notification.findUnique({ where: { id } });
  },

  markRead(id: string) {
    return prisma.notification.update({ where: { id }, data: { isRead: true } });
  },

  markAllRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  },

  delete(id: string) {
    return prisma.notification.delete({ where: { id } });
  },

  create(data: Prisma.NotificationUncheckedCreateInput) {
    return prisma.notification.create({ data });
  },
};

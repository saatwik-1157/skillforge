/**
 * Notification routes — mounted at /notifications.
 */
import { Router } from 'express';
import { notificationController } from './notification.controller';
import { asyncHandler } from '../../utils/asyncHandler';
import { validate } from '../../middleware/validate.middleware';
import { authenticate } from '../../middleware/auth.middleware';
import { listNotificationsSchema, notificationIdParamSchema } from './notification.schema';

export const notificationRouter = Router();

notificationRouter.get(
  '/',
  authenticate,
  validate({ query: listNotificationsSchema }),
  asyncHandler(notificationController.list),
);

notificationRouter.get(
  '/unread-count',
  authenticate,
  asyncHandler(notificationController.unreadCount),
);

notificationRouter.patch(
  '/read-all',
  authenticate,
  asyncHandler(notificationController.markAllRead),
);

notificationRouter.patch(
  '/:id/read',
  authenticate,
  validate({ params: notificationIdParamSchema }),
  asyncHandler(notificationController.markRead),
);

notificationRouter.delete(
  '/:id',
  authenticate,
  validate({ params: notificationIdParamSchema }),
  asyncHandler(notificationController.remove),
);

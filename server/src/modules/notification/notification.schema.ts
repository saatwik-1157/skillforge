/**
 * Zod schemas + inferred DTO types for the notification module.
 */
import { z } from 'zod';

export const listNotificationsSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});

export const notificationIdParamSchema = z.object({
  id: z.string().min(1),
});

export type ListNotificationsDto = z.infer<typeof listNotificationsSchema>;
export type NotificationIdParamDto = z.infer<typeof notificationIdParamSchema>;

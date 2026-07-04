/**
 * Zod schemas + inferred DTO types for the admin module.
 */
import { z } from 'zod';

export const listUsersQuerySchema = z.object({
  q: z.string().trim().min(1).optional(),
  role: z.enum(['VISITOR', 'ENTREPRENEUR', 'MENTOR', 'ADMIN']).optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export const idParamSchema = z.object({
  id: z.string().min(1),
});

export const updateUserSchema = z
  .object({
    isActive: z.boolean().optional(),
    role: z.enum(['VISITOR', 'ENTREPRENEUR', 'MENTOR', 'ADMIN']).optional(),
  })
  .refine((data) => data.isActive !== undefined || data.role !== undefined, {
    message: 'Provide at least one field to update',
  });

export const verifyMentorSchema = z.object({
  status: z.enum(['PENDING', 'VERIFIED', 'REJECTED']),
});

export const contentStatusSchema = z.object({
  status: z.enum(['DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'ARCHIVED']),
});

export const listComplaintsQuerySchema = z.object({
  status: z.enum(['OPEN', 'IN_REVIEW', 'RESOLVED', 'DISMISSED']).optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export const updateComplaintSchema = z.object({
  status: z.enum(['OPEN', 'IN_REVIEW', 'RESOLVED', 'DISMISSED']),
});

export const createAnnouncementSchema = z.object({
  title: z.string().trim().min(2).max(160),
  body: z.string().trim().min(1),
});

export type ListUsersQueryDto = z.infer<typeof listUsersQuerySchema>;
export type UpdateUserDto = z.infer<typeof updateUserSchema>;
export type VerifyMentorDto = z.infer<typeof verifyMentorSchema>;
export type ContentStatusDto = z.infer<typeof contentStatusSchema>;
export type ListComplaintsQueryDto = z.infer<typeof listComplaintsQuerySchema>;
export type UpdateComplaintDto = z.infer<typeof updateComplaintSchema>;
export type CreateAnnouncementDto = z.infer<typeof createAnnouncementSchema>;

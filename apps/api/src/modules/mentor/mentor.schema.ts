/**
 * Zod schemas + inferred DTO types for the mentor module.
 */
import { z } from 'zod';

export const listMentorsQuerySchema = z.object({
  q: z.string().trim().min(1).max(120).optional(),
  expertise: z.string().trim().min(1).max(80).optional(),
  language: z.string().trim().min(1).max(80).optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export const mentorIdParamSchema = z.object({
  id: z.string().min(1),
});

export const sessionIdParamSchema = z.object({
  id: z.string().min(1),
});

export const applyMentorSchema = z.object({
  headline: z.string().trim().min(4).max(160),
  expertise: z.array(z.string().trim().min(1).max(80)).min(1).max(20),
  yearsExperience: z.number().int().min(0).max(80),
  languages: z.array(z.string().trim().min(1).max(80)).min(1).max(20),
  hourlyRate: z.number().int().min(0).max(1000000).optional().default(0),
});

export const bookSessionSchema = z.object({
  scheduledAt: z.coerce.date(),
  durationMin: z.number().int().min(15).max(480).optional().default(30),
  topic: z.string().trim().min(1).max(200).optional(),
});

export const updateSessionStatusSchema = z.object({
  status: z.enum(['REQUESTED', 'CONFIRMED', 'COMPLETED', 'CANCELLED']),
});

export const createReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().min(1).max(2000).optional(),
});

export type ListMentorsQueryDto = z.infer<typeof listMentorsQuerySchema>;
export type ApplyMentorDto = z.infer<typeof applyMentorSchema>;
export type BookSessionDto = z.infer<typeof bookSessionSchema>;
export type UpdateSessionStatusDto = z.infer<typeof updateSessionStatusSchema>;
export type CreateReviewDto = z.infer<typeof createReviewSchema>;

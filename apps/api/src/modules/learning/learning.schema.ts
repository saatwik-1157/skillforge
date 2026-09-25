/**
 * Zod schemas + inferred DTO types for the learning module.
 */
import { z } from 'zod';

export const listResourcesQuerySchema = z.object({
  q: z.string().trim().min(1).max(120).optional(),
  type: z.enum(['VIDEO', 'ARTICLE', 'PDF', 'TEMPLATE', 'WORKSHEET', 'CHECKLIST']).optional(),
  categorySlug: z.string().trim().min(1).max(120).optional(),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});

export const resourceSlugParamsSchema = z.object({
  slug: z.string().trim().min(1),
});

export const resourceIdParamsSchema = z.object({
  id: z.string().trim().min(1),
});

export const lessonProgressParamsSchema = z.object({
  lessonProgressId: z.string().trim().min(1),
});

export const updateLessonProgressSchema = z.object({
  completed: z.boolean(),
});

export type ListResourcesQuery = z.infer<typeof listResourcesQuerySchema>;
export type ResourceSlugParams = z.infer<typeof resourceSlugParamsSchema>;
export type ResourceIdParams = z.infer<typeof resourceIdParamsSchema>;
export type LessonProgressParams = z.infer<typeof lessonProgressParamsSchema>;
export type UpdateLessonProgressDto = z.infer<typeof updateLessonProgressSchema>;

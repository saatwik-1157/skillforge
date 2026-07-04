/**
 * Zod schemas + inferred DTO types for the business module.
 */
import { z } from 'zod';

const businessTypeEnum = z.enum(['HOME', 'ONLINE', 'OFFLINE', 'HYBRID']);
const difficultyEnum = z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']);

/** GET /businesses — catalog listing filters + pagination. */
export const listBusinessQuerySchema = z.object({
  q: z.string().trim().min(1).max(120).optional(),
  categorySlug: z.string().trim().min(1).max(120).optional(),
  businessType: businessTypeEnum.optional(),
  difficulty: difficultyEnum.optional(),
  minBudget: z.coerce.number().int().nonnegative().optional(),
  maxBudget: z.coerce.number().int().nonnegative().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});

/** GET /businesses/:slug — detail params. */
export const businessSlugParamsSchema = z.object({
  slug: z.string().trim().min(1).max(160),
});

/** POST /businesses/recommend — recommendation engine input. */
export const recommendSchema = z.object({
  skillIds: z.array(z.string().min(1)).optional().default([]),
  budget: z.number().int().nonnegative().optional(),
  businessType: businessTypeEnum.optional(),
  interests: z.array(z.string().min(1)).optional().default([]),
});

export type ListBusinessQuery = z.infer<typeof listBusinessQuerySchema>;
export type BusinessSlugParams = z.infer<typeof businessSlugParamsSchema>;
export type RecommendDto = z.infer<typeof recommendSchema>;

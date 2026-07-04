/**
 * Zod schemas + inferred DTO types for the roadmap module.
 */
import { z } from 'zod';

export const businessIdParamSchema = z.object({
  businessId: z.string().min(1),
});

export const roadmapIdParamSchema = z.object({
  roadmapId: z.string().min(1),
});

export const userRoadmapStepIdParamSchema = z.object({
  userRoadmapStepId: z.string().min(1),
});

export const updateStepSchema = z.object({
  status: z.enum(['LOCKED', 'NOT_STARTED', 'IN_PROGRESS', 'COMPLETED']),
});

export type UpdateStepDto = z.infer<typeof updateStepSchema>;

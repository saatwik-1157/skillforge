/**
 * Zod schemas + inferred DTO types for the user module.
 */
import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  bio: z.string().max(500).optional(),
  location: z.string().max(120).optional(),
  phone: z.string().max(20).optional(),
});

export const assessmentSchema = z.object({
  skillIds: z.array(z.string().cuid()).max(50).default([]),
  interestIds: z.array(z.string().cuid()).max(50).default([]),
  budget: z.number().int().min(0).optional(),
  experienceLevel: z.enum(['NONE', 'BEGINNER', 'INTERMEDIATE', 'EXPERIENCED']).optional(),
  availableHours: z.number().int().min(0).max(168).optional(),
  preferredType: z.enum(['HOME', 'ONLINE', 'OFFLINE', 'HYBRID']).optional(),
  businessGoal: z.string().max(500).optional(),
});

export const createBookmarkSchema = z
  .object({
    target: z.enum(['BUSINESS', 'RESOURCE', 'FORUM_POST']),
    businessId: z.string().cuid().optional(),
    resourceId: z.string().cuid().optional(),
    postId: z.string().cuid().optional(),
  })
  .superRefine((val, ctx) => {
    const map = {
      BUSINESS: val.businessId,
      RESOURCE: val.resourceId,
      FORUM_POST: val.postId,
    } as const;
    if (!map[val.target]) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `A matching id is required for target ${val.target}`,
      });
    }
  });

export const idParamSchema = z.object({
  id: z.string().cuid(),
});

export type UpdateProfileDto = z.infer<typeof updateProfileSchema>;
export type AssessmentDto = z.infer<typeof assessmentSchema>;
export type CreateBookmarkDto = z.infer<typeof createBookmarkSchema>;

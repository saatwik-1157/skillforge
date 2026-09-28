/**
 * Zod schemas + inferred DTO types for the community module.
 */
import { z } from 'zod';

const boolFromQuery = z
  .union([z.boolean(), z.string()])
  .transform((v) => v === true || v === 'true' || v === '1');

export const listPostsQuerySchema = z.object({
  q: z.string().trim().min(1).max(120).optional(),
  tag: z.string().trim().min(1).max(60).optional(),
  isStory: boolFromQuery.optional(),
  sort: z.enum(['recent', 'trending']).optional().default('recent'),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export const postSlugParamsSchema = z.object({
  slug: z.string().trim().min(1),
});

export const postIdParamsSchema = z.object({
  id: z.string().trim().min(1),
});

export const createPostSchema = z.object({
  title: z.string().trim().min(4).max(160),
  body: z.string().trim().min(1),
  tags: z.array(z.string().trim().min(1).max(60)).max(10).optional().default([]),
  isStory: z.boolean().optional().default(false),
});

export const createCommentSchema = z.object({
  body: z.string().trim().min(1).max(5000),
  parentId: z.string().trim().min(1).optional(),
});

export const trendingTagsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).optional().default(10),
});

export type ListPostsQuery = z.infer<typeof listPostsQuerySchema>;
export type PostSlugParams = z.infer<typeof postSlugParamsSchema>;
export type PostIdParams = z.infer<typeof postIdParamsSchema>;
export type CreatePostDto = z.infer<typeof createPostSchema>;
export type CreateCommentDto = z.infer<typeof createCommentSchema>;
export type TrendingTagsQuery = z.infer<typeof trendingTagsQuerySchema>;

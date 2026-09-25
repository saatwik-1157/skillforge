/**
 * Community routes — mounted at /api/v1/community.
 * Owns forum posts, comments and likes.
 */
import { Router } from 'express';
import { communityController } from './community.controller';
import { asyncHandler } from '../../utils/asyncHandler';
import { validate } from '../../middleware/validate.middleware';
import { authenticate, optionalAuth } from '../../middleware/auth.middleware';
import {
  listPostsQuerySchema,
  postSlugParamsSchema,
  postIdParamsSchema,
  createPostSchema,
  createCommentSchema,
  trendingTagsQuerySchema,
} from './community.schema';

export const communityRouter = Router();

communityRouter.get(
  '/posts',
  optionalAuth,
  validate({ query: listPostsQuerySchema }),
  asyncHandler(communityController.listPosts),
);

communityRouter.get(
  '/tags/trending',
  optionalAuth,
  validate({ query: trendingTagsQuerySchema }),
  asyncHandler(communityController.trendingTags),
);

communityRouter.get(
  '/posts/:slug',
  optionalAuth,
  validate({ params: postSlugParamsSchema }),
  asyncHandler(communityController.getPost),
);

communityRouter.post(
  '/posts',
  authenticate,
  validate({ body: createPostSchema }),
  asyncHandler(communityController.createPost),
);

communityRouter.post(
  '/posts/:id/comments',
  authenticate,
  validate({ params: postIdParamsSchema, body: createCommentSchema }),
  asyncHandler(communityController.addComment),
);

communityRouter.post(
  '/posts/:id/like',
  authenticate,
  validate({ params: postIdParamsSchema }),
  asyncHandler(communityController.toggleLike),
);

communityRouter.delete(
  '/posts/:id',
  authenticate,
  validate({ params: postIdParamsSchema }),
  asyncHandler(communityController.deletePost),
);

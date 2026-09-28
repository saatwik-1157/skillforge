/**
 * Business routes — mounted at /api/v1/businesses.
 */
import { Router } from 'express';
import { businessController } from './business.controller';
import { asyncHandler } from '../../utils/asyncHandler';
import { validate } from '../../middleware/validate.middleware';
import { optionalAuth } from '../../middleware/auth.middleware';
import {
  listBusinessQuerySchema,
  businessSlugParamsSchema,
  recommendSchema,
} from './business.schema';

export const businessRouter = Router();

businessRouter.get(
  '/',
  optionalAuth,
  validate({ query: listBusinessQuerySchema }),
  asyncHandler(businessController.list),
);

businessRouter.get('/categories', asyncHandler(businessController.categories));

businessRouter.post(
  '/recommend',
  optionalAuth,
  validate({ body: recommendSchema }),
  asyncHandler(businessController.recommend),
);

businessRouter.get(
  '/:slug',
  optionalAuth,
  validate({ params: businessSlugParamsSchema }),
  asyncHandler(businessController.detail),
);

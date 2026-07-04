/**
 * Roadmap routes — mounted at /api/v1/roadmaps.
 */
import { Router } from 'express';
import { roadmapController } from './roadmap.controller';
import { asyncHandler } from '../../utils/asyncHandler';
import { validate } from '../../middleware/validate.middleware';
import { authenticate, optionalAuth } from '../../middleware/auth.middleware';
import {
  businessIdParamSchema,
  roadmapIdParamSchema,
  userRoadmapStepIdParamSchema,
  updateStepSchema,
} from './roadmap.schema';

export const roadmapRouter = Router();

roadmapRouter.get(
  '/business/:businessId',
  optionalAuth,
  validate({ params: businessIdParamSchema }),
  asyncHandler(roadmapController.getBusinessRoadmap),
);

roadmapRouter.post(
  '/:roadmapId/start',
  authenticate,
  validate({ params: roadmapIdParamSchema }),
  asyncHandler(roadmapController.start),
);

roadmapRouter.get('/me', authenticate, asyncHandler(roadmapController.listMine));

roadmapRouter.get(
  '/me/:roadmapId',
  authenticate,
  validate({ params: roadmapIdParamSchema }),
  asyncHandler(roadmapController.getMine),
);

roadmapRouter.patch(
  '/me/steps/:userRoadmapStepId',
  authenticate,
  validate({ params: userRoadmapStepIdParamSchema, body: updateStepSchema }),
  asyncHandler(roadmapController.updateStep),
);

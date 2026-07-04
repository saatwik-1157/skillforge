/**
 * Learning routes — mounted at /api/v1/learning.
 */
import { Router } from 'express';
import { learningController } from './learning.controller';
import { asyncHandler } from '../../utils/asyncHandler';
import { validate } from '../../middleware/validate.middleware';
import { authenticate, optionalAuth } from '../../middleware/auth.middleware';
import {
  listResourcesQuerySchema,
  resourceSlugParamsSchema,
  resourceIdParamsSchema,
  lessonProgressParamsSchema,
  updateLessonProgressSchema,
} from './learning.schema';

export const learningRouter = Router();

// --- Public / optionally-authenticated resource browsing ---
learningRouter.get(
  '/resources',
  optionalAuth,
  validate({ query: listResourcesQuerySchema }),
  asyncHandler(learningController.listResources)
);

learningRouter.get(
  '/resources/:slug',
  optionalAuth,
  validate({ params: resourceSlugParamsSchema }),
  asyncHandler(learningController.getResource)
);

// --- Enrollment ---
learningRouter.post(
  '/resources/:id/enroll',
  authenticate,
  validate({ params: resourceIdParamsSchema }),
  asyncHandler(learningController.enroll)
);

// --- Authenticated "me" endpoints ---
learningRouter.get(
  '/me/enrollments',
  authenticate,
  asyncHandler(learningController.myEnrollments)
);

learningRouter.patch(
  '/me/lessons/:lessonProgressId',
  authenticate,
  validate({ params: lessonProgressParamsSchema, body: updateLessonProgressSchema }),
  asyncHandler(learningController.updateLessonProgress)
);

learningRouter.get(
  '/me/certificates',
  authenticate,
  asyncHandler(learningController.myCertificates)
);

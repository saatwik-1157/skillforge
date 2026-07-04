/**
 * Mentor routes — mounted at /api/v1/mentors.
 */
import { Router } from 'express';
import { mentorController } from './mentor.controller';
import { asyncHandler } from '../../utils/asyncHandler';
import { validate } from '../../middleware/validate.middleware';
import { authenticate, optionalAuth } from '../../middleware/auth.middleware';
import {
  listMentorsQuerySchema,
  mentorIdParamSchema,
  sessionIdParamSchema,
  applyMentorSchema,
  bookSessionSchema,
  updateSessionStatusSchema,
  createReviewSchema,
} from './mentor.schema';

export const mentorRouter = Router();

mentorRouter.get(
  '/',
  optionalAuth,
  validate({ query: listMentorsQuerySchema }),
  asyncHandler(mentorController.list),
);

mentorRouter.post(
  '/apply',
  authenticate,
  validate({ body: applyMentorSchema }),
  asyncHandler(mentorController.apply),
);

mentorRouter.get(
  '/me/sessions',
  authenticate,
  asyncHandler(mentorController.mySessions),
);

mentorRouter.get(
  '/me/dashboard',
  authenticate,
  asyncHandler(mentorController.dashboard),
);

mentorRouter.patch(
  '/sessions/:id/status',
  authenticate,
  validate({ params: sessionIdParamSchema, body: updateSessionStatusSchema }),
  asyncHandler(mentorController.updateStatus),
);

mentorRouter.post(
  '/sessions/:id/review',
  authenticate,
  validate({ params: sessionIdParamSchema, body: createReviewSchema }),
  asyncHandler(mentorController.review),
);

mentorRouter.get(
  '/:id',
  optionalAuth,
  validate({ params: mentorIdParamSchema }),
  asyncHandler(mentorController.getById),
);

mentorRouter.post(
  '/:id/book',
  authenticate,
  validate({ params: mentorIdParamSchema, body: bookSessionSchema }),
  asyncHandler(mentorController.book),
);

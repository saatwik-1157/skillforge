/**
 * User routes — mounted at /api/v1/users.
 */
import { Router } from 'express';
import multer from 'multer';
import { userController } from './user.controller';
import { asyncHandler } from '../../utils/asyncHandler';
import { validate } from '../../middleware/validate.middleware';
import { authenticate } from '../../middleware/auth.middleware';
import {
  updateProfileSchema,
  assessmentSchema,
  createBookmarkSchema,
  idParamSchema,
} from './user.schema';

const upload = multer({ storage: multer.memoryStorage() });

export const userRouter = Router();

// --- public catalogs (no auth) ---
userRouter.get('/skills', asyncHandler(userController.listSkills));
userRouter.get('/interests', asyncHandler(userController.listInterests));

// --- current user profile ---
userRouter.get('/me/profile', authenticate, asyncHandler(userController.getProfile));
userRouter.put(
  '/me/profile',
  authenticate,
  validate({ body: updateProfileSchema }),
  asyncHandler(userController.updateProfile),
);
userRouter.post(
  '/me/avatar',
  authenticate,
  upload.single('file'),
  asyncHandler(userController.updateAvatar),
);
userRouter.put(
  '/me/assessment',
  authenticate,
  validate({ body: assessmentSchema }),
  asyncHandler(userController.saveAssessment),
);

// --- dashboard ---
userRouter.get('/me/dashboard', authenticate, asyncHandler(userController.getDashboard));

// --- bookmarks ---
userRouter.get('/me/bookmarks', authenticate, asyncHandler(userController.listBookmarks));
userRouter.post(
  '/me/bookmarks',
  authenticate,
  validate({ body: createBookmarkSchema }),
  asyncHandler(userController.createBookmark),
);
userRouter.delete(
  '/me/bookmarks/:id',
  authenticate,
  validate({ params: idParamSchema }),
  asyncHandler(userController.deleteBookmark),
);

// --- certificates & achievements ---
userRouter.get('/me/certificates', authenticate, asyncHandler(userController.listCertificates));
userRouter.get('/me/achievements', authenticate, asyncHandler(userController.listAchievements));

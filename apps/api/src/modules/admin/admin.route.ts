/**
 * Admin routes — mounted at /api/v1/admin.
 * Every route requires an authenticated ADMIN.
 */
import { Router } from 'express';
import { adminController } from './admin.controller';
import { asyncHandler } from '../../utils/asyncHandler';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/rbac.middleware';
import { validate } from '../../middleware/validate.middleware';
import {
  listUsersQuerySchema,
  idParamSchema,
  updateUserSchema,
  verifyMentorSchema,
  contentStatusSchema,
  listComplaintsQuerySchema,
  updateComplaintSchema,
  createAnnouncementSchema,
} from './admin.schema';

export const adminRouter = Router();

// All admin routes require an authenticated ADMIN.
adminRouter.use(authenticate, requireRole('ADMIN'));

// --- overview / analytics ---
adminRouter.get('/overview', asyncHandler(adminController.overview));

// --- users ---
adminRouter.get(
  '/users',
  validate({ query: listUsersQuerySchema }),
  asyncHandler(adminController.listUsers),
);
adminRouter.patch(
  '/users/:id',
  validate({ params: idParamSchema, body: updateUserSchema }),
  asyncHandler(adminController.updateUser),
);

// --- mentors ---
adminRouter.get('/mentors/pending', asyncHandler(adminController.pendingMentors));
adminRouter.patch(
  '/mentors/:id/verify',
  validate({ params: idParamSchema, body: verifyMentorSchema }),
  asyncHandler(adminController.verifyMentor),
);

// --- content moderation ---
adminRouter.patch(
  '/content/business/:id/status',
  validate({ params: idParamSchema, body: contentStatusSchema }),
  asyncHandler(adminController.updateBusinessStatus),
);
adminRouter.patch(
  '/content/resource/:id/status',
  validate({ params: idParamSchema, body: contentStatusSchema }),
  asyncHandler(adminController.updateResourceStatus),
);

// --- complaints ---
adminRouter.get(
  '/complaints',
  validate({ query: listComplaintsQuerySchema }),
  asyncHandler(adminController.listComplaints),
);
adminRouter.patch(
  '/complaints/:id',
  validate({ params: idParamSchema, body: updateComplaintSchema }),
  asyncHandler(adminController.updateComplaint),
);

// --- announcements ---
adminRouter.get('/announcements', asyncHandler(adminController.listAnnouncements));
adminRouter.post(
  '/announcements',
  validate({ body: createAnnouncementSchema }),
  asyncHandler(adminController.createAnnouncement),
);
adminRouter.delete(
  '/announcements/:id',
  validate({ params: idParamSchema }),
  asyncHandler(adminController.deleteAnnouncement),
);

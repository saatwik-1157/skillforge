/**
 * API v1 aggregate router. Every feature module exports a named Router that is
 * mounted here under its resource path.
 */
import { Router } from 'express';
import { authRouter } from '../modules/auth/auth.route';
import { userRouter } from '../modules/user/user.route';
import { businessRouter } from '../modules/business/business.route';
import { roadmapRouter } from '../modules/roadmap/roadmap.route';
import { learningRouter } from '../modules/learning/learning.route';
import { mentorRouter } from '../modules/mentor/mentor.route';
import { communityRouter } from '../modules/community/community.route';
import { notificationRouter } from '../modules/notification/notification.route';
import { adminRouter } from '../modules/admin/admin.route';

export const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/users', userRouter);
apiRouter.use('/businesses', businessRouter);
apiRouter.use('/roadmaps', roadmapRouter);
apiRouter.use('/learning', learningRouter);
apiRouter.use('/mentors', mentorRouter);
apiRouter.use('/community', communityRouter);
apiRouter.use('/notifications', notificationRouter);
apiRouter.use('/admin', adminRouter);

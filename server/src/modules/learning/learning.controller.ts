/**
 * Learning controller — thin HTTP mapping. Parses the request, delegates to
 * the service, and returns through the standard success envelope.
 */
import type { Request, Response } from 'express';
import { learningService } from './learning.service';
import { sendSuccess, buildPagination } from '../../utils/ApiResponse';

export const learningController = {
  async listResources(req: Request, res: Response) {
    const { items, page, limit, total } = await learningService.listResources(req.query as never);
    return sendSuccess(res, { items }, {
      meta: { pagination: buildPagination(page, limit, total) },
    });
  },

  async getResource(req: Request, res: Response) {
    const resource = await learningService.getResourceBySlug(req.params.slug);
    return sendSuccess(res, { resource });
  },

  async enroll(req: Request, res: Response) {
    const { enrollment, alreadyEnrolled } = await learningService.enroll(
      req.user!.sub,
      req.params.id
    );
    return sendSuccess(res, { enrollment }, {
      statusCode: alreadyEnrolled ? 200 : 201,
      message: alreadyEnrolled ? 'Already enrolled' : 'Enrolled successfully',
    });
  },

  async myEnrollments(req: Request, res: Response) {
    const { items } = await learningService.listMyEnrollments(req.user!.sub);
    return sendSuccess(res, { items });
  },

  async updateLessonProgress(req: Request, res: Response) {
    const { enrollment, certificate } = await learningService.updateLessonProgress(
      req.user!.sub,
      req.params.lessonProgressId,
      req.body
    );
    return sendSuccess(res, { enrollment, certificate }, { message: 'Progress updated' });
  },

  async myCertificates(req: Request, res: Response) {
    const { items } = await learningService.listMyCertificates(req.user!.sub);
    return sendSuccess(res, { items });
  },
};

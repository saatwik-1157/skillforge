/**
 * Mentor controller — thin HTTP mapping. Parses the request, delegates to the
 * service, and returns through the shared success envelope.
 */
import type { Request, Response } from 'express';
import { mentorService } from './mentor.service';
import { sendSuccess, buildPagination } from '../../utils/ApiResponse';
import { parsePagination } from '../../utils/pagination';

export const mentorController = {
  async list(req: Request, res: Response) {
    const page = parsePagination(req.query);
    const { items, total } = await mentorService.list(req.query as never, page);
    return sendSuccess(res, { items }, {
      meta: { pagination: buildPagination(page.page, page.limit, total) },
    });
  },

  async getById(req: Request, res: Response) {
    const profile = await mentorService.getById(req.params.id);
    return sendSuccess(res, { mentor: profile });
  },

  async apply(req: Request, res: Response) {
    const profile = await mentorService.apply(req.user!.sub, req.body);
    return sendSuccess(res, { mentor: profile }, {
      statusCode: 201,
      message: 'Mentor application submitted and pending verification',
    });
  },

  async book(req: Request, res: Response) {
    const session = await mentorService.book(req.params.id, req.user!.sub, req.body);
    return sendSuccess(res, { session }, {
      statusCode: 201,
      message: 'Session requested',
    });
  },

  async mySessions(req: Request, res: Response) {
    const data = await mentorService.mySessions(req.user!.sub);
    return sendSuccess(res, data);
  },

  async updateStatus(req: Request, res: Response) {
    const session = await mentorService.updateStatus(req.params.id, req.user!.sub, req.body);
    return sendSuccess(res, { session }, { message: 'Session updated' });
  },

  async review(req: Request, res: Response) {
    const review = await mentorService.review(req.params.id, req.user!.sub, req.body);
    return sendSuccess(res, { review }, {
      statusCode: 201,
      message: 'Review submitted',
    });
  },

  async dashboard(req: Request, res: Response) {
    const data = await mentorService.dashboard(req.user!.sub);
    return sendSuccess(res, data);
  },
};

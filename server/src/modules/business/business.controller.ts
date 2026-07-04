/**
 * Business controller — thin HTTP mapping onto the business service.
 */
import type { Request, Response } from 'express';
import { businessService } from './business.service';
import { sendSuccess, buildPagination } from '../../utils/ApiResponse';

export const businessController = {
  async list(req: Request, res: Response) {
    const { items, page, limit, total } = await businessService.list(req.query as never);
    return sendSuccess(res, { items }, {
      message: 'Businesses fetched',
      meta: { pagination: buildPagination(page, limit, total) },
    });
  },

  async categories(_req: Request, res: Response) {
    const items = await businessService.listCategories();
    return sendSuccess(res, { items }, { message: 'Categories fetched' });
  },

  async detail(req: Request, res: Response) {
    const business = await businessService.getBySlug(req.params.slug);
    return sendSuccess(res, { business });
  },

  async recommend(req: Request, res: Response) {
    const items = await businessService.recommend(req.body, req.user?.sub);
    return sendSuccess(res, { items }, { message: 'Recommendations generated' });
  },
};

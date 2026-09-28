/**
 * Roadmap controller — thin HTTP mapping. Parses the request, delegates to the
 * service, and returns through sendSuccess.
 */
import type { Request, Response } from 'express';
import { roadmapService } from './roadmap.service';
import { sendSuccess } from '../../utils/ApiResponse';

export const roadmapController = {
  async getBusinessRoadmap(req: Request, res: Response) {
    const roadmap = await roadmapService.getBusinessRoadmap(req.params.businessId);
    return sendSuccess(res, { roadmap });
  },

  async start(req: Request, res: Response) {
    const userRoadmap = await roadmapService.startRoadmap(
      req.user!.sub,
      req.params.roadmapId,
    );
    return sendSuccess(res, { userRoadmap }, {
      statusCode: 201,
      message: 'Roadmap started',
    });
  },

  async listMine(req: Request, res: Response) {
    const items = await roadmapService.listMyRoadmaps(req.user!.sub);
    return sendSuccess(res, { items });
  },

  async getMine(req: Request, res: Response) {
    const userRoadmap = await roadmapService.getMyRoadmap(
      req.user!.sub,
      req.params.roadmapId,
    );
    return sendSuccess(res, { userRoadmap });
  },

  async updateStep(req: Request, res: Response) {
    const data = await roadmapService.updateStepStatus(
      req.user!.sub,
      req.params.userRoadmapStepId,
      req.body,
    );
    return sendSuccess(res, data, { message: 'Step updated' });
  },
};

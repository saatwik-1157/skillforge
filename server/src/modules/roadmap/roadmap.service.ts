/**
 * Roadmap service — business rules for business roadmaps and per-user progress.
 * Never touches req/res.
 */
import { roadmapRepository } from './roadmap.repository';
import { ApiError } from '../../utils/ApiError';
import type { UpdateStepDto } from './roadmap.schema';

/** Recompute progress percentage and completion timestamp for a UserRoadmap. */
async function recomputeProgress(userRoadmapId: string) {
  const total = await roadmapRepository.countStepsForUserRoadmap(userRoadmapId);
  const completed =
    await roadmapRepository.countCompletedStepsForUserRoadmap(userRoadmapId);

  const progress = total === 0 ? 0 : Math.round((completed / total) * 100);
  const completedAt = progress === 100 ? new Date() : null;

  await roadmapRepository.updateUserRoadmap(userRoadmapId, {
    progress,
    completedAt,
  });

  return { progress, completedAt, total, completed };
}

export const roadmapService = {
  async getBusinessRoadmap(businessId: string) {
    const roadmap = await roadmapRepository.findRoadmapByBusinessId(businessId);
    if (!roadmap) throw ApiError.notFound('No roadmap found for this business');
    return roadmap;
  },

  async startRoadmap(userId: string, roadmapId: string) {
    const roadmap = await roadmapRepository.findRoadmapById(roadmapId);
    if (!roadmap) throw ApiError.notFound('Roadmap not found');

    // Idempotent: return existing if the user already started this roadmap.
    const existing = await roadmapRepository.findUserRoadmap(userId, roadmapId);
    if (existing) {
      return roadmapRepository.findUserRoadmapDetail(userId, roadmapId);
    }

    await roadmapRepository.startUserRoadmap(
      userId,
      roadmapId,
      roadmap.steps.map((s) => ({ id: s.id, order: s.order })),
    );

    return roadmapRepository.findUserRoadmapDetail(userId, roadmapId);
  },

  async listMyRoadmaps(userId: string) {
    return roadmapRepository.listUserRoadmaps(userId);
  },

  async getMyRoadmap(userId: string, roadmapId: string) {
    const detail = await roadmapRepository.findUserRoadmapDetail(userId, roadmapId);
    if (!detail) throw ApiError.notFound('You have not started this roadmap');
    return detail;
  },

  async updateStepStatus(
    userId: string,
    userRoadmapStepId: string,
    dto: UpdateStepDto,
  ) {
    const step = await roadmapRepository.findUserRoadmapStep(userRoadmapStepId);
    if (!step) throw ApiError.notFound('Step not found');
    if (step.userRoadmap.userId !== userId) {
      throw ApiError.forbidden('This step does not belong to you');
    }

    const completedAt = dto.status === 'COMPLETED' ? new Date() : null;
    await roadmapRepository.updateUserRoadmapStep(userRoadmapStepId, {
      status: dto.status,
      completedAt,
    });

    const { progress, completedAt: roadmapCompletedAt } = await recomputeProgress(
      step.userRoadmapId,
    );

    return {
      step: { id: userRoadmapStepId, status: dto.status, completedAt },
      progress,
      completedAt: roadmapCompletedAt,
    };
  },
};

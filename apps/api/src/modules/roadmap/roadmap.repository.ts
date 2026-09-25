/**
 * Roadmap repository — the only place roadmap-related Prisma queries live.
 */
import type { Prisma, RoadmapStepStatus } from '@prisma/client';
import { prisma } from '../../config/prisma';

export const roadmapRepository = {
  // --- roadmaps ---
  findRoadmapByBusinessId(businessId: string) {
    return prisma.roadmap.findUnique({
      where: { businessId },
      include: {
        steps: { orderBy: { order: 'asc' } },
      },
    });
  },

  findRoadmapById(roadmapId: string) {
    return prisma.roadmap.findUnique({
      where: { id: roadmapId },
      include: {
        steps: { orderBy: { order: 'asc' } },
      },
    });
  },

  // --- user roadmaps ---
  findUserRoadmap(userId: string, roadmapId: string) {
    return prisma.userRoadmap.findUnique({
      where: { userId_roadmapId: { userId, roadmapId } },
    });
  },

  listUserRoadmaps(userId: string) {
    return prisma.userRoadmap.findMany({
      where: { userId },
      orderBy: { startedAt: 'desc' },
      include: {
        roadmap: {
          include: {
            business: { select: { id: true, title: true, slug: true } },
          },
        },
      },
    });
  },

  findUserRoadmapDetail(userId: string, roadmapId: string) {
    return prisma.userRoadmap.findUnique({
      where: { userId_roadmapId: { userId, roadmapId } },
      include: {
        roadmap: {
          include: {
            business: { select: { id: true, title: true, slug: true } },
          },
        },
        steps: {
          include: { step: true },
          orderBy: { step: { order: 'asc' } },
        },
      },
    });
  },

  updateUserRoadmap(id: string, data: Prisma.UserRoadmapUpdateInput) {
    return prisma.userRoadmap.update({ where: { id }, data });
  },

  /**
   * Idempotently create a UserRoadmap + a UserRoadmapStep for every RoadmapStep
   * inside a single transaction. First step starts IN_PROGRESS, the rest
   * NOT_STARTED.
   */
  startUserRoadmap(
    userId: string,
    roadmapId: string,
    steps: { id: string; order: number }[],
  ) {
    return prisma.$transaction(async (tx) => {
      const userRoadmap = await tx.userRoadmap.create({
        data: { userId, roadmapId },
      });

      const firstOrder = steps.length
        ? Math.min(...steps.map((s) => s.order))
        : null;

      await tx.userRoadmapStep.createMany({
        data: steps.map((s) => ({
          userRoadmapId: userRoadmap.id,
          stepId: s.id,
          status:
            s.order === firstOrder
              ? ('IN_PROGRESS' as RoadmapStepStatus)
              : ('NOT_STARTED' as RoadmapStepStatus),
        })),
      });

      return userRoadmap.id;
    });
  },

  // --- user roadmap steps ---
  findUserRoadmapStep(id: string) {
    return prisma.userRoadmapStep.findUnique({
      where: { id },
      include: {
        userRoadmap: true,
      },
    });
  },

  updateUserRoadmapStep(id: string, data: Prisma.UserRoadmapStepUpdateInput) {
    return prisma.userRoadmapStep.update({ where: { id }, data });
  },

  countStepsForUserRoadmap(userRoadmapId: string) {
    return prisma.userRoadmapStep.count({ where: { userRoadmapId } });
  },

  countCompletedStepsForUserRoadmap(userRoadmapId: string) {
    return prisma.userRoadmapStep.count({
      where: { userRoadmapId, status: 'COMPLETED' },
    });
  },
};

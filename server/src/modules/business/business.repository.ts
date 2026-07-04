/**
 * Business repository — the only place business-related Prisma queries live.
 */
import type { Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma';

export const businessRepository = {
  /** Paginated list of published businesses matching the given filters. */
  async listPublished(where: Prisma.BusinessWhereInput, skip: number, take: number) {
    const [items, total] = await Promise.all([
      prisma.business.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          category: true,
          requiredSkills: { include: { skill: true } },
        },
      }),
      prisma.business.count({ where }),
    ]);
    return { items, total };
  },

  /** Full detail for a single published business by slug. */
  findPublishedBySlug(slug: string) {
    return prisma.business.findFirst({
      where: { slug, status: 'PUBLISHED' },
      include: {
        category: true,
        requiredSkills: { include: { skill: true } },
        roadmap: {
          include: {
            steps: { orderBy: { order: 'asc' } },
          },
        },
      },
    });
  },

  /** Categories with a count of their published businesses. */
  listCategoriesWithCounts() {
    return prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { businesses: { where: { status: 'PUBLISHED' } } },
        },
      },
    });
  },

  /** Every published business with its weighted required skills — used by the recommender. */
  listPublishedForScoring() {
    return prisma.business.findMany({
      where: { status: 'PUBLISHED' },
      include: {
        category: true,
        requiredSkills: { include: { skill: true } },
      },
    });
  },

  /** The user's saved assessment inputs (skill ids + budget) for auto-derived recommendations. */
  async findUserAssessment(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        budget: true,
        preferredType: true,
        skills: { select: { skillId: true } },
        interests: { select: { interestId: true } },
      },
    });
    if (!user) return null;
    return {
      budget: user.budget ?? undefined,
      preferredType: user.preferredType ?? undefined,
      skillIds: user.skills.map((s) => s.skillId),
      interestIds: user.interests.map((i) => i.interestId),
    };
  },
};

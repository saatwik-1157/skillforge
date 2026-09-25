/**
 * User repository — the only place user-module Prisma queries live.
 */
import type { Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma';

export const userRepository = {
  // --- catalogs ---
  listSkills() {
    return prisma.skill.findMany({
      select: { id: true, name: true, slug: true, icon: true },
      orderBy: { name: 'asc' },
    });
  },

  listInterests() {
    return prisma.interest.findMany({
      select: { id: true, name: true, slug: true },
      orderBy: { name: 'asc' },
    });
  },

  // --- profile ---
  findProfile(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      include: {
        skills: { include: { skill: true } },
        interests: { include: { interest: true } },
      },
    });
  },

  findById(userId: string) {
    return prisma.user.findUnique({ where: { id: userId } });
  },

  updateUser(userId: string, data: Prisma.UserUpdateInput) {
    return prisma.user.update({ where: { id: userId }, data });
  },

  countUserSkills(userId: string) {
    return prisma.userSkill.count({ where: { userId } });
  },

  // --- assessment (transactional replace of join rows + persist scores) ---
  async applyAssessment(
    userId: string,
    args: {
      skillIds: string[];
      interestIds: string[];
      scalar: Prisma.UserUpdateInput;
    },
  ) {
    return prisma.$transaction(async (tx) => {
      await tx.userSkill.deleteMany({ where: { userId } });
      await tx.userInterest.deleteMany({ where: { userId } });

      if (args.skillIds.length) {
        await tx.userSkill.createMany({
          data: args.skillIds.map((skillId) => ({ userId, skillId })),
          skipDuplicates: true,
        });
      }
      if (args.interestIds.length) {
        await tx.userInterest.createMany({
          data: args.interestIds.map((interestId) => ({ userId, interestId })),
          skipDuplicates: true,
        });
      }

      return tx.user.update({
        where: { id: userId },
        data: args.scalar,
        include: {
          skills: { include: { skill: true } },
          interests: { include: { interest: true } },
        },
      });
    });
  },

  // --- dashboard aggregates ---
  countBookmarks(userId: string) {
    return prisma.bookmark.count({ where: { userId } });
  },

  countEnrollments(userId: string, status: 'IN_PROGRESS' | 'COMPLETED') {
    return prisma.enrollment.count({ where: { userId, status } });
  },

  findUserRoadmaps(userId: string) {
    return prisma.userRoadmap.findMany({
      where: { userId },
      include: { roadmap: { select: { id: true, title: true, businessId: true } } },
      orderBy: { startedAt: 'desc' },
    });
  },

  countCertificates(userId: string) {
    return prisma.certificate.count({ where: { userId } });
  },

  countAchievements(userId: string) {
    return prisma.userAchievement.count({ where: { userId } });
  },

  findUpcomingSessions(userId: string, now: Date, take: number) {
    return prisma.mentorSession.findMany({
      where: {
        entrepreneurId: userId,
        status: 'CONFIRMED',
        scheduledAt: { gte: now },
      },
      orderBy: { scheduledAt: 'asc' },
      take,
      include: {
        mentor: { include: { user: { select: { id: true, name: true, avatarUrl: true } } } },
      },
    });
  },

  // --- bookmarks ---
  listBookmarks(userId: string, skip: number, take: number) {
    return prisma.bookmark.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: {
        business: { select: { id: true, title: true, slug: true, tagline: true, coverImage: true } },
        resource: { select: { id: true, title: true, slug: true, type: true, thumbnail: true } },
        post: { select: { id: true, title: true, slug: true } },
      },
    });
  },

  countBookmarksList(userId: string) {
    return prisma.bookmark.count({ where: { userId } });
  },

  findExistingBookmark(userId: string, where: Prisma.BookmarkWhereInput) {
    return prisma.bookmark.findFirst({ where: { userId, ...where } });
  },

  createBookmark(data: Prisma.BookmarkUncheckedCreateInput) {
    return prisma.bookmark.create({ data });
  },

  findBookmarkById(id: string) {
    return prisma.bookmark.findUnique({ where: { id } });
  },

  deleteBookmark(id: string) {
    return prisma.bookmark.delete({ where: { id } });
  },

  // --- certificates & achievements ---
  listCertificates(userId: string) {
    return prisma.certificate.findMany({
      where: { userId },
      orderBy: { issuedAt: 'desc' },
      include: { resource: { select: { id: true, title: true, slug: true } } },
    });
  },

  listAchievements(userId: string) {
    return prisma.userAchievement.findMany({
      where: { userId },
      orderBy: { unlockedAt: 'desc' },
      include: { achievement: true },
    });
  },
};

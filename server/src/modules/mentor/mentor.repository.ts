/**
 * Mentor repository — the only place mentor-related Prisma queries live.
 */
import type { Prisma, SessionStatus } from '@prisma/client';
import { prisma } from '../../config/prisma';

const userCard = { id: true, name: true, avatarUrl: true } as const;

export const mentorRepository = {
  // --- profiles ---
  countVerifiedProfiles(where: Prisma.MentorProfileWhereInput) {
    return prisma.mentorProfile.count({ where });
  },

  listVerifiedProfiles(where: Prisma.MentorProfileWhereInput, skip: number, take: number) {
    return prisma.mentorProfile.findMany({
      where,
      include: { user: { select: userCard } },
      orderBy: [{ ratingAvg: 'desc' }, { ratingCount: 'desc' }],
      skip,
      take,
    });
  },

  findProfileById(id: string) {
    return prisma.mentorProfile.findUnique({
      where: { id },
      include: {
        user: { select: userCard },
        reviews: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: { author: { select: userCard } },
        },
      },
    });
  },

  findProfileByUserId(userId: string) {
    return prisma.mentorProfile.findUnique({ where: { userId } });
  },

  // --- sessions ---
  findSessionById(id: string) {
    return prisma.mentorSession.findUnique({ where: { id } });
  },

  createSession(data: Prisma.MentorSessionUncheckedCreateInput) {
    return prisma.mentorSession.create({
      data,
      include: {
        mentor: { include: { user: { select: userCard } } },
        entrepreneur: { select: userCard },
      },
    });
  },

  updateSessionStatus(id: string, status: SessionStatus) {
    return prisma.mentorSession.update({
      where: { id },
      data: { status },
      include: {
        mentor: { include: { user: { select: userCard } } },
        entrepreneur: { select: userCard },
      },
    });
  },

  listSessionsAsEntrepreneur(entrepreneurId: string) {
    return prisma.mentorSession.findMany({
      where: { entrepreneurId },
      orderBy: { scheduledAt: 'desc' },
      include: {
        mentor: { include: { user: { select: userCard } } },
        entrepreneur: { select: userCard },
      },
    });
  },

  listSessionsAsMentor(mentorId: string) {
    return prisma.mentorSession.findMany({
      where: { mentorId },
      orderBy: { scheduledAt: 'desc' },
      include: {
        mentor: { include: { user: { select: userCard } } },
        entrepreneur: { select: userCard },
      },
    });
  },

  // --- reviews ---
  findReviewBySessionId(sessionId: string) {
    return prisma.mentorReview.findUnique({ where: { sessionId } });
  },

  // --- dashboard aggregates ---
  groupSessionsByStatus(mentorId: string) {
    return prisma.mentorSession.groupBy({
      by: ['status'],
      where: { mentorId },
      _count: { _all: true },
    });
  },

  distinctEntrepreneurIds(mentorId: string) {
    return prisma.mentorSession.findMany({
      where: { mentorId },
      distinct: ['entrepreneurId'],
      select: { entrepreneurId: true },
    });
  },

  upcomingSessions(mentorId: string, now: Date) {
    return prisma.mentorSession.findMany({
      where: {
        mentorId,
        scheduledAt: { gte: now },
        status: { in: ['REQUESTED', 'CONFIRMED'] },
      },
      orderBy: { scheduledAt: 'asc' },
      take: 10,
      include: { entrepreneur: { select: userCard } },
    });
  },

  // --- transactions ---
  applyAsMentor(userId: string, profileData: Prisma.MentorProfileUncheckedCreateInput) {
    return prisma.$transaction(async (tx) => {
      const profile = await tx.mentorProfile.create({ data: profileData });
      await tx.user.update({ where: { id: userId }, data: { role: 'MENTOR' } });
      return profile;
    });
  },

  createReviewAndRecompute(
    reviewData: Prisma.MentorReviewUncheckedCreateInput,
    mentorId: string,
  ) {
    return prisma.$transaction(async (tx) => {
      const review = await tx.mentorReview.create({
        data: reviewData,
        include: { author: { select: userCard } },
      });
      const agg = await tx.mentorReview.aggregate({
        where: { mentorId },
        _avg: { rating: true },
        _count: { _all: true },
      });
      await tx.mentorProfile.update({
        where: { id: mentorId },
        data: {
          ratingAvg: agg._avg.rating ?? 0,
          ratingCount: agg._count._all,
        },
      });
      return review;
    });
  },
};

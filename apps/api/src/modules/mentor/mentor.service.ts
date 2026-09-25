/**
 * Mentor service — business rules for mentor profiles, sessions, reviews and
 * the mentor dashboard. Never touches req/res.
 */
import type { Prisma, SessionStatus } from '@prisma/client';
import { mentorRepository } from './mentor.repository';
import { ApiError } from '../../utils/ApiError';
import type { PageParams } from '../../utils/pagination';
import type {
  ListMentorsQueryDto,
  ApplyMentorDto,
  BookSessionDto,
  UpdateSessionStatusDto,
  CreateReviewDto,
} from './mentor.schema';

export const mentorService = {
  async list(filters: ListMentorsQueryDto, page: PageParams) {
    const where: Prisma.MentorProfileWhereInput = {
      verificationStatus: 'VERIFIED',
    };

    if (filters.q) {
      where.OR = [
        { headline: { contains: filters.q, mode: 'insensitive' } },
        { expertise: { has: filters.q } },
        { user: { name: { contains: filters.q, mode: 'insensitive' } } },
      ];
    }
    if (filters.expertise) where.expertise = { has: filters.expertise };
    if (filters.language) where.languages = { has: filters.language };

    const [items, total] = await Promise.all([
      mentorRepository.listVerifiedProfiles(where, page.skip, page.limit),
      mentorRepository.countVerifiedProfiles(where),
    ]);

    return { items, total };
  },

  async getById(id: string) {
    const profile = await mentorRepository.findProfileById(id);
    if (!profile) throw ApiError.notFound('Mentor profile not found');
    return profile;
  },

  async apply(userId: string, dto: ApplyMentorDto) {
    const existing = await mentorRepository.findProfileByUserId(userId);
    if (existing) throw ApiError.conflict('You already have a mentor profile');

    const profile = await mentorRepository.applyAsMentor(userId, {
      userId,
      headline: dto.headline,
      expertise: dto.expertise,
      yearsExperience: dto.yearsExperience,
      languages: dto.languages,
      hourlyRate: dto.hourlyRate,
      verificationStatus: 'PENDING',
    });

    return profile;
  },

  async book(mentorId: string, entrepreneurId: string, dto: BookSessionDto) {
    const profile = await mentorRepository.findProfileById(mentorId);
    if (!profile) throw ApiError.notFound('Mentor profile not found');
    if (profile.userId === entrepreneurId) {
      throw ApiError.badRequest('You cannot book a session with yourself');
    }

    const session = await mentorRepository.createSession({
      mentorId,
      entrepreneurId,
      scheduledAt: dto.scheduledAt,
      durationMin: dto.durationMin,
      topic: dto.topic,
      status: 'REQUESTED',
    });

    return session;
  },

  async mySessions(userId: string) {
    const profile = await mentorRepository.findProfileByUserId(userId);

    const [asEntrepreneur, asMentor] = await Promise.all([
      mentorRepository.listSessionsAsEntrepreneur(userId),
      profile ? mentorRepository.listSessionsAsMentor(profile.id) : Promise.resolve([]),
    ]);

    return { asEntrepreneur, asMentor };
  },

  async updateStatus(sessionId: string, userId: string, dto: UpdateSessionStatusDto) {
    const session = await mentorRepository.findSessionById(sessionId);
    if (!session) throw ApiError.notFound('Session not found');

    const profile = await mentorRepository.findProfileByUserId(userId);
    const isMentor = !!profile && profile.id === session.mentorId;
    const isEntrepreneur = session.entrepreneurId === userId;

    if (!isMentor && !isEntrepreneur) {
      throw ApiError.forbidden('You do not have access to this session');
    }

    const next = dto.status as SessionStatus;

    if (isMentor) {
      // Mentor may confirm, complete or cancel.
      if (!['CONFIRMED', 'COMPLETED', 'CANCELLED'].includes(next)) {
        throw ApiError.badRequest('Invalid status transition');
      }
    } else {
      // Entrepreneur may only cancel their own session.
      if (next !== 'CANCELLED') {
        throw ApiError.forbidden('Only the mentor can update this session');
      }
    }

    return mentorRepository.updateSessionStatus(sessionId, next);
  },

  async review(sessionId: string, userId: string, dto: CreateReviewDto) {
    const session = await mentorRepository.findSessionById(sessionId);
    if (!session) throw ApiError.notFound('Session not found');

    if (session.entrepreneurId !== userId) {
      throw ApiError.forbidden('Only the entrepreneur of this session can leave a review');
    }
    if (session.status !== 'COMPLETED') {
      throw ApiError.badRequest('You can only review a completed session');
    }

    const existing = await mentorRepository.findReviewBySessionId(sessionId);
    if (existing) throw ApiError.conflict('This session has already been reviewed');

    const review = await mentorRepository.createReviewAndRecompute(
      {
        mentorId: session.mentorId,
        authorId: userId,
        sessionId: session.id,
        rating: dto.rating,
        comment: dto.comment,
      },
      session.mentorId,
    );

    return review;
  },

  async dashboard(userId: string) {
    const profile = await mentorRepository.findProfileByUserId(userId);
    if (!profile) throw ApiError.forbidden('You do not have a mentor profile');

    const now = new Date();
    const [grouped, distinct, upcoming] = await Promise.all([
      mentorRepository.groupSessionsByStatus(profile.id),
      mentorRepository.distinctEntrepreneurIds(profile.id),
      mentorRepository.upcomingSessions(profile.id, now),
    ]);

    const sessionsByStatus = grouped.reduce<Record<string, number>>((acc, g) => {
      acc[g.status] = g._count._all;
      return acc;
    }, {});

    return {
      totalStudents: distinct.length,
      sessionsByStatus,
      ratingAvg: profile.ratingAvg,
      ratingCount: profile.ratingCount,
      upcomingSessions: upcoming,
    };
  },
};

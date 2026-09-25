/**
 * User service — profile, entrepreneur assessment, readiness scoring,
 * dashboard aggregation, bookmarks, certificates and achievements.
 * Contains all business rules; never touches req/res.
 */
import type { Prisma, User } from '@prisma/client';
import { userRepository } from './user.repository';
import { uploadBuffer } from '../../utils/cloudinary';
import { ApiError } from '../../utils/ApiError';
import type { UpdateProfileDto, AssessmentDto, CreateBookmarkDto } from './user.schema';

/** Public-safe projection of a user (never leak secrets). */
function toPublicUser(u: User) {
  const { passwordHash, googleId, ...safe } = u;
  void passwordHash;
  void googleId;
  return safe;
}

/**
 * Weighted readiness score (0-100):
 *   skills (25 if >=3 else proportional), interests (15 if >=2),
 *   budget set (15), experienceLevel set (15), availableHours set (10),
 *   preferredType + businessGoal set (20).
 */
function computeReadinessScore(input: {
  skillCount: number;
  interestCount: number;
  budget?: number | null;
  experienceLevel?: string | null;
  availableHours?: number | null;
  preferredType?: string | null;
  businessGoal?: string | null;
}): number {
  let score = 0;

  score += input.skillCount >= 3 ? 25 : (input.skillCount / 3) * 25;
  score += input.interestCount >= 2 ? 15 : 0;
  score += input.budget != null ? 15 : 0;
  score += input.experienceLevel != null ? 15 : 0;
  score += input.availableHours != null ? 10 : 0;
  score += input.preferredType != null && input.businessGoal != null ? 20 : 0;

  return Math.round(Math.min(100, Math.max(0, score)));
}

/**
 * Profile completion (0-100): 10% per field present among the ten tracked
 * fields (avatarUrl, bio, location, phone, budget, experienceLevel,
 * availableHours, preferredType, businessGoal, >=1 skill).
 */
function computeProfileCompletion(input: {
  avatarUrl?: string | null;
  bio?: string | null;
  location?: string | null;
  phone?: string | null;
  budget?: number | null;
  experienceLevel?: string | null;
  availableHours?: number | null;
  preferredType?: string | null;
  businessGoal?: string | null;
  skillCount: number;
}): number {
  const present = [
    input.avatarUrl,
    input.bio,
    input.location,
    input.phone,
    input.budget,
    input.experienceLevel,
    input.availableHours,
    input.preferredType,
    input.businessGoal,
  ].filter((v) => v != null && v !== '').length;

  const total = present + (input.skillCount >= 1 ? 1 : 0);
  return Math.round(Math.min(100, Math.max(0, total * 10)));
}

export const userService = {
  // --- public catalogs ---
  listSkills() {
    return userRepository.listSkills();
  },

  listInterests() {
    return userRepository.listInterests();
  },

  // --- profile ---
  async getProfile(userId: string) {
    const user = await userRepository.findProfile(userId);
    if (!user) throw ApiError.notFound('User not found');
    return toPublicUser(user);
  },

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const updated = await userRepository.updateUser(userId, dto);
    return toPublicUser(updated);
  },

  async updateAvatar(userId: string, file?: Express.Multer.File) {
    if (!file) throw ApiError.badRequest('An image file is required');
    const avatarUrl = await uploadBuffer(file.buffer, 'skillforge/avatars');
    const updated = await userRepository.updateUser(userId, { avatarUrl });
    return toPublicUser(updated);
  },

  // --- entrepreneur assessment ---
  async saveAssessment(userId: string, dto: AssessmentDto) {
    const skillCount = dto.skillIds.length;
    const interestCount = dto.interestIds.length;

    const readinessScore = computeReadinessScore({
      skillCount,
      interestCount,
      budget: dto.budget,
      experienceLevel: dto.experienceLevel,
      availableHours: dto.availableHours,
      preferredType: dto.preferredType,
      businessGoal: dto.businessGoal,
    });

    const existing = await userRepository.findById(userId);
    if (!existing) throw ApiError.notFound('User not found');

    const profileCompletion = computeProfileCompletion({
      avatarUrl: existing.avatarUrl,
      bio: existing.bio,
      location: existing.location,
      phone: existing.phone,
      budget: dto.budget,
      experienceLevel: dto.experienceLevel,
      availableHours: dto.availableHours,
      preferredType: dto.preferredType,
      businessGoal: dto.businessGoal,
      skillCount,
    });

    const scalar: Prisma.UserUpdateInput = {
      budget: dto.budget ?? null,
      experienceLevel: dto.experienceLevel ?? null,
      availableHours: dto.availableHours ?? null,
      preferredType: dto.preferredType ?? null,
      businessGoal: dto.businessGoal ?? null,
      readinessScore,
      profileCompletion,
    };

    const updated = await userRepository.applyAssessment(userId, {
      skillIds: dto.skillIds,
      interestIds: dto.interestIds,
      scalar,
    });

    return toPublicUser(updated);
  },

  // --- dashboard ---
  async getDashboard(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) throw ApiError.notFound('User not found');

    const now = new Date();
    const [
      bookmarks,
      enrollmentsInProgress,
      enrollmentsCompleted,
      userRoadmaps,
      certificates,
      achievements,
      upcomingSessions,
    ] = await Promise.all([
      userRepository.countBookmarks(userId),
      userRepository.countEnrollments(userId, 'IN_PROGRESS'),
      userRepository.countEnrollments(userId, 'COMPLETED'),
      userRepository.findUserRoadmaps(userId),
      userRepository.countCertificates(userId),
      userRepository.countAchievements(userId),
      userRepository.findUpcomingSessions(userId, now, 5),
    ]);

    return {
      profileCompletion: user.profileCompletion,
      readinessScore: user.readinessScore,
      counts: {
        bookmarks,
        enrollments: {
          inProgress: enrollmentsInProgress,
          completed: enrollmentsCompleted,
        },
        certificates,
        achievements,
      },
      userRoadmaps: userRoadmaps.map((ur) => ({
        id: ur.id,
        roadmapId: ur.roadmapId,
        title: ur.roadmap.title,
        businessId: ur.roadmap.businessId,
        progress: ur.progress,
        startedAt: ur.startedAt,
        completedAt: ur.completedAt,
      })),
      upcomingSessions,
    };
  },

  // --- bookmarks ---
  async listBookmarks(userId: string, skip: number, take: number) {
    const [items, total] = await Promise.all([
      userRepository.listBookmarks(userId, skip, take),
      userRepository.countBookmarksList(userId),
    ]);
    return { items, total };
  },

  async createBookmark(userId: string, dto: CreateBookmarkDto) {
    const where: Prisma.BookmarkWhereInput = { target: dto.target };
    if (dto.target === 'BUSINESS') where.businessId = dto.businessId;
    if (dto.target === 'RESOURCE') where.resourceId = dto.resourceId;
    if (dto.target === 'FORUM_POST') where.postId = dto.postId;

    const existing = await userRepository.findExistingBookmark(userId, where);
    if (existing) throw ApiError.conflict('This item is already bookmarked');

    return userRepository.createBookmark({
      userId,
      target: dto.target,
      businessId: dto.target === 'BUSINESS' ? dto.businessId : null,
      resourceId: dto.target === 'RESOURCE' ? dto.resourceId : null,
      postId: dto.target === 'FORUM_POST' ? dto.postId : null,
    });
  },

  async deleteBookmark(userId: string, id: string) {
    const bookmark = await userRepository.findBookmarkById(id);
    if (!bookmark) throw ApiError.notFound('Bookmark not found');
    if (bookmark.userId !== userId) throw ApiError.forbidden('You cannot delete this bookmark');
    await userRepository.deleteBookmark(id);
    return { deleted: true };
  },

  // --- certificates & achievements ---
  listCertificates(userId: string) {
    return userRepository.listCertificates(userId);
  },

  listAchievements(userId: string) {
    return userRepository.listAchievements(userId);
  },
};

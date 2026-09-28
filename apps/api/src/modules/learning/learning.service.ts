/**
 * Learning service — business rules for resources, enrollments, lesson
 * progress, and certificate issuance. Never touches req/res.
 */
import { customAlphabet } from 'nanoid';
import type { Prisma, ResourceType, Difficulty } from '@prisma/client';
import { learningRepository } from './learning.repository';
import { parsePagination } from '../../utils/pagination';
import { ApiError } from '../../utils/ApiError';
import type { ListResourcesQuery, UpdateLessonProgressDto } from './learning.schema';

/** Uppercase alphanumeric serial suffix generator, e.g. 'SF-7K2P9QX4'. */
const serialSuffix = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 8);

function generateSerial(): string {
  return `SF-${serialSuffix()}`;
}

export const learningService = {
  async listResources(query: ListResourcesQuery) {
    const { page, limit, skip } = parsePagination(query);

    const where: Prisma.LearningResourceWhereInput = { status: 'PUBLISHED' };

    if (query.q) {
      where.OR = [
        { title: { contains: query.q, mode: 'insensitive' } },
        { description: { contains: query.q, mode: 'insensitive' } },
      ];
    }
    if (query.type) where.type = query.type as ResourceType;
    if (query.difficulty) where.difficulty = query.difficulty as Difficulty;
    if (query.categorySlug) where.category = { slug: query.categorySlug };

    const [items, total] = await Promise.all([
      learningRepository.findResources(where, skip, limit),
      learningRepository.countResources(where),
    ]);

    return { items, page, limit, total };
  },

  async getResourceBySlug(slug: string) {
    const resource = await learningRepository.findResourceBySlug(slug);
    if (!resource || resource.status !== 'PUBLISHED') {
      throw ApiError.notFound('Learning resource not found');
    }
    return resource;
  },

  async enroll(userId: string, resourceId: string) {
    const resource = await learningRepository.findResourceById(resourceId);
    if (!resource || resource.status !== 'PUBLISHED') {
      throw ApiError.notFound('Learning resource not found');
    }

    // Idempotent: return the existing enrollment if already enrolled.
    const existing = await learningRepository.findEnrollment(userId, resourceId);
    if (existing) {
      return { enrollment: existing, alreadyEnrolled: true };
    }

    const lessonIds = resource.lessons.map((l) => l.id);
    const enrollment = await learningRepository.createEnrollmentWithLessons(
      userId,
      resourceId,
      lessonIds
    );

    return { enrollment, alreadyEnrolled: false };
  },

  async listMyEnrollments(userId: string) {
    const items = await learningRepository.findEnrollmentsByUser(userId);
    return { items };
  },

  async updateLessonProgress(
    userId: string,
    lessonProgressId: string,
    dto: UpdateLessonProgressDto
  ) {
    const progress = await learningRepository.findLessonProgress(lessonProgressId);
    if (!progress) throw ApiError.notFound('Lesson progress not found');

    // Verify ownership.
    if (progress.enrollment.userId !== userId) {
      throw ApiError.forbidden('You do not have access to this lesson');
    }

    // Update the lesson progress row.
    await learningRepository.updateLessonProgress(lessonProgressId, {
      completed: dto.completed,
      completedAt: dto.completed ? new Date() : null,
    });

    // Recompute enrollment progress.
    const enrollmentId = progress.enrollmentId;
    const [totalLessons, completedLessons] = await Promise.all([
      learningRepository.countLessonProgress(enrollmentId),
      learningRepository.countCompletedLessonProgress(enrollmentId),
    ]);

    const percent =
      totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100);
    const isComplete = percent >= 100;

    const enrollmentUpdate: Prisma.EnrollmentUpdateInput = { progress: percent };
    if (isComplete) {
      enrollmentUpdate.status = 'COMPLETED';
      enrollmentUpdate.completedAt = new Date();
    } else {
      enrollmentUpdate.status = 'IN_PROGRESS';
      enrollmentUpdate.completedAt = null;
    }

    const enrollment = await learningRepository.updateEnrollment(
      enrollmentId,
      enrollmentUpdate
    );

    // Issue a certificate on 100% completion (one per user/resource).
    let certificate = null;
    if (isComplete) {
      const resource = progress.enrollment.resource;
      const existingCert = await learningRepository.findCertificate(
        userId,
        resource.id
      );
      if (existingCert) {
        certificate = existingCert;
      } else {
        certificate = await learningRepository.createCertificate({
          userId,
          resourceId: resource.id,
          title: resource.title,
          serial: generateSerial(),
          pdfUrl: null,
        });
      }
    }

    return { enrollment, certificate };
  },

  async listMyCertificates(userId: string) {
    const items = await learningRepository.findCertificatesByUser(userId);
    return { items };
  },
};

/**
 * Learning repository — the only place learning-related Prisma queries live.
 */
import type { Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma';

export const learningRepository = {
  // --- resources ---
  countResources(where: Prisma.LearningResourceWhereInput) {
    return prisma.learningResource.count({ where });
  },

  findResources(where: Prisma.LearningResourceWhereInput, skip: number, take: number) {
    return prisma.learningResource.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: { category: true },
    });
  },

  findResourceBySlug(slug: string) {
    return prisma.learningResource.findUnique({
      where: { slug },
      include: {
        category: true,
        lessons: { orderBy: { order: 'asc' } },
      },
    });
  },

  findResourceById(id: string) {
    return prisma.learningResource.findUnique({
      where: { id },
      include: { lessons: { orderBy: { order: 'asc' } } },
    });
  },

  // --- enrollments ---
  findEnrollment(userId: string, resourceId: string) {
    return prisma.enrollment.findUnique({
      where: { userId_resourceId: { userId, resourceId } },
    });
  },

  createEnrollmentWithLessons(
    userId: string,
    resourceId: string,
    lessonIds: string[]
  ) {
    return prisma.enrollment.create({
      data: {
        userId,
        resourceId,
        lessons: {
          create: lessonIds.map((lessonId) => ({ lessonId })),
        },
      },
      include: {
        resource: true,
        lessons: { include: { lesson: true } },
      },
    });
  },

  findEnrollmentsByUser(userId: string) {
    return prisma.enrollment.findMany({
      where: { userId },
      orderBy: { startedAt: 'desc' },
      include: {
        resource: true,
        lessons: {
          include: { lesson: true },
          orderBy: { lesson: { order: 'asc' } },
        },
      },
    });
  },

  updateEnrollment(id: string, data: Prisma.EnrollmentUpdateInput) {
    return prisma.enrollment.update({ where: { id }, data });
  },

  // --- lesson progress ---
  findLessonProgress(id: string) {
    return prisma.lessonProgress.findUnique({
      where: { id },
      include: {
        enrollment: { include: { resource: true } },
      },
    });
  },

  updateLessonProgress(id: string, data: Prisma.LessonProgressUpdateInput) {
    return prisma.lessonProgress.update({ where: { id }, data });
  },

  countLessonProgress(enrollmentId: string) {
    return prisma.lessonProgress.count({ where: { enrollmentId } });
  },

  countCompletedLessonProgress(enrollmentId: string) {
    return prisma.lessonProgress.count({
      where: { enrollmentId, completed: true },
    });
  },

  // --- certificates ---
  findCertificate(userId: string, resourceId: string) {
    return prisma.certificate.findFirst({ where: { userId, resourceId } });
  },

  createCertificate(data: Prisma.CertificateUncheckedCreateInput) {
    return prisma.certificate.create({ data });
  },

  findCertificatesByUser(userId: string) {
    return prisma.certificate.findMany({
      where: { userId },
      orderBy: { issuedAt: 'desc' },
      include: { resource: true },
    });
  },
};

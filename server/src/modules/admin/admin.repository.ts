/**
 * Admin repository — the only place admin-related Prisma queries live.
 */
import type {
  Prisma,
  Role,
  MentorVerificationStatus,
  ContentStatus,
  ComplaintStatus,
} from '@prisma/client';
import { prisma } from '../../config/prisma';

export const adminRepository = {
  // --- analytics / overview ---
  countUsersByRole(role: Role) {
    return prisma.user.count({ where: { role } });
  },

  countBusinesses() {
    return prisma.business.count();
  },

  countResources() {
    return prisma.learningResource.count();
  },

  countMentorsByStatus(verificationStatus: MentorVerificationStatus) {
    return prisma.mentorProfile.count({ where: { verificationStatus } });
  },

  countSessions() {
    return prisma.mentorSession.count();
  },

  countForumPosts() {
    return prisma.forumPost.count();
  },

  countOpenComplaints() {
    return prisma.complaint.count({ where: { status: 'OPEN' } });
  },

  recentSignups(take: number) {
    return prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
      },
    });
  },

  // --- users ---
  findUsers(where: Prisma.UserWhereInput, skip: number, take: number) {
    return prisma.$transaction([
      prisma.user.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          isEmailVerified: true,
          avatarUrl: true,
          createdAt: true,
        },
      }),
      prisma.user.count({ where }),
    ]);
  },

  findUserById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  },

  updateUser(id: string, data: Prisma.UserUpdateInput) {
    return prisma.user.update({ where: { id }, data });
  },

  // --- mentors ---
  findPendingMentors(skip: number, take: number) {
    return prisma.$transaction([
      prisma.mentorProfile.findMany({
        where: { verificationStatus: 'PENDING' },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, name: true, email: true, avatarUrl: true },
          },
        },
      }),
      prisma.mentorProfile.count({ where: { verificationStatus: 'PENDING' } }),
    ]);
  },

  findMentorById(id: string) {
    return prisma.mentorProfile.findUnique({ where: { id } });
  },

  updateMentorStatus(id: string, verificationStatus: MentorVerificationStatus) {
    return prisma.mentorProfile.update({
      where: { id },
      data: { verificationStatus },
    });
  },

  // --- content ---
  findBusinessById(id: string) {
    return prisma.business.findUnique({ where: { id } });
  },

  updateBusinessStatus(id: string, status: ContentStatus) {
    return prisma.business.update({ where: { id }, data: { status } });
  },

  findResourceById(id: string) {
    return prisma.learningResource.findUnique({ where: { id } });
  },

  updateResourceStatus(id: string, status: ContentStatus) {
    return prisma.learningResource.update({ where: { id }, data: { status } });
  },

  // --- complaints ---
  findComplaints(where: Prisma.ComplaintWhereInput, skip: number, take: number) {
    return prisma.$transaction([
      prisma.complaint.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      }),
      prisma.complaint.count({ where }),
    ]);
  },

  findComplaintById(id: string) {
    return prisma.complaint.findUnique({ where: { id } });
  },

  updateComplaintStatus(id: string, status: ComplaintStatus) {
    return prisma.complaint.update({ where: { id }, data: { status } });
  },

  // --- announcements ---
  findAnnouncements(skip: number, take: number) {
    return prisma.$transaction([
      prisma.announcement.findMany({
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          author: { select: { id: true, name: true } },
        },
      }),
      prisma.announcement.count(),
    ]);
  },

  createAnnouncement(data: Prisma.AnnouncementUncheckedCreateInput) {
    return prisma.announcement.create({ data });
  },

  findAnnouncementById(id: string) {
    return prisma.announcement.findUnique({ where: { id } });
  },

  deleteAnnouncement(id: string) {
    return prisma.announcement.delete({ where: { id } });
  },
};

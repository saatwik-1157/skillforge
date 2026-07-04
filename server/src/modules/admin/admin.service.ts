/**
 * Admin service — business rules for platform administration:
 * analytics overview, user management, mentor verification, content
 * moderation, complaint handling, and announcements.
 */
import type { Prisma } from '@prisma/client';
import { adminRepository } from './admin.repository';
import { ApiError } from '../../utils/ApiError';
import type {
  ListUsersQueryDto,
  UpdateUserDto,
  VerifyMentorDto,
  ContentStatusDto,
  ListComplaintsQueryDto,
  UpdateComplaintDto,
  CreateAnnouncementDto,
} from './admin.schema';

export const adminService = {
  async overview() {
    const [
      visitors,
      entrepreneurs,
      mentors,
      admins,
      businesses,
      resources,
      pendingMentors,
      verifiedMentors,
      rejectedMentors,
      sessions,
      forumPosts,
      openComplaints,
      recentSignups,
    ] = await Promise.all([
      adminRepository.countUsersByRole('VISITOR'),
      adminRepository.countUsersByRole('ENTREPRENEUR'),
      adminRepository.countUsersByRole('MENTOR'),
      adminRepository.countUsersByRole('ADMIN'),
      adminRepository.countBusinesses(),
      adminRepository.countResources(),
      adminRepository.countMentorsByStatus('PENDING'),
      adminRepository.countMentorsByStatus('VERIFIED'),
      adminRepository.countMentorsByStatus('REJECTED'),
      adminRepository.countSessions(),
      adminRepository.countForumPosts(),
      adminRepository.countOpenComplaints(),
      adminRepository.recentSignups(7),
    ]);

    return {
      users: {
        total: visitors + entrepreneurs + mentors + admins,
        byRole: {
          VISITOR: visitors,
          ENTREPRENEUR: entrepreneurs,
          MENTOR: mentors,
          ADMIN: admins,
        },
      },
      businesses,
      resources,
      mentors: {
        total: pendingMentors + verifiedMentors + rejectedMentors,
        byVerificationStatus: {
          PENDING: pendingMentors,
          VERIFIED: verifiedMentors,
          REJECTED: rejectedMentors,
        },
      },
      sessions,
      forumPosts,
      openComplaints,
      recentSignups,
    };
  },

  async listUsers(dto: ListUsersQueryDto, page: number, limit: number, skip: number) {
    const where: Prisma.UserWhereInput = {};
    if (dto.role) where.role = dto.role;
    if (dto.q) {
      where.OR = [
        { name: { contains: dto.q, mode: 'insensitive' } },
        { email: { contains: dto.q, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await adminRepository.findUsers(where, skip, limit);
    return { items, page, limit, total };
  },

  async updateUser(id: string, dto: UpdateUserDto) {
    const user = await adminRepository.findUserById(id);
    if (!user) throw ApiError.notFound('User not found');

    const data: Prisma.UserUpdateInput = {};
    if (dto.isActive !== undefined) data.isActive = dto.isActive;
    if (dto.role !== undefined) data.role = dto.role;

    return adminRepository.updateUser(id, data);
  },

  async pendingMentors(page: number, limit: number, skip: number) {
    const [items, total] = await adminRepository.findPendingMentors(skip, limit);
    return { items, page, limit, total };
  },

  async verifyMentor(id: string, dto: VerifyMentorDto) {
    const mentor = await adminRepository.findMentorById(id);
    if (!mentor) throw ApiError.notFound('Mentor profile not found');
    return adminRepository.updateMentorStatus(id, dto.status);
  },

  async updateBusinessStatus(id: string, dto: ContentStatusDto) {
    const business = await adminRepository.findBusinessById(id);
    if (!business) throw ApiError.notFound('Business not found');
    return adminRepository.updateBusinessStatus(id, dto.status);
  },

  async updateResourceStatus(id: string, dto: ContentStatusDto) {
    const resource = await adminRepository.findResourceById(id);
    if (!resource) throw ApiError.notFound('Learning resource not found');
    return adminRepository.updateResourceStatus(id, dto.status);
  },

  async listComplaints(dto: ListComplaintsQueryDto, page: number, limit: number, skip: number) {
    const where: Prisma.ComplaintWhereInput = {};
    if (dto.status) where.status = dto.status;

    const [items, total] = await adminRepository.findComplaints(where, skip, limit);
    return { items, page, limit, total };
  },

  async updateComplaint(id: string, dto: UpdateComplaintDto) {
    const complaint = await adminRepository.findComplaintById(id);
    if (!complaint) throw ApiError.notFound('Complaint not found');
    return adminRepository.updateComplaintStatus(id, dto.status);
  },

  async listAnnouncements(page: number, limit: number, skip: number) {
    const [items, total] = await adminRepository.findAnnouncements(skip, limit);
    return { items, page, limit, total };
  },

  async createAnnouncement(authorId: string, dto: CreateAnnouncementDto) {
    return adminRepository.createAnnouncement({
      authorId,
      title: dto.title,
      body: dto.body,
    });
  },

  async deleteAnnouncement(id: string) {
    const announcement = await adminRepository.findAnnouncementById(id);
    if (!announcement) throw ApiError.notFound('Announcement not found');
    await adminRepository.deleteAnnouncement(id);
    return { deleted: true };
  },
};

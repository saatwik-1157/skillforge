/**
 * Admin controller — thin HTTP mapping. Parses the request, delegates to the
 * admin service, and returns via the shared success envelope.
 */
import type { Request, Response } from 'express';
import { adminService } from './admin.service';
import { sendSuccess, buildPagination } from '../../utils/ApiResponse';
import { parsePagination } from '../../utils/pagination';

export const adminController = {
  async overview(_req: Request, res: Response) {
    const data = await adminService.overview();
    return sendSuccess(res, data);
  },

  async listUsers(req: Request, res: Response) {
    const { page, limit, skip } = parsePagination(req.query);
    const { items, total } = await adminService.listUsers(req.query as never, page, limit, skip);
    return sendSuccess(res, { items }, { meta: { pagination: buildPagination(page, limit, total) } });
  },

  async updateUser(req: Request, res: Response) {
    const user = await adminService.updateUser(req.params.id, req.body);
    return sendSuccess(res, { user }, { message: 'User updated' });
  },

  async pendingMentors(req: Request, res: Response) {
    const { page, limit, skip } = parsePagination(req.query);
    const { items, total } = await adminService.pendingMentors(page, limit, skip);
    return sendSuccess(res, { items }, { meta: { pagination: buildPagination(page, limit, total) } });
  },

  async verifyMentor(req: Request, res: Response) {
    const mentor = await adminService.verifyMentor(req.params.id, req.body);
    return sendSuccess(res, { mentor }, { message: 'Mentor verification updated' });
  },

  async updateBusinessStatus(req: Request, res: Response) {
    const business = await adminService.updateBusinessStatus(req.params.id, req.body);
    return sendSuccess(res, { business }, { message: 'Business status updated' });
  },

  async updateResourceStatus(req: Request, res: Response) {
    const resource = await adminService.updateResourceStatus(req.params.id, req.body);
    return sendSuccess(res, { resource }, { message: 'Resource status updated' });
  },

  async listComplaints(req: Request, res: Response) {
    const { page, limit, skip } = parsePagination(req.query);
    const { items, total } = await adminService.listComplaints(req.query as never, page, limit, skip);
    return sendSuccess(res, { items }, { meta: { pagination: buildPagination(page, limit, total) } });
  },

  async updateComplaint(req: Request, res: Response) {
    const complaint = await adminService.updateComplaint(req.params.id, req.body);
    return sendSuccess(res, { complaint }, { message: 'Complaint updated' });
  },

  async listAnnouncements(req: Request, res: Response) {
    const { page, limit, skip } = parsePagination(req.query);
    const { items, total } = await adminService.listAnnouncements(page, limit, skip);
    return sendSuccess(res, { items }, { meta: { pagination: buildPagination(page, limit, total) } });
  },

  async createAnnouncement(req: Request, res: Response) {
    const announcement = await adminService.createAnnouncement(req.user!.sub, req.body);
    return sendSuccess(res, { announcement }, { statusCode: 201, message: 'Announcement created' });
  },

  async deleteAnnouncement(req: Request, res: Response) {
    const data = await adminService.deleteAnnouncement(req.params.id);
    return sendSuccess(res, data, { message: 'Announcement deleted' });
  },
};

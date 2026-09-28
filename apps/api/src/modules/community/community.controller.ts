/**
 * Community controller — thin HTTP mapping over the community service.
 */
import type { Request, Response } from 'express';
import { communityService } from './community.service';
import { sendSuccess, buildPagination } from '../../utils/ApiResponse';
import { parsePagination } from '../../utils/pagination';

export const communityController = {
  async listPosts(req: Request, res: Response) {
    const { page, limit, skip } = parsePagination(req.query);
    const { items, total } = await communityService.listPosts(req.query as never, { page, limit, skip });
    return sendSuccess(res, { items }, { meta: { pagination: buildPagination(page, limit, total) } });
  },

  async getPost(req: Request, res: Response) {
    const post = await communityService.getPostBySlug(req.params.slug, req.user?.sub);
    return sendSuccess(res, { post });
  },

  async createPost(req: Request, res: Response) {
    const post = await communityService.createPost(req.user!.sub, req.body);
    return sendSuccess(res, { post }, { statusCode: 201, message: 'Post created' });
  },

  async addComment(req: Request, res: Response) {
    const comment = await communityService.addComment(req.params.id, req.user!.sub, req.body);
    return sendSuccess(res, { comment }, { statusCode: 201, message: 'Comment added' });
  },

  async toggleLike(req: Request, res: Response) {
    const data = await communityService.toggleLike(req.params.id, req.user!.sub);
    return sendSuccess(res, data, { message: data.liked ? 'Post liked' : 'Post unliked' });
  },

  async deletePost(req: Request, res: Response) {
    const data = await communityService.deletePost(req.params.id, {
      id: req.user!.sub,
      role: req.user!.role,
    });
    return sendSuccess(res, data, { message: 'Post deleted' });
  },

  async trendingTags(req: Request, res: Response) {
    const limit = Number(req.query.limit) || 10;
    const data = await communityService.trendingTags(limit);
    return sendSuccess(res, data);
  },
};

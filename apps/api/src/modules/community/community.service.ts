/**
 * Community service — business rules for forum posts, comments and likes.
 * Never touches req/res.
 */
import { nanoid } from 'nanoid';
import type { Prisma } from '@prisma/client';
import { communityRepository } from './community.repository';
import { ApiError } from '../../utils/ApiError';
import type { ListPostsQuery, CreatePostDto, CreateCommentDto } from './community.schema';

/** Turn an arbitrary title into a URL-safe slug fragment. */
export function slugify(input: string): string {
  const base = input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '') // strip diacritics
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
  return base || 'post';
}

interface CommentNode {
  id: string;
  body: string;
  parentId: string | null;
  createdAt: Date;
  author: { id: string; name: string; avatarUrl: string | null };
  replies: CommentNode[];
}

/** Build a two-level threaded tree: top-level comments each with their replies. */
function buildCommentTree(
  comments: Array<{
    id: string;
    body: string;
    parentId: string | null;
    createdAt: Date;
    author: { id: string; name: string; avatarUrl: string | null };
  }>,
): CommentNode[] {
  const nodes = new Map<string, CommentNode>();
  for (const c of comments) {
    nodes.set(c.id, { ...c, replies: [] });
  }

  const roots: CommentNode[] = [];
  for (const c of comments) {
    const node = nodes.get(c.id)!;
    const parent = c.parentId ? nodes.get(c.parentId) : undefined;
    if (parent) {
      parent.replies.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}

export const communityService = {
  async listPosts(query: ListPostsQuery, opts: { page: number; limit: number; skip: number }) {
    const where: Prisma.ForumPostWhereInput = {};

    if (query.q) {
      where.OR = [
        { title: { contains: query.q, mode: 'insensitive' } },
        { body: { contains: query.q, mode: 'insensitive' } },
      ];
    }
    if (query.tag) where.tags = { has: query.tag };
    if (query.isStory !== undefined) where.isStory = query.isStory;

    // trending = surface recently-active, popular posts first (likes + views),
    // recency as tiebreaker. `recent` = newest first.
    const orderBy: Prisma.ForumPostOrderByWithRelationInput[] =
      query.sort === 'trending'
        ? [{ likes: { _count: 'desc' } }, { viewCount: 'desc' }, { createdAt: 'desc' }]
        : [{ createdAt: 'desc' }];

    const [posts, total] = await Promise.all([
      communityRepository.listPosts({ where, orderBy, skip: opts.skip, take: opts.limit }),
      communityRepository.countPosts(where),
    ]);

    return { items: posts, total };
  },

  async getPostBySlug(slug: string, currentUserId?: string) {
    const post = await communityRepository.findPostBySlug(slug);
    if (!post) throw ApiError.notFound('Post not found');

    // Increment views (fire the update; use the returned fresh count for the response).
    const updated = await communityRepository.incrementViewCount(post.id);

    const [comments, liked] = await Promise.all([
      communityRepository.listCommentsForPost(post.id),
      currentUserId
        ? communityRepository.findLike(currentUserId, post.id).then((l) => !!l)
        : Promise.resolve(false),
    ]);

    return {
      ...post,
      viewCount: updated.viewCount,
      likeCount: post._count.likes,
      commentCount: post._count.comments,
      comments: buildCommentTree(comments),
      liked,
    };
  },

  async createPost(authorId: string, dto: CreatePostDto) {
    const slug = `${slugify(dto.title)}-${nanoid(8)}`;

    const post = await communityRepository.createPost({
      authorId,
      title: dto.title,
      body: dto.body,
      tags: dto.tags,
      isStory: dto.isStory,
      slug,
    });

    return post;
  },

  async addComment(postId: string, authorId: string, dto: CreateCommentDto) {
    const post = await communityRepository.findPostById(postId);
    if (!post) throw ApiError.notFound('Post not found');

    if (dto.parentId) {
      const parent = await communityRepository.findCommentById(dto.parentId);
      if (!parent) throw ApiError.notFound('Parent comment not found');
      if (parent.postId !== postId) {
        throw ApiError.badRequest('Parent comment does not belong to this post');
      }
    }

    return communityRepository.createComment({
      postId,
      authorId,
      body: dto.body,
      parentId: dto.parentId ?? null,
    });
  },

  async toggleLike(postId: string, userId: string) {
    const post = await communityRepository.findPostById(postId);
    if (!post) throw ApiError.notFound('Post not found');

    const existing = await communityRepository.findLike(userId, postId);
    let liked: boolean;
    if (existing) {
      await communityRepository.deleteLike(userId, postId);
      liked = false;
    } else {
      await communityRepository.createLike(userId, postId);
      liked = true;
    }

    const count = await communityRepository.countLikes(postId);
    return { liked, count };
  },

  async deletePost(postId: string, actor: { id: string; role: string }) {
    const post = await communityRepository.findPostById(postId);
    if (!post) throw ApiError.notFound('Post not found');

    if (post.authorId !== actor.id && actor.role !== 'ADMIN') {
      throw ApiError.forbidden('You can only delete your own posts');
    }

    await communityRepository.deletePost(postId);
    return { deleted: true };
  },

  async trendingTags(limit: number) {
    const rows = await communityRepository.allPostTags();
    const counts = new Map<string, number>();
    for (const row of rows) {
      for (const tag of row.tags) {
        counts.set(tag, (counts.get(tag) ?? 0) + 1);
      }
    }

    const items = [...counts.entries()]
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag))
      .slice(0, limit);

    return { items };
  },
};

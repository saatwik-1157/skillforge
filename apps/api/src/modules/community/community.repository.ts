/**
 * Community repository — the only place community-related Prisma queries live.
 */
import type { Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma';

const authorSelect = {
  id: true,
  name: true,
  avatarUrl: true,
} satisfies Prisma.UserSelect;

export const communityRepository = {
  // --- posts ---
  listPosts(args: {
    where: Prisma.ForumPostWhereInput;
    orderBy: Prisma.ForumPostOrderByWithRelationInput | Prisma.ForumPostOrderByWithRelationInput[];
    skip: number;
    take: number;
  }) {
    return prisma.forumPost.findMany({
      where: args.where,
      orderBy: args.orderBy,
      skip: args.skip,
      take: args.take,
      include: {
        author: { select: authorSelect },
        _count: { select: { likes: true, comments: true } },
      },
    });
  },

  countPosts(where: Prisma.ForumPostWhereInput) {
    return prisma.forumPost.count({ where });
  },

  findPostBySlug(slug: string) {
    return prisma.forumPost.findUnique({
      where: { slug },
      include: {
        author: { select: authorSelect },
        _count: { select: { likes: true, comments: true } },
      },
    });
  },

  findPostById(id: string) {
    return prisma.forumPost.findUnique({ where: { id } });
  },

  slugExists(slug: string) {
    return prisma.forumPost.findUnique({ where: { slug }, select: { id: true } });
  },

  createPost(data: Prisma.ForumPostUncheckedCreateInput) {
    return prisma.forumPost.create({
      data,
      include: {
        author: { select: authorSelect },
        _count: { select: { likes: true, comments: true } },
      },
    });
  },

  incrementViewCount(id: string) {
    return prisma.forumPost.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });
  },

  deletePost(id: string) {
    return prisma.forumPost.delete({ where: { id } });
  },

  // --- comments ---
  listCommentsForPost(postId: string) {
    return prisma.comment.findMany({
      where: { postId },
      orderBy: { createdAt: 'asc' },
      include: { author: { select: authorSelect } },
    });
  },

  findCommentById(id: string) {
    return prisma.comment.findUnique({ where: { id } });
  },

  createComment(data: Prisma.CommentUncheckedCreateInput) {
    return prisma.comment.create({
      data,
      include: { author: { select: authorSelect } },
    });
  },

  // --- likes ---
  findLike(userId: string, postId: string) {
    return prisma.postLike.findUnique({
      where: { userId_postId: { userId, postId } },
    });
  },

  createLike(userId: string, postId: string) {
    return prisma.postLike.create({ data: { userId, postId } });
  },

  deleteLike(userId: string, postId: string) {
    return prisma.postLike.delete({
      where: { userId_postId: { userId, postId } },
    });
  },

  countLikes(postId: string) {
    return prisma.postLike.count({ where: { postId } });
  },

  // --- tags ---
  allPostTags() {
    return prisma.forumPost.findMany({ select: { tags: true } });
  },
};

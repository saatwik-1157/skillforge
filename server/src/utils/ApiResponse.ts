/**
 * Consistent success envelope: { success, message, data, meta }.
 * Every controller returns through this so clients get a predictable shape.
 */
import type { Response } from 'express';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface SendOptions {
  statusCode?: number;
  message?: string;
  meta?: Record<string, unknown>;
}

export function sendSuccess<T>(res: Response, data: T, options: SendOptions = {}) {
  const { statusCode = 200, message = 'OK', meta } = options;
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    ...(meta ? { meta } : {}),
  });
}

export function buildPagination(page: number, limit: number, total: number): PaginationMeta {
  return {
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

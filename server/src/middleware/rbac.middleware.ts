/**
 * Role-based access control. Must run after `authenticate`.
 * Usage: router.get('/admin', authenticate, requireRole('ADMIN'), handler)
 */
import type { Request, Response, NextFunction } from 'express';
import type { Role } from '@prisma/client';
import { ApiError } from '../utils/ApiError';

export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) throw ApiError.unauthorized('Authentication required');
    if (!roles.includes(req.user.role)) {
      throw ApiError.forbidden('You do not have permission to perform this action');
    }
    next();
  };
}

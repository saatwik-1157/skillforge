/**
 * Zod validation middleware. Validates and coerces body/query/params before a
 * request reaches its controller. On failure it throws a 422 with field errors.
 */
import type { Request, Response, NextFunction } from 'express';
import { ZodError, type ZodTypeAny } from 'zod';
import { ApiError } from '../utils/ApiError';

interface Schemas {
  body?: ZodTypeAny;
  query?: ZodTypeAny;
  params?: ZodTypeAny;
}

export function validate(schemas: Schemas) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (schemas.body) req.body = schemas.body.parse(req.body);
      if (schemas.query) Object.assign(req.query, schemas.query.parse(req.query));
      if (schemas.params) Object.assign(req.params, schemas.params.parse(req.params));
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        throw ApiError.unprocessable('Validation failed', err.flatten().fieldErrors);
      }
      throw err;
    }
  };
}

/**
 * Parses standard pagination query params (page, limit) with safe bounds.
 */
export interface PageParams {
  page: number;
  limit: number;
  skip: number;
}

export function parsePagination(query: { page?: unknown; limit?: unknown }): PageParams {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 12));
  return { page, limit, skip: (page - 1) * limit };
}

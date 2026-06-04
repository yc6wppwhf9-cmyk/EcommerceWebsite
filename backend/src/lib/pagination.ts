/**
 * Shared pagination helpers — eliminates the repeated page/limit/offset
 * boilerplate that was copy-pasted across every controller.
 *
 * Usage:
 *   const { page, limit, offset } = parsePagination(req.query);
 *   const meta = paginationMeta(page, limit, totalCount);
 */

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

/** Parse and clamp page/limit from Express query params. */
export function parsePagination(query: Record<string, any>): PaginationParams {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(query.limit, 10) || DEFAULT_LIMIT));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

/** Build a pagination metadata object for API responses. */
export function paginationMeta(page: number, limit: number, total: number): PaginationMeta {
  return {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit),
  };
}

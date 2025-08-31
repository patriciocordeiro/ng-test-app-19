/**
 * Represents the result of a paginated API query.
 * @template T The type of the items in the list.
 */
export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
}

/**
 * Represents the parameters for a paginated API query.
 */
export interface PageQuery {
  page: number;
  limit: number;
}

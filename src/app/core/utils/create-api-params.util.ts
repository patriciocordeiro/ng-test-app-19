import { HttpParams } from '@angular/common/http';
import { PageQuery } from '../models/pagination.model';
import { Sort } from '../models/sorting.model';

/**
 * Creates an HttpParams object from PageQuery and Sort configurations.
 * This utility centralizes the logic for building query strings for
 * paginated and sortable API endpoints.
 * @param pageQuery - The pagination configuration.
 * @param sort - The sorting configuration.
 * @returns A configured HttpParams object.
 */
export function createApiParams(pageQuery: PageQuery, sort: Sort<never>): HttpParams {
  return new HttpParams()
    .set('_page', pageQuery.page.toString())
    .set('_limit', pageQuery.limit.toString())
    .set('_sort', sort.property as string)
    .set('_order', sort.direction);
}

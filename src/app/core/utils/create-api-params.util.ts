import { HttpParams } from '@angular/common/http';
import { PageQuery } from '../models/pagination.model';
import { Sort } from '../models/sorting.model';

/**
 * Creates an HttpParams object from PageQuery and Sort configurations.
 * This utility is fully generic and type-safe.
 * @template T The type of the object being sorted.
 * @param pageQuery - The pagination configuration.
 * @param sort - The sorting configuration, ensuring the property is a key of T.
 * @returns A configured HttpParams object.
 */
export function createApiParams<T>(pageQuery: PageQuery, sort: Sort<T>): HttpParams {
  // We must cast sort.property to a string because HttpParams expects a string,
  // but TypeScript knows it's a valid key of T. This is a safe and necessary cast.
  const sortProperty = String(sort.sortBy);

  return new HttpParams()
    .set('_page', pageQuery.page.toString())
    .set('_per_page', pageQuery.limit.toString())
    .set('_sort', sort.direction === 'asc' ? `${sortProperty}` : `-${sortProperty}`)
    .set('_order', sort.direction);
}

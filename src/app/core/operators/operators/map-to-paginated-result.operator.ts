import { HttpResponse } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { PaginatedResult } from '../../models/pagination.model';

/**
 * An RxJS operator that transforms an HttpResponse containing a list of items
 * into a PaginatedResult object. It extracts the X-Total-Count header for pagination.
 * @template T The type of items in the response body.
 */
export function mapToPaginatedResult<T>() {
  return function (source: Observable<HttpResponse<T[]>>): Observable<PaginatedResult<T>> {
    return source.pipe(
      map(response => {
        const totalCount = Number(response.headers.get('X-Total-Count') || 0);
        const items = response.body || [];

        const paginatedResult: PaginatedResult<T> = {
          items: items,
          totalCount: totalCount,
        };

        return paginatedResult;
      }),
    );
  };
}

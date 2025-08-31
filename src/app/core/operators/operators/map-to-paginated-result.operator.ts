import { HttpResponse } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { PaginatedResult } from '../../models/pagination.model';
import { ServerPaginatedResponse } from '../../models/server-paginated-response.model';

/**
 * An RxJS operator that transforms an HttpResponse containing a paginated server response
 * into a PaginatedResult object. It handles the new server format with pagination metadata.
 * @template T The type of items in the response data array.
 */
export function mapToPaginatedResult<T>() {
  return function (
    source: Observable<HttpResponse<ServerPaginatedResponse<T>>>,
  ): Observable<PaginatedResult<T>> {
    return source.pipe(
      map(response => {
        const serverResponse = response.body;

        if (!serverResponse) {
          return {
            items: [],
            totalCount: 0,
          };
        }

        const paginatedResult: PaginatedResult<T> = {
          items: serverResponse.data || [],
          totalCount: serverResponse.items || 0,
        };

        return paginatedResult;
      }),
    );
  };
}

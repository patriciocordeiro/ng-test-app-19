import { AppError } from '@core/models/app-error.model';
import { PaginatedResult } from './pagination.model';

/**
 * @description A generic wrapper for the state of an asynchronous API call.
 * @template T The type of the data expected from the API.
 */
export interface ApiState<T> {
  data: PaginatedResult<T> | null; // <-- CHANGED
  loading: boolean;
  error: AppError | null;
}

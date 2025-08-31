import { AppError } from './app-error.model';

/**
 * @description A generic wrapper for the state of an asynchronous API call.
 * @template T The type of the data expected from the API.
 */
export interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: AppError | null;
}

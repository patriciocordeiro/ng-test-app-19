import { HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { AppError } from '../models/app-error.model';

/**
 * A utility function to transform an HttpErrorResponse into a standardized AppError.
 * This centralizes the logic for creating user-friendly error messages.
 * @param error The raw HttpErrorResponse caught from an HttpClient call.
 * @returns An observable that emits a standardized AppError.
 */
export function handleHttpError(error: HttpErrorResponse) {
  // Log the full technical error for debugging purposes.
  console.error('API Error:', error);

  const appError: AppError = {
    status: error.status,
    message: 'An unexpected error occurred. Please try again later.',
  };

  // Provide more specific, user-friendly messages for common error scenarios.
  if (error.status === 0) {
    appError.message = 'Could not connect to the server. Please check your network connection.';
  } else if (error.status === 404) {
    appError.message = 'The requested resource was not found.';
  } else if (error.status >= 500) {
    appError.message = 'A server error occurred. Our team has been notified.';
  }

  return throwError(() => appError);
}

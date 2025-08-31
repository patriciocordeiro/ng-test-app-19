/**
 * Represents an application error, typically resulting from an HTTP request.
 *
 * @property  status - The HTTP status code of the error. A value of 0 typically indicates a client-side network error.
 * @property message - A user-friendly message describing the error.
 */
export interface AppError {
  status: number;
  message: string;
}

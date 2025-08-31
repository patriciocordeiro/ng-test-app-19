import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

import { environment } from '@env/environment';
import { handleHttpError } from '@core/utils/http-error.util';

import { PageQuery, PaginatedResult } from '@core/models/pagination.model';
import { Sort } from '@core/models/sorting.model';
import { ApiEndpoints } from '@/app/core/constanst/api-endpoints.constant';
import { createApiParams } from '@core/utils/create-api-params.util';
import { Task } from '../models/task.model';
import { mapToPaginatedResult } from '@/app/core/operators/operators/map-to-paginated-result.operator';

/**
 * A stateless service responsible for all direct HTTP communication
 * with the tasks API endpoint.
 */
@Injectable({
  providedIn: 'root',
})
export class TaskApiService {
  private http = inject(HttpClient);
  private tasksUrl = `${environment.apiBaseUrl}/${ApiEndpoints.TASKS}`;

  /**
   * [READ] Fetches a paginated and sorted list of tasks.
   * @returns An observable of the full HttpResponse to include headers like X-Total-Count.
   */
  getTasks(pageQuery: PageQuery, sort: Sort<Task>): Observable<PaginatedResult<Task>> {
    const params = createApiParams<Task>(pageQuery, sort);

    return this.http
      .get<Task[]>(this.tasksUrl, { params, observe: 'response' })
      .pipe(retry(2), mapToPaginatedResult<Task>(), catchError(handleHttpError));
  }

  /**
   * [CREATE] Creates a new task.
   */
  addTask(taskData: Omit<Task, 'id' | 'completed'>): Observable<Task> {
    const newTask: Omit<Task, 'id'> = { ...taskData, completed: false };
    return this.http.post<Task>(this.tasksUrl, newTask).pipe(catchError(handleHttpError));
  }

  /**
   * [UPDATE] Updates an existing task.
   */
  updateTask(task: Task): Observable<Task> {
    return this.http
      .put<Task>(`${this.tasksUrl}/${task.id}`, task)
      .pipe(catchError(handleHttpError));
  }

  /**
   * [DELETE] Deletes a task by its ID.
   */
  deleteTask(taskId: number): Observable<void> {
    return this.http.delete<void>(`${this.tasksUrl}/${taskId}`).pipe(catchError(handleHttpError));
  }
}

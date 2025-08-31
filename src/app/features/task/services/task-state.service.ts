import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { TaskApiService } from './task-api.service';

import { ApiState } from '@core/models/api-state.model';
import { Task } from '../models/task.model';
import { AppError } from '@core/models/app-error.model';
import { PageQuery, PaginatedResult } from '@core/models/pagination.model';
import { Sort } from '@core/models/sorting.model';

/**
 * A stateful service that acts as a client-side store for task-related data.
 * It uses the TaskApiService to interact with the backend and manages the
 * loading, data, and error states for the tasks feature.
 */
@Injectable({
  providedIn: 'root',
})
export class TaskStateService {
  private taskApi = inject(TaskApiService);

  //== State =================================================================
  #tasksState = signal<ApiState<Task>>({
    data: null,
    loading: false,
    error: null,
  });

  /** A readonly signal representing the current paginated and sorted state of the tasks list. */
  public readonly tasksState = this.#tasksState.asReadonly();

  //== Actions ===============================================================

  /**
   * Triggers a fetch of tasks from the API and updates the state accordingly.
   * This is the primary method components will call to load or refresh task data.
   */
  loadTasks(pageQuery: PageQuery, sort: Sort<Task>): void {
    this.#tasksState.update(state => ({ ...state, loading: true, error: null }));

    this.taskApi.getTasks(pageQuery, sort).subscribe({
      next: response => {
        const totalCount = Number(response.headers.get('X-Total-Count') || 0);
        const tasks = response.body || [];

        const paginatedResult: PaginatedResult<Task> = {
          items: tasks,
          totalCount: totalCount,
        };

        this.#tasksState.set({ data: paginatedResult, loading: false, error: null });
      },
      error: (err: AppError) => {
        this.#tasksState.update(state => ({ ...state, loading: false, error: err }));
      },
    });
  }

  /**
   * Calls the API to create a new task.
   * @returns An observable that the calling component can subscribe to for completion and error handling.
   */
  addTask(taskData: Omit<Task, 'id' | 'completed'>): Observable<Task> {
    return this.taskApi.addTask(taskData);
  }

  /**
   * Calls the API to update a task and performs an optimistic update of the local state.
   */
  updateTask(task: Task): Observable<Task> {
    return this.taskApi.updateTask(task).pipe(
      tap(updatedTask => {
        this.#tasksState.update(state => {
          if (!state.data) return state;
          const updatedItems = state.data.items.map(item =>
            item.id === updatedTask.id ? updatedTask : item,
          );
          const newData: PaginatedResult<Task> = { ...state.data, items: updatedItems };
          return { ...state, data: newData };
        });
      }),
    );
  }

  /**
   * Calls the API to delete a task.
   */
  deleteTask(taskId: number): Observable<void> {
    return this.taskApi.deleteTask(taskId);
  }
}

import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { TaskApiService } from './task-api.service';

import { ApiState } from '@core/models/api-state.model';
import { AppError } from '@core/models/app-error.model';
import { PageQuery, PaginatedResult } from '@core/models/pagination.model';
import { Sort } from '@core/models/sorting.model';
import { Task } from '../models/task.model';

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
  #tasksState = signal<ApiState<PaginatedResult<Task> | null>>({
    data: null,
    loading: false,
    error: null,
  });

  //== State for Selected Task ===============================================
  #selectedTaskState = signal<ApiState<Task>>({
    data: null,
    loading: false,
    error: null,
  });

  /** A readonly signal representing the current state of the selected task. */
  public readonly selectedTaskState = this.#selectedTaskState.asReadonly();

  /** A readonly signal representing the current paginated and sorted state of the tasks list. */
  public readonly tasksState = this.#tasksState.asReadonly();

  //== Actions ===============================================================

  /**
   * Triggers a fetch of tasks from the API and updates the state accordingly.
   * This is the primary method components will call to load or refresh task data.
   * @param pageQuery The pagination and filtering options.
   * @param sort The sorting options.
   *
   */
  loadTasks(pageQuery: PageQuery, sort: Sort<Task>): void {
    this.#tasksState.update(state => ({ ...state, loading: true, error: null }));

    this.taskApi.getTasks(pageQuery, sort).subscribe({
      next: paginatedResult => {
        this.#tasksState.set({ data: paginatedResult, loading: false, error: null });
      },
      error: (err: AppError) => {
        this.#tasksState.update(state => ({ ...state, loading: false, error: err }));
      },
    });
  }

  /**
   * Calls the API to create a new task.
   * @param taskData The data for the new task.
   * @returns An observable that the calling component can subscribe to for completion and error handling.
   */
  addTask(taskData: Omit<Task, 'id' | 'completed'>): Observable<Task> {
    return this.taskApi.addTask(taskData);
  }

  /**
   * Calls the API to update a task and performs an optimistic update of the local state.
   * @param task The task to update.
   * @returns An observable that the calling component can subscribe to for completion and error handling.
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
   * @param taskId The ID of the task to delete.
   * @returns An observable of the deletion result.
   */
  deleteTask(taskId: number): Observable<void> {
    return this.taskApi.deleteTask(taskId);
  }

  /**
   * Fetches a single task by its ID and updates the selected task state.
   * @param id The ID of the task to fetch.
   * @returns An observable of the task.
   */
  loadTaskById(id: number): void {
    this.#selectedTaskState.set({ data: null, loading: true, error: null });

    this.taskApi.getTaskById(id).subscribe({
      next: task => {
        this.#selectedTaskState.set({ data: task, loading: false, error: null });
      },
      error: (err: AppError) => {
        this.#selectedTaskState.set({ data: null, loading: false, error: err });
      },
    });
  }

  /**
   * Clears the selected task from the state. Useful when navigating away.
   */
  clearSelectedTask(): void {
    this.#selectedTaskState.set({ data: null, loading: false, error: null });
  }
}

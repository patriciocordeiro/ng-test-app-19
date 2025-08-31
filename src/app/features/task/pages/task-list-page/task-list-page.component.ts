import { Sort } from '@/app/core/models/sorting.model';
import { CommonModule } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Sort as MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { Task } from '../../models/task.model';
import { TaskStateService } from '../../services/task-state.service';

@Component({
  selector: 'app-task-list-page',
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './task-list-page.component.html',
  styleUrl: './task-list-page.component.scss',
})
export class TaskListPageComponent {
  private taskState: TaskStateService = inject(TaskStateService);
  readonly tasksState = this.taskState.tasksState;

  readonly #pageQuery = signal({ page: 1, limit: 10 });
  readonly #sortQuery = signal<Sort<Task>>({
    direction: 'asc',
    sortBy: 'title',
  });

  constructor() {
    // This effect will run initially and then again anytime #pageQuery or #sortQuery changes
    effect(() => {
      this.taskState.loadTasks(this.#pageQuery(), this.#sortQuery());
    });
  }

  get data() {
    return this.tasksState().data;
  }

  get loading() {
    return this.tasksState().loading;
  }

  get error() {
    return this.tasksState().error;
  }
  get pageIndex(): number {
    return this.#pageQuery().page - 1;
  }

  get pageSize(): number {
    return this.#pageQuery().limit;
  }

  get sortActive(): string {
    return this.#sortQuery().sortBy;
  }

  get sortDirection(): 'asc' | 'desc' {
    return this.#sortQuery().direction;
  }

  // Add these methods inside the TaskListPageComponent class

  /** Handles sorting changes from the table header. */
  onSortChange(sort: MatSort): void {
    // The sort direction can be '' when the user cycles through sorting states.
    // We'll treat '' as 'asc' or reset to a default. For now, we only update if a direction is set.
    if (sort.direction) {
      this.#sortQuery.set({
        sortBy: sort.active as keyof Task,
        direction: sort.direction,
      });
    }
  }

  /** Handles pagination changes from the paginator component. */
  onPageChange(event: PageEvent): void {
    console.log('Page change event:', event);
    this.#pageQuery.set({
      page: event.pageIndex + 1, // Paginator is 0-indexed, API is 1-indexed
      limit: event.pageSize,
    });
  }

  retryLoad(): void {
    this.taskState.loadTasks(this.#pageQuery(), this.#sortQuery());
  }
}

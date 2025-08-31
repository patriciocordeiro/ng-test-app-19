import { Sort } from '@/app/core/models/sorting.model';
import {
  ConfirmationDialogComponent,
  ConfirmationDialogData,
} from '@/app/shared/components/confirmation-dialog/confirmation-dialog.component';
import { CommonModule } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Sort as MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { filter } from 'rxjs/operators';
import { TaskAddDialogComponent } from '../../components/task-add-dialog/task-add-dialog.component';
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

  private dialog = inject(MatDialog);
  readonly deletingTaskId = signal<number | null>(null);
  readonly isAddingTask = signal(false);

  constructor() {
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

  onSortChange(sort: MatSort): void {
    if (sort.direction) {
      this.#sortQuery.set({
        sortBy: sort.active as keyof Task,
        direction: sort.direction,
      });
    }
  }

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

  onAddTask(): void {
    const dialogRef = this.dialog.open(TaskAddDialogComponent, {
      width: '500px',
      disableClose: true,
    });

    dialogRef
      .afterClosed()
      .pipe(filter(result => !!result))
      .subscribe(() => {
        console.log('Add dialog closed successfully, refreshing list...');
        this.retryLoad();
      });
  }

  onDeleteTask(task: Task): void {
    const dialogData: ConfirmationDialogData = {
      title: 'Confirm Deletion',
      message: `Are you sure you want to delete the task "${task.title}"? This action cannot be undone.`,
    };

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: dialogData,
      width: '400px',
    });

    dialogRef
      .afterClosed()
      .pipe(filter(result => !!result))
      .subscribe(() => {
        this.deletingTaskId.set(task.id);

        this.taskState.deleteTask(task.id).subscribe({
          next: () => {
            console.log('Delete successful, refreshing list...');
            this.retryLoad();
          },
          error: err => {
            console.error('Delete failed:', err);
          },
          complete: () => {
            this.deletingTaskId.set(null);
          },
        });
      });
  }
}

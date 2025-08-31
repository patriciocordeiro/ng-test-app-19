import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Sort as MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';
import { AppError } from '@app/core/models/app-error.model';
import { AppRoutes } from '@core/constants/routes.constants';

import {
  ConfirmationDialogComponent,
  ConfirmationDialogData,
} from '@app/shared/components/confirmation-dialog/confirmation-dialog.component';
import { Sort } from '@core/models/sorting.model';
import { filter } from 'rxjs/operators';
import { TaskDialogComponent } from '../../components/task-dialog/task-dialog.component';
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
    MatSnackBarModule,
    RouterLink,
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
  private snackBar = inject(MatSnackBar);
  readonly deletingTaskId = signal<number | null>(null);
  readonly isAddingTask = signal(false);
  readonly Routes = AppRoutes;

  readonly data = computed(() => this.tasksState().data);
  readonly loading = computed(() => this.tasksState().loading);
  readonly error = computed(() => this.tasksState().error);
  readonly pageIndex = computed(() => this.#pageQuery().page - 1);
  readonly pageSize = computed(() => this.#pageQuery().limit);
  readonly sortActive = computed(() => this.#sortQuery().sortBy);
  readonly sortDirection = computed(() => this.#sortQuery().direction);

  constructor() {
    effect(() => {
      this.taskState.loadTasks(this.#pageQuery(), this.#sortQuery());
    });
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
    const dialogRef = this.dialog.open(TaskDialogComponent, {
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

  onEditTask(task: Task): void {
    const dialogRef = this.dialog.open(TaskDialogComponent, {
      width: '500px',
      disableClose: true,
      data: task,
    });

    dialogRef
      .afterClosed()
      .pipe(filter((result): result is Task => !!result))
      .subscribe(updatedTask => {
        this.snackBar.open(`Task "${updatedTask.title}" was updated.`, 'Close', {});
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
            // SHOW SUCCESS NOTIFICATION
            this.snackBar.open(`Task "${task.title}" was deleted.`, 'Close', {
              duration: 3000,
              verticalPosition: 'top',
            });

            this.retryLoad();
          },
          error: (err: AppError) => {
            // SHOW ERROR NOTIFICATION
            this.snackBar.open(err.message, 'Close', {
              duration: 5000,
              verticalPosition: 'top',
              panelClass: ['error-snackbar'],
            });
          },
          complete: () => {
            this.deletingTaskId.set(null);
          },
        });
      });
  }
}

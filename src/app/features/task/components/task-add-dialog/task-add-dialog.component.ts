import { CommonModule } from '@angular/common';
import { Component, ViewChild, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { AppError } from '@app/core/models/app-error.model';
import { TaskStateService } from '../../services/task-state.service';
import { TaskFormComponent } from '../task-form/task-form.component';

@Component({
  selector: 'app-task-add-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, TaskFormComponent],
  templateUrl: './task-add-dialog.component.html',
})
export class TaskAddDialogComponent {
  private taskState = inject(TaskStateService);
  private dialogRef = inject(MatDialogRef<TaskAddDialogComponent>);

  // Get a reference to the child TaskFormComponent instance
  @ViewChild(TaskFormComponent) taskFormComponent!: TaskFormComponent;

  readonly isSubmitting = signal(false);
  readonly submissionError = signal<string | null>(null);

  onSave(): void {
    const form = this.taskFormComponent.form;
    if (form.invalid) {
      form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.submissionError.set(null);

    this.taskState.addTask(form.value).subscribe({
      next: () => {
        this.dialogRef.close(true);
      },
      error: (err: AppError) => {
        console.error('Failed to add task', err);
        // Set the error message for the template to display
        this.submissionError.set(err.message);
        this.isSubmitting.set(false);
      },
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}

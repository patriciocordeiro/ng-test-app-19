import { AppError } from '@/app/core/models/app-error.model';
import { CommonModule } from '@angular/common';
import { Component, inject, signal, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { Task } from '../../models/task.model';
import { TaskStateService } from '../../services/task-state.service';
import { TaskFormComponent } from '../task-form/task-form.component';

@Component({
  selector: 'app-task-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, TaskFormComponent],
  templateUrl: './task-dialog.component.html',
  styleUrls: ['./task-dialog.component.scss'],
})
export class TaskDialogComponent {
  private taskState = inject(TaskStateService);
  private dialogRef = inject(MatDialogRef<TaskDialogComponent>);
  public taskToEdit: Task | null = inject(MAT_DIALOG_DATA, { optional: true });

  @ViewChild(TaskFormComponent) private taskFormComponent!: TaskFormComponent;

  readonly isEditMode = !!this.taskToEdit;
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

    // Determine which service method to call based on the mode.
    const saveOperation: Observable<Task> = this.isEditMode
      ? this.taskState.updateTask({ ...this.taskToEdit!, ...form.value })
      : this.taskState.addTask(form.value);

    saveOperation.subscribe({
      next: result => {
        this.dialogRef.close(result); // Pass back the created/updated task
      },
      error: (err: AppError) => {
        this.submissionError.set(err.message);
        this.isSubmitting.set(false);
      },
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}

import { CommonModule } from '@angular/common';
import { Component, ViewChild, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
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
  readonly error = signal<string | null>(null);

  onSave(): void {
    const form = this.taskFormComponent.form;
    if (form.invalid) {
      form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    this.taskState.addTask(form.value).subscribe({
      next: () => {
        // On success, close the dialog. The list page will handle the refresh.
        this.dialogRef.close(true); // Pass back a 'true' to indicate success
      },
      error: err => {
        console.error('Failed to add task', err);
        this.error.set('Failed to add task');
        this.isSubmitting.set(false);
      },
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}

import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule, // To receive data
  MatDialogRef,
} from '@angular/material/dialog';

// Data structure for the dialog
export interface ConfirmationDialogData {
  title: string;
  message: string;
}

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [MatButtonModule, MatDialogModule],
  templateUrl: './confirmation-dialog.component.html',
})
export class ConfirmationDialogComponent {
  constructor(
    // Inject the data passed from the parent component
    @Inject(MAT_DIALOG_DATA) public data: ConfirmationDialogData,
    // Inject a reference to the dialog itself
    private dialogRef: MatDialogRef<ConfirmationDialogComponent>,
  ) {}

  onConfirm(): void {
    // When the user clicks "Confirm", we close the dialog and pass back `true`.
    this.dialogRef.close(true);
  }
}

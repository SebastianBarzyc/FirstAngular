import { Component, Inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-calendar-advanced-edit',
  templateUrl: './calendar-advanced-edit.component.html',
  standalone: true,
  imports: [
    MatDialogContent,
    MatDialogActions,
    MatButton
  ]
})
export class CalendarAdvancedEditComponent {
  constructor(
    public dialogRef: MatDialogRef<CalendarAdvancedEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { group: string }
  ) {}
}

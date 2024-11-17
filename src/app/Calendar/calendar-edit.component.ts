import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CalendarItemComponent } from './calendar-item.component';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'calendar-edit',
  templateUrl: './calendar-edit.component.html',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    CalendarItemComponent,
    MatDialogModule,
    FormsModule,
    MatIcon
  ],
})
export class CalendarEditComponent {
  selectedDate: Date;
  plans = [
    {
      id: 0,
      title: '',
      description: '',
      exercises: [{ name: '', description: '' }]
    }
  ]; 
  exercises = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { date: Date },
    public dialogRef: MatDialogRef<CalendarEditComponent>
  ) {
    this.selectedDate = data.date;
  }

  addExercise(): void {
    const newExercise = { name: '', description: '' };
    if (this.plans.length > 0) {
      this.plans[0].exercises.push(newExercise);
    }
  }

  Delete(id:number): void {
    console.log('Plan deleted: ', id);
    this.dialogRef.close(this.plans);
  }

  Save(id: number, title: string, description: string): void {
    console.log('Plan saved:', id, title, description);
    this.dialogRef.close(this.plans);
  }

  autoResize(textarea: HTMLTextAreaElement) {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  }

  getId() {
    return 0;
  }
}

import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'exercise-dialog',
  templateUrl: './exercise-dialog.component.html',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
  ],
})
export class ExerciseDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ExerciseDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  toggleExerciseSelection(exercise: any) {
    if (this.isExerciseSelected(exercise.title)) {
      this.data.selectedExercises = this.data.selectedExercises.filter((ex: any) => ex.title !== exercise.title);
    } else {
      this.data.selectedExercises.push(exercise);
    }
  }

  isExerciseSelected(exerciseTitle: string): boolean {
    return this.data.selectedExercises.some((ex: any) => ex.title === exerciseTitle);
  }

  onSave(): void {
    this.dialogRef.close(this.data.selectedExercises);
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}

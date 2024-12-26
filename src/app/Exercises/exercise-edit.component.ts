// exercise-edit.component.ts
import { CommonModule } from '@angular/common';
import { ExerciseService } from './exercises.service';
import { Component, ElementRef, Inject, inject, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'exercise-edit',
  templateUrl: './exercise-edit.component.html',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    CommonModule
  ]
})
export class ExerciseEditComponent {
  readonly dialogRef = inject(MatDialogRef<ExerciseEditComponent>);

  exercise: { id: number, title: string, description: string } = {
    id: this.data.id,
    title: this.data.title,
    description: this.data.description
  };

  exercises: any[] = [];

  constructor(private exerciseService: ExerciseService, @Inject(MAT_DIALOG_DATA) public data: any) {}

  @ViewChild('textarea') textarea!: ElementRef;

  ngOnInit(): void {
    this.loadExercises();
    this.autoResize(this.textarea.nativeElement);
  }

  getId(): void{
    return this.data.id;
 }

  ngAfterViewInit(): void {
    if (this.textarea) {
      this.autoResize(this.textarea.nativeElement);
    }
  }

loadExercises(): void {
  this.exerciseService.getData()
    .subscribe(data => {
      if (Array.isArray(data)) {
        this.exercises = data;
      } else {
        console.error('Expected an array but got:', data);
      }
    });
}

Save(id: number, newTitle: string, newDescription: string): void {
  this.exerciseService.editExercise(id, newTitle, newDescription).subscribe({
      next: response => {
          console.log('Exercise updated:', response);
          this.loadExercises();
          this.dialogRef.close(true);
      },
      error: err => {
          console.error('Error editing exercise:', err);
      },
      complete: () => {
          console.log('Edit exercise observable completed');
      }
  });
}

  Delete(id: number): void {
    this.exerciseService.deleteExercise(id).subscribe({
        next: response => {
            console.log('Exercise deleted:', response);
            this.loadExercises();
            this.dialogRef.close(true);
        },
        error: err => {
            console.error('Error deleting exercise:', err);
        },
        complete: () => {
            console.log('Delete exercise observable completed');
        }
    });
}

  autoResize(textarea: HTMLTextAreaElement) {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  }
}

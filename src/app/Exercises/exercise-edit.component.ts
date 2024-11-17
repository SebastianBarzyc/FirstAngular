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

  // Definiujemy typ 'exercise' na podstawie struktury 'data'
  exercise: { id: number, title: string, description: string } = {
    id: this.data.id,       // Pobieramy id z danych przekazanych do dialogu
    title: this.data.title, // Pobieramy title z danych przekazanych do dialogu
    description: this.data.description // Pobieramy description z danych przekazanych do dialogu
  };

  exercises: any[] = [];

  constructor(private exerciseService: ExerciseService, @Inject(MAT_DIALOG_DATA) public data: any) {}

  @ViewChild('textarea') textarea!: ElementRef;

  ngOnInit(): void {
    // Możemy załadować ćwiczenia, jeśli to konieczne
    this.loadExercises();
  }

  getId(): void{
    return this.data.id;
 }

  ngAfterViewInit(): void {
    if (this.textarea) {
      this.autoResize(this.textarea.nativeElement);
    }
  }

  // exercise-edit.component.ts
loadExercises(): void {
  this.exerciseService.getData()
    .subscribe(data => {
      if (Array.isArray(data)) {
        this.exercises = data;  // Upewniamy się, że 'data' to tablica
      } else {
        console.error('Expected an array but got:', data);
      }
    });
}


  Save(id: number, newTitle: string, newDescription: string): void {
      this.exerciseService.editExercise(id, newTitle, newDescription).subscribe(response => {
        console.log('Exercise updated:', response);
        this.loadExercises();
        this.dialogRef.close(true);
      });
  }

  Delete(id: number): void {
      this.exerciseService.deleteExercise(id).subscribe(response => {
        console.log('Exercise deleted:', response);
        this.loadExercises();
        this.dialogRef.close(true);
      });
  }

  autoResize(textarea: HTMLTextAreaElement) {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  }
}

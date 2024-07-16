import { CommonModule } from '@angular/common';
import { ExerciseService } from './exerecise.service';
import { Component, Inject, inject, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {MAT_DIALOG_DATA,MatDialogActions,MatDialogClose,MatDialogContent,MatDialogRef,MatDialogTitle,} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { response } from 'express';
  
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
      MatDialogClose,
      CommonModule
    ],
  })
   
  export class ExerciseEditComponent { 
    readonly dialogRef = inject(MatDialogRef<ExerciseEditComponent>);
    exercise = model(this.data);
    exercises: any[] = [];

    constructor(private exerciseService: ExerciseService, @Inject(MAT_DIALOG_DATA) public data: any) { 
    }
    ngOnInit(): void {
        this.loadExercises();
    }
    
    loadExercises(): void {
        this.exerciseService.getData()
          .subscribe(data => {
        this.exercises = data;
        });
    }

    getId(): void{
       return this.data.id;
    }

    Save(id: number, newTitle: string, newDescription: string): void {
        this.exerciseService.editExercise(id, newTitle, newDescription)
          .subscribe({
            next: response => {
              console.log('Response from server:', response);
              this.dialogRef.close();
              this.loadExercises();
            },
            error: error => {
              console.error('Error from server:', error);
            }
          });
      }
      
  }
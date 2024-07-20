import { CommonModule } from '@angular/common';
import { ExerciseService } from './exerecise.service';
import { Component, ElementRef, Inject, inject, model, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {MAT_DIALOG_DATA,MatDialogActions,MatDialogClose,MatDialogContent,MatDialogRef,MatDialogTitle,} from '@angular/material/dialog';
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
      MatDialogClose,
      CommonModule
    ],
  })
   
  export class ExerciseEditComponent {
    readonly dialogRef = inject(MatDialogRef<ExerciseEditComponent>);
    exercise = model(this.data);
    exercises: any[] = [];

    constructor(private exerciseService: ExerciseService, @Inject(MAT_DIALOG_DATA) public data: any) {}

    @ViewChild('textarea') textarea!: ElementRef;

    ngOnInit(): void {
        this.loadExercises();
    }

    ngAfterViewInit(): void {
      if (this.textarea) {
        this.autoResize(this.textarea.nativeElement);
      }
    }
    
    loadExercises(): void {
        this.exerciseService.getData()
          .subscribe(data => {
        this.exercises = data;
        setTimeout(() => {
          if (this.textarea) {
            this.autoResize(this.textarea.nativeElement);
          }
        }, 0);
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

      autoResize(textarea: HTMLTextAreaElement) {
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
      }

      Delete(id: number) {
        this.exerciseService.deleteExercise(id)
          .subscribe({
            next: response => {
              console.log('Response from server:', response);
              this.dialogRef.close();
            },
            error: error => {
              console.error('Error from server:', error);
            }
          });
        this.loadExercises();
      } 
  }
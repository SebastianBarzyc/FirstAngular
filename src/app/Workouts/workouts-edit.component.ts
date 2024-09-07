import { CommonModule } from '@angular/common';
import { WorkoutService } from './workouts.service';
import { Component, ElementRef, Inject, inject, model, OnInit, ViewChild} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {MAT_DIALOG_DATA,MatDialogActions,MatDialogClose,MatDialogContent,MatDialogRef,MatDialogTitle,} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
  
  @Component({
    selector: 'workout-edit',
    templateUrl: './workouts-edit.component.html',
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
      CommonModule,
      MatSelect,
      MatOption
    ],
  })
   
  export class workoutEditComponent implements OnInit {
    
    @ViewChild('hiddenInput') hiddenInput?: ElementRef;
    @ViewChild('textarea') textarea!: ElementRef

    readonly dialogRef = inject(MatDialogRef<workoutEditComponent>);
    workout = model(this.data);
    workouts: any[] = [];
    exercises: any[] = [];
    exercises2: any[] = [];
    selectedValue: string = "";
    exerciseTitles: { [key: string]: string } = {};

    constructor(private workoutService: WorkoutService, @Inject(MAT_DIALOG_DATA) public data: any) {};
    

    async ngOnInit(): Promise<void> {
        await this.loadworkouts();
        await this.loadExercises();
        await this.loadExercises2();
    }

    getExerciseTitleById(id: number): string {
      const exercise = this.exercises2.find(ex => ex.id === id);
      return exercise ? exercise.title : '';
    }

    ngAfterViewInit(): void {
      if (this.textarea) {
        this.autoResize(this.textarea.nativeElement);
      }
    }
    
    loadworkouts(): Promise<void> {
      return this.workoutService.getData().toPromise().then(response => {
        this.workouts = response.data;
        setTimeout(() => {
          if (this.textarea) {
            this.autoResize(this.textarea.nativeElement);
          }
        }, 0);
      });
    }

    loadExercises(): Promise<void> {
      return this.workoutService.getExercises(this.getId()).toPromise().then(response => {
        this.exercises = response;
      });
      
    }

    loadExercises2(): Promise<void> {
      return this.workoutService.getData().toPromise().then(response => {
        if (response && Array.isArray(response.data)) {
          this.exercises2 = response.data;
        }
        this.exercises = this.exercises.map(exercise => {
          const foundExercise = this.exercises2.find(ex => ex.id === exercise.id);
          return {
            ...exercise,
            title: foundExercise ? foundExercise.title : 'Unknown Exercise'
          };
        });
      }).catch(error => {
        console.error('Error loading exercises2:', error);
        this.exercises2 = [];
      });
    }
    
    
    
  
    getId(){
       return this.data.id;
    }

    Save(id: number, newTitle: string, newDescription: string): void {
        this.workoutService.editworkout(id, newTitle, newDescription)
          .subscribe({
            next: response => {
              console.log('Response from server:', response);
              this.dialogRef.close();
              this.loadworkouts();
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
        this.workoutService.deleteworkout(id)
          .subscribe({
            next: response => {
              console.log('Response from server:', response);
              this.dialogRef.close();
            },
            error: error => {
              console.error('Error from server:', error);
            }
          });
        this.loadworkouts();
      }
  }
import { CommonModule } from '@angular/common';
import { WorkoutService } from './workouts.service';
import { ChangeDetectorRef, Component, ComponentRef, ElementRef, Inject, inject, model, OnInit, ViewChild, ViewContainerRef} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {MAT_DIALOG_DATA,MatDialogActions,MatDialogClose,MatDialogContent,MatDialogRef,MatDialogTitle,} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatOption, MatSelect} from '@angular/material/select';
import { ExerciseService } from '../Exercises/exercises.service';
import {MatIconModule} from '@angular/material/icon';
import { ExerciseItemComponent } from './exercise-item.component';
import { MatSelectModule } from '@angular/material/select';

interface Exercise {
  idPlan: number,
  idExercise: number;
  sets: number;
  reps: number;
}

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
      MatOption,
      MatIconModule,
      ExerciseItemComponent,
      CommonModule,
      MatSelectModule,
    ],
  })
   
  export class workoutEditComponent implements OnInit {
    
    @ViewChild('hiddenInput') hiddenInput?: ElementRef;
    @ViewChild('hiddenInput2') hiddenInput2?: ElementRef;
    @ViewChild('textarea') textarea!: ElementRef;

    readonly dialogRef = inject(MatDialogRef<workoutEditComponent>);
    workout = model(this.data);
    workouts: any[] = [];
    exercises: any[] = [];
    exercises2: any[] = [];
    exercises3: any[] = [];
    tempExercises: Exercise[] = [];
    selectedValue: string = "";
    exerciseTitles: { [key: string]: string } = {};
    selectedExercise: string[] = [];
    exercisesList: any[] = [];
    planID: number = 0;

    constructor(private workoutService: WorkoutService, private exerciseService: ExerciseService, @Inject(MAT_DIALOG_DATA) public data: any, private cdr: ChangeDetectorRef) {};
    
    @ViewChild('parent', { read: ViewContainerRef })
    target: ViewContainerRef | undefined;
    componentRef: ComponentRef<any> | undefined;

    async ngOnInit(): Promise<void> {
        await this.loadworkouts();
        await this.loadExercises();
        await this.loadExercises2();
        await this.loadExercises3();
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

    loadExercises3(){
      this.exerciseService.getData().subscribe(data => {
        this.exercises3 = data;
      });
    }

    loadExercises2(): Promise<void> {
      this.loadExercises3();
      return this.workoutService.getData().toPromise().then(response => {
        if (response && Array.isArray(response.data)) {
          this.exercises2 = response.data;
        }
        this.exercises = this.exercises.map(exercise => {
          const foundExercise = this.exercises3.find(ex => ex.id === exercise.id);
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

          this.workoutService.editworkout2(id)
          .subscribe({
            next: response => {
              console.log('Response from server:', response);
              this.dialogRef.close();
            },
            error: error => {
              console.error('Error from server:', error);
            }
          });

          this.getTempExercises();
            if(this.hiddenInput2){
              this.planID = this.hiddenInput2.nativeElement.value;
            }

            const updatedTempExercises = this.tempExercises.map(planID => ({
              ...planID,
              plan_id: this.planID
            }));

          updatedTempExercises.forEach(exercise  => {
            this.workoutService.editworkout3(
              exercise.idPlan,
              exercise.idExercise,
              exercise.sets,
              exercise.reps
            )
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
          });
          this.getTempExercises();
          console.log(this.tempExercises);
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

      removeExercise(exerciseId: number): void {
        const element = document.getElementById('exercise-div-' + exerciseId);
        
        if (element) {
          element.remove();
          this.exercisesList = this.exercisesList.filter(exercise => exercise.exercise_id !== exerciseId);
        } else {
          console.error('Element not found for id', exerciseId);
        }
      }

      addExercise(): void {
        const newExercise = {
          exercise_id: this.exercisesList.length + 1,
          sets: 0,
          reps: 0
        };
        
        this.exercisesList.push(newExercise);
        this.workoutService.setExercisesList(this.exercisesList.length);
      }

      getTempExercises(){
        this.tempExercises = this.workoutService.tempExercises;
      }

      test(){
        console.log(this.exercisesList);
      }
  }
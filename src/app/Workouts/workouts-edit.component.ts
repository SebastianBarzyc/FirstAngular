import { CommonModule } from '@angular/common';
import { WorkoutService } from './workouts.service';
import { ChangeDetectorRef, Component, ComponentRef, ElementRef, EventEmitter, inject, Inject, Input, OnInit, Output, QueryList, ViewChild, ViewChildren, ViewContainerRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { WorkoutsItemComponent } from './workouts-item.component';
import { MatSelectModule } from '@angular/material/select';
import { forkJoin } from 'rxjs';

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
    CommonModule,
    MatIconModule,
    WorkoutsItemComponent,
    MatSelectModule,
  ],
})
export class WorkoutEditComponent implements OnInit {
  @Output() workoutChanged = new EventEmitter<void>();
  @ViewChildren('textarea') textareas!: QueryList<ElementRef<HTMLTextAreaElement>>;

  readonly dialogRef = inject(MatDialogRef<WorkoutEditComponent>);
  @Input() workout: any;

  exercisesMap: Map<number, any[]> = new Map();
  workouts: any[] = [];
  exercises: any[] = [];
  WorkoutID: number = 0;

  constructor(private workoutService: WorkoutService, private cdRef: ChangeDetectorRef, @Inject(MAT_DIALOG_DATA) public data: { id: number, title: string, description: string }) {
    this.WorkoutID = data.id;
  }

  @ViewChild('parent', { read: ViewContainerRef })
  target: ViewContainerRef | undefined;
  componentRef: ComponentRef<any> | undefined;
  @Output() workoutDeleted = new EventEmitter<void>();
  
  async ngOnInit(): Promise<void> {
    this.loadWorkouts();
    this.loadExercisesForPlan(this.WorkoutID);
  }

  ngAfterViewInit(): void {
    this.textareas.changes.subscribe(() => {
      setTimeout(() => {
        this.textareas.forEach(textarea => {
          this.autoResize(textarea.nativeElement);
        });
      }, 0);
    });
  }

  loadWorkouts(): void {
    this.workoutService.getData().subscribe(response => {
      this.workouts = response;
  });
  }
  
  loadExercisesForPlan(planID: number): Promise<any> {
    return new Promise((resolve, reject) => {
        this.workoutService.getExercisesForPlan(planID).subscribe({
            next: async (response) => {
                this.exercisesMap.set(planID, response);
                this.exercises = this.exercisesMap.get(planID) || [];
                resolve(this.exercises || []);
                console.log("plans: ", response);
            },
            error: (err) => {
                reject(err);
            }
        });
    });
}

  getId() {
    return this.data.id;
  }

  Save(id: number, newTitle: string, newDescription: string): void {
    // Update workout details
    this.workoutService.editWorkout(id, newTitle, newDescription).subscribe({
      next: response => {
        console.log('Response from server (editWorkout):', response);
        // Delete existing exercises for the workout
        this.workoutService.editworkout2(this.WorkoutID).subscribe({
          next: response => {
            console.log('Response from server (editWorkout):', response);
            // Save new exercises for the workout in the correct order
            const saveObservables = this.exercises.map((exercise, index) => 
              this.workoutService.editWorkout3(
                this.WorkoutID,
                exercise.exercise_id,
                exercise.reps,
                exercise.breakTimes,
                exercise.exercise_title,
                index
              )
            );
          
            forkJoin(saveObservables).subscribe({
              next: () => {
                console.log('All exercises have been saved!');
                this.loadExercisesForPlan(this.WorkoutID); // Reload exercises after saving
                this.dialogRef.close();
                this.loadWorkouts();
              },
              error: error => {
                console.error('Error saving exercises:', error);
                // Handle error: reload exercises to ensure data integrity
                this.loadExercisesForPlan(this.WorkoutID);
              }
            });
          },
          error: error => {
            console.error('Error from server (editWorkout):', error);
            // Handle error: reload exercises to ensure data integrity
            this.loadExercisesForPlan(this.WorkoutID);
          }
        });
      },
      error: error => {
        console.error('Error from server (editWorkout):', error);
      }
    });
  }

  autoResize(textarea: HTMLTextAreaElement) {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  }

  Delete(id: number) {
    this.workoutService.deleteWorkout(id).subscribe({
      next: response => {
        this.dialogRef.close();
      },
      error: error => {
        console.error('Error from server:', error);
      }
    });
    this.loadWorkouts();
  }

  removeExercise(ID: number): void {
    console.log('Removing exercise ID:', ID);
    
    const updatedExercises = this.exercises.filter(ex => ex.exercise_id !== ID);
    this.exercisesMap.set(this.WorkoutID, updatedExercises);
    this.exercises = updatedExercises;
    this.cdRef.detectChanges();
  }

  addExercise(): void { 
    const maxId = this.exercises.length > 0 
      ? Math.max(...this.exercises.map(exercise => exercise.id))
      : 0;
  
      const newExercise: { 
        id: number; 
        plan_id: number; 
        exercise_id: number; 
        reps: number[];
        sets: number; 
        exercise_title: string;
        breakTimes: number[];
      } = {
        id: maxId + 1,
        plan_id: this.WorkoutID,
        exercise_id: 0,
        reps: [],
        sets: 1,
        exercise_title: '',
        breakTimes: []
      };

    newExercise.reps = Array(newExercise.sets).fill(0); 
    newExercise.breakTimes = Array(newExercise.sets).fill(0);
  
    this.exercises.push(newExercise); // Ensure new exercises are added to the end of the array
  }
  
}

import { CommonModule } from '@angular/common';
import { WorkoutService } from './workouts.service';
import { ChangeDetectorRef, Component, ComponentRef, ElementRef, EventEmitter, inject, Inject, Input, OnInit, Output, ViewChild, ViewContainerRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ExerciseService } from '../Exercises/exercises.service';
import { MatIconModule } from '@angular/material/icon';
import { ExerciseItemComponent } from './exercise-item.component';
import { MatSelectModule } from '@angular/material/select';
import { forkJoin } from 'rxjs';
import { WorkoutsBackend } from './workouts-backend.component';

interface Exercise {
  idPlan: number;
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
    CommonModule,
    MatIconModule,
    ExerciseItemComponent,
    MatSelectModule,
  ],
})
export class WorkoutEditComponent implements OnInit {
  @Output() workoutChanged = new EventEmitter<void>();
  @ViewChild('hiddenInput') hiddenInput?: ElementRef;
  @ViewChild('textarea') textarea!: ElementRef;

  readonly dialogRef = inject(MatDialogRef<WorkoutEditComponent>);
  @Input() workout: any;

  exercisesMap: Map<number, any[]> = new Map();
  workouts: any[] = [];
  exercises: any[] = [];
  exercises2: any[] = [];
  exercises3: any[] = [];
  exercisesList: any[] = [];
  planID: number = 0;

  WorkoutID: number = 0;
  WorkoutTitle: string;
  WorkoutDesc: string;

  constructor(private workoutService: WorkoutService, private WorkoutsBackend:WorkoutsBackend, private cdRef: ChangeDetectorRef,  private exerciseService: ExerciseService, @Inject(MAT_DIALOG_DATA) public data: { id: number, title: string, description: string }) {
    this.WorkoutID = data.id;
    this.WorkoutTitle = data.title;
    this.WorkoutDesc = data.description;
  }

  @ViewChild('parent', { read: ViewContainerRef })
  target: ViewContainerRef | undefined;
  componentRef: ComponentRef<any> | undefined;

  async ngOnInit(): Promise<void> {
    await this.loadWorkouts();
    await this.loadExercisesForPlan(this.WorkoutID);
  }

  ngAfterViewInit(): void {
    if (this.textarea) {
      this.autoResize(this.textarea.nativeElement);
    }
  }

  loadWorkouts(): Promise<void> {
    return this.workoutService.getData().toPromise().then(response => {
      this.workouts = response.data;
      setTimeout(() => {
        if (this.textarea) {
          this.autoResize(this.textarea.nativeElement);
        }
      }, 0);
    });
  }

  async getExerciseTitleById(id: number): Promise<string> {
    const exercise = this.exercises3.find(ex => ex.id === id);
    return exercise ? exercise.title : '';
  }

  loadExercisesForPlan(planID: number): Promise<any> {
    return new Promise((resolve, reject) => {
        this.workoutService.getExercisesForPlan(planID).subscribe({
            next: async (response) => {
                console.log('Received exercises for planID:', planID, response.data);
                this.exercisesMap.set(planID, response.data);
                this.exercises = this.exercisesMap.get(planID) || [];
                resolve(this.exercises || []);
            },
            error: (err) => {
                reject(err);
            }
        });
    });
}

  async loadExercises3(): Promise<void> {
    try {
      const data = await this.exerciseService.getData().toPromise();
      console.log('Data from loadExercises3:', data);
      this.exercises3 = data;
    } catch (error) {
      console.error('Error loading exercises3:', error);
    }
  }

  getId() {
    return this.data.id;
  }

  Save(id: number, newTitle: string, newDescription: string): void {

    this.workoutService.editworkout(id, newTitle, newDescription).subscribe({
      next: response => {
        console.log('Response from server (editWorkout):', response);
        this.dialogRef.close();
      },
      error: error => {
        console.error('Error from server (editWorkout):', error);
      }
    });
  
    this.workoutService.editworkout2(this.WorkoutID).subscribe({
      next: response => {
        console.log('Response from server (editWorkout):', response);
      },
      error: error => {
        console.error('Error from server (editWorkout):', error);
      }
    });
  
    const saveObservables = this.exercises.map(exercise => 
      this.workoutService.editworkout3(
        this.WorkoutID,
        exercise.exercise_id,
        exercise.reps,
        exercise.exercise_title
      )
    );
  
    forkJoin(saveObservables).subscribe({
      next: () => {
        console.log('Wszystkie ćwiczenia zostały zapisane!');
        this.dialogRef.close();
        this.loadWorkouts();
      },
      error: error => {
        console.error('Błąd podczas zapisywania ćwiczeń:', error);
      }
    });
  }

  autoResize(textarea: HTMLTextAreaElement) {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  }

  Delete(id: number) {
    this.workoutService.deleteworkout(id).subscribe({
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
    
    const currentExercises = this.exercises;
    console.log(currentExercises);
    const updatedExercises = currentExercises.filter(ex => ex.exercise_id !== ID);
    console.log(updatedExercises);
    this.exercisesMap.set(this.WorkoutID, updatedExercises);
    this.exercises = updatedExercises;
    console.log("after remove exercises: ", this.exercises);
    console.log("after remove exercises map: ", this.exercisesMap);
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
        exercise_title: string 
      } = {
        id: maxId + 1,
        plan_id: this.WorkoutID,
        exercise_id: 0,
        reps: [],
        sets: 1,
        exercise_title: ''
      };

    newExercise.reps = Array(newExercise.sets).fill(0); 
  
    this.exercises.push(newExercise);
  }
  
}

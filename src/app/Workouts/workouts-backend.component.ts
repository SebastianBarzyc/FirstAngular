import { Component, OnInit, ViewChild, ViewContainerRef, ComponentFactoryResolver, ComponentRef, Injectable, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkoutService } from './workouts.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { WorkoutsExerciseComponent } from './workouts-exercise.component';
import { WorkoutEditComponent } from './workouts-edit.component';
import { firstValueFrom, Observable, Subscription, tap } from 'rxjs';
import { ExerciseService } from '../Exercises/exercises.service';

interface Exercise {
  id: number;
  title: string;
  sets: number;
  reps: number; 
}

@Component({
  selector: 'workouts-backend',
  templateUrl: './workouts-backend.component.html',
  standalone: true,
  imports: [MatExpansionModule, CommonModule, FormsModule, MatDialogModule]
})

@Injectable({
  providedIn: 'root'
})

export class WorkoutsBackend implements OnInit {
  componentRefs: ComponentRef<any>[] = [];
  exerciseIdCounter = this.workoutService.getId();
  exerciseAllCounter = 0;
  workouts: any[] = [];
  workout = {
    title: '',
    description: ''
  };
  @ViewChild('parent', { read: ViewContainerRef })
  target: ViewContainerRef | undefined;
  isPanelExpanded = false;
  componentRef: ComponentRef<any> | undefined;

  workoutExercises: Exercise = {
    id: 0,
    title: '',
    sets: 0,
    reps: 0
};

  updatedExercises: any;
  exercises: any[] = [];
  workout2: any = {
  };
  workout3: any = {
  };

  exercise: any | null = null;
  error: string | null = null;
  workoutChangedSubscription: Subscription = new Subscription();

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private workoutService: WorkoutService,
    public dialog: MatDialog,
    private exerciseService: ExerciseService,
  ) {}
  ngOnInit(): void {
    this.workoutService.onRefreshNeeded().subscribe(() => {
      console.log('Detected change, refreshing workout list...');
      this.loadWorkouts(); // Automatyczne odświeżenie listy
    });
  
    this.loadWorkouts(); // Wstępne załadowanie
  }

  loadWorkouts(): void {
    this.workoutService.getData().subscribe(response => {
      this.workouts = response.data;
  });
  }

  async loadExercises(): Promise<void> {
    try {
      const data = await this.exerciseService.getData().toPromise();
      console.log('Data from loadExercises:', data);
      this.exercises = data;
    } catch (error) {
      console.error('Error loading exercises:', error);
    }
  }

  addElement() {
    if (this.target) {
      let childComponent = this.componentFactoryResolver.resolveComponentFactory(WorkoutsExerciseComponent);
      this.componentRef = this.target.createComponent(childComponent);
      this.componentRefs.push(this.componentRef);
    }

    this.exerciseIdCounter = this.workoutService.getId();
    this.workoutService.setId(this.exerciseIdCounter + 1);
    this.exerciseAllCounter ++;
    this.workoutService.setCounter(this.exerciseAllCounter);
  }

  async onSubmit() {
    this.exerciseIdCounter = this.workoutService.getId();
    this.workoutExercises = this.workoutService.getWorkoutExercises();
    
    this.workoutService.addworkout(this.workout).pipe(
        tap(response => {
            console.log('Workout added successfully:', response);
        })
    ).subscribe(
        response => {
            this.loadWorkouts();
            this.resetForm();
        },
        error => {
            console.error('Error adding workout:', error);
        }
    );
    await this.addworkout();
}

resetForm() {
    this.workout.title = '';
    this.workout.description = '';

    this.workoutExercises = {
      id: 0,
      title: '',
      sets: 0,
      reps: 0
    };

    this.workoutService.setId(0);
    this.componentRefs.forEach(ref => ref.destroy());
}

async addworkout() {
  this.updatedExercises = [];
  this.workout2.exercises = [];

  this.workoutService.getData().subscribe(async response => {
    // Generating max ID
    const planID = response.data.reduce((maxId: number, item: Exercise) => {
      return item.id > maxId ? item.id : maxId;
    }, 0);

    // Add exercises to list
    const promises = Object.values(this.workoutExercises).map(async exercise => {
      // Fetch exercise ID using the title
      const IDexercise = await this.fetchExerciseByTitle(exercise.title);  // Await the promise here
      console.log('PworkoutExercises:', JSON.stringify(this.workoutExercises));
      console.log('Processing exercise:', exercise);

      // Check if exercise ID is valid and reps are not empty
      if (IDexercise !== -1 && exercise.reps.trim() !== '') {
        // Add exercise to workout2
        this.workout2.exercises.push({
          plan_id: planID + 1,  // Unique plan ID
          exercise_id: IDexercise,
          sets: exercise.sets,
          reps: exercise.reps
        });
        console.log('Valid exercise being added:', {
          plan_id: planID + 1,
          exercise_id: IDexercise,
          sets: exercise.sets,
          reps: exercise.reps
        });
      } else {
        console.warn('Skipping invalid exercise:', exercise);
      }
    });

    // Wait for all promises to finish
    await Promise.all(promises);

    this.workout3 = this.workout2.exercises;
    await this.loadExercises();
    await this.addTitlesToExercises();
    console.log("data: ", this.updatedExercises);

    // Add the workout after processing all exercises
    this.workoutService.addworkout2(this.updatedExercises).pipe(
      tap(response => {
        console.log('Workout added successfully:', response);
      })
    ).subscribe(
      response => {
        this.loadWorkouts();
        this.resetForm();
      },
      error => {
        console.error('Error adding workout:', error);
      }
    );
  });
}

getExerciseByTitle(title: string): Observable<any> {
  return this.workoutService.getExerciseByTitle(title);
}

async fetchExerciseByTitle(title: string): Promise<number> {
  console.log('Fetching exercise for title:', title);  // Logowanie przed próbą pobrania
  if (!title) {
    console.error('No title provided for exercise!');
    return -1;
  }

  try {
    const response = await firstValueFrom(this.workoutService.getExerciseByTitle(title));
    console.log('Fetched exercise by title:', response);
    const idTitle = response.exercise ? response.exercise.id : -1;
    this.error = null;
    return idTitle;
  } catch (error) {
    console.error('Error:', error);
    this.error = 'Failed to retrieve exercise.';
    this.exercise = null;
    return -1;
  }
}

async getExerciseTitleById(id: number): Promise<string> {
  console.log("this.exercises: ", this.exercises);
  const exercise = this.exercises.find((ex: { id: number; }) => ex.id === id);
  return exercise ? exercise.title : '';
}

async addTitlesToExercises(): Promise<void> {
  for (const exercise of this.workout3) {
    try {
      const title = await this.getExerciseTitleById(exercise.exercise_id);
      exercise.exercise_title = title;
    } catch (error) {
      console.error(`Error retrieving title for exercise ID ${exercise.exercise_id}:`, error);
    }
      this.updatedExercises.push(exercise);
      console.log('Exercise after title assignment:', exercise);
  }
}

  togglePanel() {
    this.isPanelExpanded = !this.isPanelExpanded;
  }

  openDialog(id: number, title: string, description: string): void {
    const dialogRef = this.dialog.open(WorkoutEditComponent, {
      data: { id: id, title: title, description: description },
      panelClass: 'editPanel'
    });
  }
}
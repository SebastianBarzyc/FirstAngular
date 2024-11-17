import { Component, OnInit, ViewChild, ViewContainerRef, ComponentFactoryResolver, ComponentRef, Injectable } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkoutService } from './workouts.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { WorkoutsExerciseComponent } from './workouts-exercise.component';
import { WorkoutEditComponent } from './workouts-edit.component';
import { Observable, tap } from 'rxjs';
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

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private workoutService: WorkoutService,
    public dialog: MatDialog,
    private exerciseService: ExerciseService,
  ) {}
  ngOnInit(): void {
    this.loadWorkouts();
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
            this.loadWorkouts()
        },
        error => {
            console.error('Error adding workout:', error);
        }
    );
    await this.addworkout();
}

async addworkout() {
  this.updatedExercises = [];

  this.workoutService.getData().subscribe(async response => {
        const planID = response.data.reduce((maxId: number, item: Exercise) => {
        const planID2 = item.id > maxId ? item.id : maxId;
        return planID2;
      }, 0);      this.workout2.exercises = [];

      const promises = Object.values(this.workoutExercises).map(async exercise => { 
          const IDexercise = await this.fetchExerciseByTitle(exercise.title);

          this.workout2.exercises.push({
              plan_id: planID,
              exercise_id: IDexercise,
              sets: exercise.sets,
              reps: exercise.reps
          });
      });

      await Promise.all(promises);

      this.workout3 = this.workout2.exercises;
      await this.loadExercises();
      await this.addTitlesToExercises();
      console.log("data: ", this.updatedExercises);
      this.workoutService.addworkout2(this.updatedExercises).pipe(
          tap(response => {
              console.log('Workout added successfully:', response);
          })
      ).subscribe(
          response => {
              this.loadWorkouts();
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

async fetchExerciseByTitle(title: string): Promise<void> {
  try {
    const response = await this.workoutService.getExerciseByTitle(title).toPromise();
    const idTitle = response.exercise.id;
    this.error = null;
    return idTitle;
  } catch (error) {
    console.error('Error:', error);
    this.error = 'Failed to retrieve exercise.';
    this.exercise = null;
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
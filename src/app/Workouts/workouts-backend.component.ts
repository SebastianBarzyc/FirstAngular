import { Component, OnInit, ViewChild, ViewContainerRef, ComponentFactoryResolver, ComponentRef, Injectable } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkoutExercise, WorkoutService } from './workouts.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { WorkoutsExerciseComponent } from './workouts-exercise.component';
import { workoutEditComponent } from './workouts-edit.component';
import { Observable, tap } from 'rxjs';

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

  workoutExercises: WorkoutExercise = {
    id: '',
    title: '',
    sets: '',
    reps: ''
  };

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
  ) {}
  ngOnInit(): void {
    this.loadWorkouts()
  }

  loadWorkouts(): void {
    this.workoutService.getData().subscribe(response => {
      this.workouts = response.data;
  });
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

  onSubmit() {
    this.exerciseIdCounter = this.workoutService.getId();
    this.workoutExercises = this.workoutService.getWorkoutExercises();
    this.addworkout2();
    
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


addworkout2(){
  this.workoutService.getData().subscribe(async response => {
    const planID = response.data.length + 1;

    this.workout2.exercises = [];

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
    this.workoutService.addworkout2(this.workout3).pipe(
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
  });
}

  togglePanel() {
    this.isPanelExpanded = !this.isPanelExpanded;
  }

  openDialog(id: number, title: string, description: string): void {
    const dialogRef = this.dialog.open(workoutEditComponent, {
      data: { id: id, title: title, description: description },
      panelClass: 'editPanel'
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }
}

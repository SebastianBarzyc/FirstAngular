import { Component, OnInit, ViewChild, ViewContainerRef, ComponentFactoryResolver, ComponentRef, Injectable } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkoutExercise, WorkoutService } from './workouts.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { WorkoutsExerciseComponent } from './workouts-exercise.component';
import { workoutEditComponent } from './workouts-edit.component';
import { tap } from 'rxjs';

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

  workout2 = {
    plan_id: '', //getData(count)
    exercise_id: '', //idFromTitle
    sets: '', //getWorkoutExercises 1
    reps: '' //getWorkoutExercises
  };

  exercise: any | null = null;
  error: string | null = null;

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private workoutService: WorkoutService,
    public dialog: MatDialog,
    private WorkoutExercise: WorkoutsExerciseComponent,
  ) {}
  ngOnInit(): void {
    this.loadWorkouts()
  }

  loadWorkouts(): void {
    this.workoutService.getData().subscribe(data => {
      this.workouts = data;
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
    this.workoutExercises = this.workoutService.getWorkoutExercises(); // title ex, reps, sets
    console.log("workout exercises backend:", this.workoutExercises);
    console.log("Exercise Counter: ", this.exerciseAllCounter);

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
test() {
  this.exerciseIdCounter = this.workoutService.getId();
  this.workoutExercises = this.workoutService.getWorkoutExercises();
  console.log("workout exercises backend:", this.workoutExercises);
  console.log("Exercise Counter: ", this.exerciseAllCounter);
  console.log();
  this.addworkout2();
}

getExerciseByTitle(title: string) {
  this.workoutService.getExerciseByTitle(title).subscribe(
    response => {
      this.exercise = response.exercise.id;
      this.error = null;
    },
    error => {
      console.error('Error:', error);
      this.error = 'Failed to retrieve exercise.';
      this.exercise = null;
    }
  );
}

addworkout2(){
  this.workoutService.getData().subscribe(data => {
   this.workout2.plan_id = data.length+1;
 });

 this.WorkoutExercise.addExercise(); 
 this.workoutService.getWorkoutExercises();
 const exerciseTitle = this.workoutExercises.title;
 this.getExerciseByTitle(exerciseTitle);
 const exerciseId = this.exercise;
 this.workout2.exercise_id = exerciseId;
console.log(this.workoutExercises);
console.log(this.workoutExercises.title);
 this.workout2.reps = this.workoutExercises.reps;
 this.workout2.sets = this.workoutExercises.sets;
 console.log(this.workout2);
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

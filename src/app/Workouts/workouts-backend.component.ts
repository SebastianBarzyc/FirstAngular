import { Component, OnInit, ViewChild, ViewContainerRef, ComponentFactoryResolver, ComponentRef, Injectable } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkoutExercise, WorkoutService } from './workouts.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { WorkoutsExerciseComponent } from './workouts-exercise.component';
import { WorkoutEditComponent } from './workouts-edit.component';
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
  componentRefs: ComponentRef<any>[] = [];
  workouts: any[] = [];
  workout = {
    title: '',
    description: ''
  };
  @ViewChild('parent', { read: ViewContainerRef })
  target: ViewContainerRef | undefined;
  isPanelExpanded = false;

  workoutExercises: WorkoutExercise[] = [];

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private workoutService: WorkoutService,
    public dialog: MatDialog,
  ) {}
  ngOnInit(): void {
    this.workoutService.onRefreshNeeded().subscribe(() => {
      this.loadWorkouts();
    });
  
    this.loadWorkouts();
  }

  loadWorkouts(): void {
    this.workoutService.getData().subscribe(response => {
      this.workouts = response.data;
  });
  }

  addElement() {
    if (this.target) {
      const componentFactory = this.componentFactoryResolver.resolveComponentFactory(WorkoutsExerciseComponent);
      const componentRef = this.target.createComponent(componentFactory);
      this.componentRefs.push(componentRef);
  
      const newExercise = {
        plan_id: 0,
        exercise_id: 0,
        reps: [],
        title: ""
      };
      
      this.workoutExercises.push(newExercise);
    }
  }
  
  async onSubmit() {    
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

    this.workoutExercises = this.workoutService.getWorkoutExercises();

    this.workoutService.addworkout2(this.workoutExercises).pipe(
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
}

resetForm() {
    this.workout.title = '';
    this.workout.description = '';

    this.workoutExercises = [];
    this.componentRefs.forEach(ref => ref.destroy());
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
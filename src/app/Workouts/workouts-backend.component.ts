import { Component, OnInit, ViewChild, ViewContainerRef, ComponentFactoryResolver, ComponentRef, Injectable, Input, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkoutExercise, WorkoutService } from './workouts.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { WorkoutsExerciseComponent } from './workouts-exercise.component';
import { WorkoutEditComponent } from './workouts-edit.component';
import { Subscription, Subject, tap, debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'workouts-backend',
  templateUrl: './workouts-backend.component.html',
  standalone: true,
  imports: [MatExpansionModule, CommonModule, FormsModule, MatDialogModule]
})

@Injectable({
  providedIn: 'root'
})

export class WorkoutsBackend implements OnInit, OnDestroy {
  @Input() searchQuery: string = '';
  componentRefs: ComponentRef<any>[] = [];
  workouts: any[] = [];
  filteredWorkouts: any[] = [];
  workout = {
    title: '',
    description: ''
  };
  @ViewChild('parent', { read: ViewContainerRef })
  target: ViewContainerRef | undefined;
  isPanelExpanded = false;
  private refreshSubscription: Subscription | undefined;
  searchSubscription: Subscription = new Subscription();
  searchSubject: Subject<string> = new Subject<string>();
  workoutExercises: WorkoutExercise[] = [];

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private workoutService: WorkoutService,
    public dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.refreshSubscription = this.workoutService.onRefreshNeeded().subscribe(() => {
      console.log("dd");
      this.loadWorkouts();
    });

    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(query => {
      this.searchQuery = query;
      this.filterWorkouts();
    });

    this.loadWorkouts();
  }

  ngOnDestroy(): void {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
    this.searchSubscription.unsubscribe();
  }

  loadWorkouts(): void {
    this.workoutService.getData().subscribe(response => {
      this.workouts = response;
      this.filterWorkouts();
    });
  }

  filterWorkouts(): void {
    if (this.searchQuery) {
      this.filteredWorkouts = this.workouts.filter(workout =>
        workout.title.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    } else {
      this.filteredWorkouts = this.workouts;
    }
  }

  addElement() {
    if (this.target) {
      const componentFactory = this.componentFactoryResolver.resolveComponentFactory(WorkoutsExerciseComponent);
      const componentRef = this.target.createComponent(componentFactory);
      this.componentRefs.push(componentRef);
  
      const newExercise: WorkoutExercise = {
        exercise_id: 0,
        reps: [],
        title: "",
        breakTimes: []
      };
      
      this.workoutExercises.push(newExercise);
    }
  }
  
  async onSubmit() {
    this.workoutService.addWorkout(this.workout).pipe(
        tap(response => {
            console.log('Workout added successfully:', response);
            this.workoutExercises = this.workoutService.getWorkoutExercises();
            console.log("workoutExercises: ", this.workoutExercises);
            this.workoutService.addWorkout2(this.workoutExercises).pipe(
              tap(response => {
                console.log('Workout exercises added successfully:', response);
              })
            ).subscribe(
              response => {
                this.loadWorkouts();
                this.resetForm();
              },
              error => {
                console.error('Error adding workout exercises:', error);
              }
            );
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
    this.componentRefs = [];
}

  togglePanel() {
    this.isPanelExpanded = !this.isPanelExpanded;
  }

  openDialog(id: number, title: string, description: string): void {
    const dialogRef = this.dialog.open(WorkoutEditComponent, {
      data: { id, title, description },
      panelClass: 'editPanel'
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Dialog closed');
      if (result) {
        this.loadWorkouts();
      }
    });
  }
}
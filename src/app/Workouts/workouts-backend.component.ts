import { Component, OnInit, ViewChild, ViewContainerRef, ComponentFactoryResolver, ComponentRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkoutService } from './workouts.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { WorkoutsExerciseComponent } from './workouts-exercise.component';
import { workoutEditComponent } from './workouts-edit.component';

@Component({
  selector: 'workouts-backend',
  templateUrl: './workouts-backend.component.html',
  standalone: true,
  providers: [WorkoutService],
  imports: [MatExpansionModule, CommonModule, FormsModule, MatDialogModule]
})
export class WorkoutsBackend implements OnInit {
  exerciseIdCounter = this.workoutService.getId();
  workoutExercises = [];
  exercises: any[] = [];
  workouts: any[] = [];
  workout = {
    title: '',
    description: ''
  };
  @ViewChild('parent', { read: ViewContainerRef })
  target: ViewContainerRef | undefined;
  isPanelExpanded = false;
  componentRef: ComponentRef<any> | undefined;
  selectedExercise: string = '';
    sets: number | null = null;
    reps: number | null = null;

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private workoutService: WorkoutService,
    public dialog: MatDialog,
  ) {}
  ngOnInit(): void {
    this.workoutService.getData().subscribe(data => {
      this.workouts = data;
    });
  }

  loadWorkouts(): void {
    this.workoutService.getData()
      .subscribe(data => {
        this.workouts = data;
      });
  }

  addElement() {
    if (this.target) {
      let childComponent = this.componentFactoryResolver.resolveComponentFactory(WorkoutsExerciseComponent);
      this.componentRef = this.target.createComponent(childComponent);
    } else {
      console.error('Target view container reference is undefined.');
    }
    this.exerciseIdCounter = this.workoutService.getId();
    this.workoutService.setId(this.exerciseIdCounter + 1);
  }

  onSubmit() {
    this.exerciseIdCounter = this.workoutService.getId();
    this.workoutExercises = this.workoutService.getWorkoutExercises();
    console.log("workout exercises backend:", this.workoutExercises);
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

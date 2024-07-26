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
  workouts: any[] = [];
  workout = {
    title: '',
    description: ''
  };

  @ViewChild('parent', { read: ViewContainerRef })
  target: ViewContainerRef | undefined;
  isPanelExpanded = false;
  componentRef: ComponentRef<any> | undefined;

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private workoutsService: WorkoutService,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.workoutsService.getData().subscribe(data => {
      this.workouts = data;
    });
  }

  loadWorkouts(): void {
    this.workoutsService.getData()
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
  }

  onSubmit() {
    console.log(this.workout.title);
    console.log(this.workout.description);
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

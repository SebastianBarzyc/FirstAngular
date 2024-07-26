import { Component, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkoutService } from './workouts.service';

import { ViewChild, ViewContainerRef, ComponentFactoryResolver, ComponentRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { WorkoutsExerciseComponent } from './workouts-exercise.component';


@Component({
  selector: 'workouts-backend',
  templateUrl: './workouts-backend.component.html',
  standalone: true,
  providers: [WorkoutService] ,
  imports: [MatExpansionModule,CommonModule,FormsModule]
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

  constructor(private componentFactoryResolver: ComponentFactoryResolver, private workoutsService: WorkoutService) {}

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
}

import { CommonModule } from '@angular/common';
import { Component, ViewChild, ViewContainerRef, ComponentFactoryResolver, ComponentRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { WorkoutsExerciseComponent } from './workouts-exercise.component';

@Component({
  selector: 'app-workouts',
  templateUrl: './workouts.component.html',
  standalone: true,
  imports: [MatExpansionModule,CommonModule,FormsModule]
})
export class WorkoutsComponent {
  isPanelExpanded = false;
  WorkoutTitle: string = '';
  WorkoutDesc: string = '';

  @ViewChild('parent', { read: ViewContainerRef })
  target: ViewContainerRef | undefined;

  componentRef: ComponentRef<any> | undefined;

  constructor(private componentFactoryResolver: ComponentFactoryResolver) { }

  togglePanel() {
    this.isPanelExpanded = !this.isPanelExpanded;
  }

  onSubmit() {
    console.log(this.WorkoutTitle);
    console.log(this.WorkoutDesc);
  }

  addElement() {
    if (this.target) {
      let childComponent = this.componentFactoryResolver.resolveComponentFactory(WorkoutsExerciseComponent);
      this.componentRef = this.target.createComponent(childComponent);
    } else {
      console.error('Target view container reference is undefined.');
    }
  }
}

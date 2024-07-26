import { CommonModule } from '@angular/common';
import { Component, ViewChild, ViewContainerRef, ComponentFactoryResolver, ComponentRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { WorkoutsExerciseComponent } from './workouts-exercise.component';
import { WorkoutService } from './workouts.service';

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

  workouts: any[] = [];
  workout = {
    title: '',
    description: ''
  };

  @ViewChild('parent', { read: ViewContainerRef })
  target: ViewContainerRef | undefined;

  componentRef: ComponentRef<any> | undefined;

  constructor(private componentFactoryResolver: ComponentFactoryResolver, private workoutService: WorkoutService) { }

  ngOnInit(): void {
    this.workoutService.getData().subscribe(data => {
      this.workouts = data;
    });
  }

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

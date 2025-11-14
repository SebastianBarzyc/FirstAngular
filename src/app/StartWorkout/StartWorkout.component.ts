import { Component, Input, OnInit } from '@angular/core';
import { StartWorkoutService } from './StartWorkout.service';
import { MatFormField } from '@angular/material/form-field';
import { MatSelect, MatSelectChange } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface Workout {
  id: number;
  title: string;
  description: string;
  exercises: Exercise[];
}

interface Exercise {
  title: string;
  sets: Sets[];
}

interface Sets {
  reps: number;
  //weight: number;
}

interface todayWorkout {
  id: number;
  title: string;
}

@Component({
  selector: 'app-startworkout',
  templateUrl: './StartWorkout.component.html',
  standalone: true,
  providers: [StartWorkoutService],
  imports: [MatFormField, MatSelect, MatOption, FormsModule, CommonModule]
})

export class StartWorkoutComponent implements OnInit {
  todayWorkout: todayWorkout | null = null;
  workouts: Workout[] = [];
  selectedWorkout: Workout | null = null;
  selectedWorkoutId: number = 0;

  constructor(private startWorkoutService: StartWorkoutService) {
  }

  ngOnInit(): void {
    this.todayWorkout = { id: 1, title: 'Chest Day' };
    if (this.todayWorkout) {
      this.selectedWorkoutId = this.todayWorkout.id;
    }
    this.startWorkoutService.getWorkouts().subscribe(workouts => {
      this.workouts = workouts;
    });
    this.onWorkoutChange(this.selectedWorkoutId);
  }
  onWorkoutChange(selectedId: number) {
    // ensure the component's field is updated with the new value
    this.selectedWorkoutId = selectedId;
    console.log('Selected workout ID changed to:', this.selectedWorkoutId);
    this.startWorkoutService.workoutData(this.selectedWorkoutId).subscribe(workout => {
      this.selectedWorkout = workout;
    });
  }

  startWorkout() {
    if (this.selectedWorkout) {
      console.log('Starting workout:', this.selectedWorkout);
      // Additional logic to start the workout can be added here
    } else {
      console.warn('No workout selected to start.');
    }
  }
}
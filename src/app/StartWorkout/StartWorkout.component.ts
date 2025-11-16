import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { MatInput } from '@angular/material/input';
import { startWorkoutDuringComponent } from './startWorkout-during.component';
import { startWorkoutService } from './StartWorkout.service';

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
  weight: number;
  breakTime: number;
}

interface todayWorkout {
  id: number;
  title: string;
}

@Component({
  selector: 'app-startworkout',
  templateUrl: './StartWorkout.component.html',
  standalone: true,
  imports: [
    MatFormField,
    MatSelect,
    MatOption,
    FormsModule,
    CommonModule,
    MatDialogModule,
    MatLabel,
    MatInput
],
})

export class startWorkoutComponent implements OnInit {
  todayWorkout: todayWorkout | null = null;
  workouts: Workout[] = [];
  selectedWorkout: Workout | null = null;
  selectedWorkoutId: number = 0;
  workoutSessionData: Workout | null = null;

  constructor(private startWorkoutService: startWorkoutService, private dialog: MatDialog) {
  }
  

  ngOnInit(): void {
    this.startWorkoutService.getWorkouts().subscribe(workouts => {
      this.workouts = workouts;
    });
    this.getTodayWorkout();
    this.onWorkoutChange(this.selectedWorkoutId);
  }
  onWorkoutChange(selectedId: number) {
    if (selectedId === this.todayWorkout?.id) {
      this.getTodayWorkout();
    }else{ 
      this.selectedWorkoutId = selectedId;
      this.startWorkoutService.workoutData(this.selectedWorkoutId).subscribe(workout => {
        this.selectedWorkout = workout;
      });
    }
  }

  startWorkout() {
    this.dialog.open(startWorkoutDuringComponent, {
      width: '800px',
      data: { workout: this.selectedWorkout }
    });
  }

  getTodayWorkout() {
    this.startWorkoutService.todayWorkout().subscribe(workout => {
      if (workout) {
        this.todayWorkout = { id: workout.id, title: workout.title };
        this.selectedWorkoutId = this.todayWorkout.id;
        this.selectedWorkout = workout;
      } else {
        this.todayWorkout = null;
      }
    });
  }
  updateSet(title: string) {
    if (this.selectedWorkout) {
      const exercise = this.selectedWorkout.exercises.find(ex => ex.title === title);
      if (exercise) {
        this.selectedWorkout.exercises = this.selectedWorkout.exercises.map(ex => {
          if (ex.title === title) {
            return exercise;
          }
          return ex;
        });
      }
    }
  }
}
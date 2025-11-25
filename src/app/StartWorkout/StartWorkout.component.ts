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
  id: number;
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
  }

  onWorkoutChange(selectedId: number) {
    if (selectedId === this.todayWorkout?.id) {
      this.getTodayWorkout();
      return;
    }else{ 
      this.selectedWorkoutId = selectedId;
      this.startWorkoutService.workoutData(this.selectedWorkoutId).subscribe(workout => {
        this.selectedWorkout = workout;
        this.getLastWeights();
      });
    }
  }

  startWorkout() {
    this.dialog.closeAll();
    this.dialog.open(startWorkoutDuringComponent, {
      width: '50%',
      height: '37vh',
      data: { workout: this.selectedWorkout }
    });
  }

  getTodayWorkout() {
    this.startWorkoutService.todayWorkout().subscribe(workout => {
      if (workout) {
        this.todayWorkout = { id: workout.id, title: workout.title };
        this.selectedWorkoutId = this.todayWorkout.id;
        this.selectedWorkout = workout;

        this.getLastWeights();
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

getLastWeights() {
  console.log("Getting last weights for workout:", this.selectedWorkout);
  
  this.selectedWorkout?.exercises.forEach(exercise => {
    this.startWorkoutService.getLastWeights(exercise.id).subscribe(lastSets => {
      console.log("Last sets for exercise", exercise.id, ":", lastSets);
      if (!lastSets || lastSets.length === 0) return;

      exercise.sets.forEach((set, index) => {

        const lastSet = lastSets[index] || lastSets[lastSets.length - 1];

        if (set.weight === 0) {
          set.weight = lastSet.weight;
        }
      });
    });
  });

  console.log("Updated exercises with last weights:", this.selectedWorkout?.exercises);
  }
}

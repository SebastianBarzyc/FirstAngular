import { Component, Inject, Input, OnInit } from '@angular/core';
import { startWorkoutService } from './StartWorkout.service';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatFormField, MatFormFieldModule, MatLabel } from "@angular/material/form-field";
import { MatInput, MatInputModule } from "@angular/material/input";
import {MatProgressBarModule} from '@angular/material/progress-bar';
import { FormsModule } from '@angular/forms';

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

interface WorkoutStep {
  index: number;
  exerciseTitle: string;
  type: 'exercise' | 'break';
  currentSet: number;
  totalSets: number;
  reps: number;
  weight: number;
}

interface FinalProgress {
  totalIndex: number;
  progress: WorkoutStep[];
}

interface Stats {
  totalTime: number;
  totalExercises: number;
  totalReps: number;
  totalWeight: number;
}

@Component({
  selector: 'app-startworkout-during',
  templateUrl: './startWorkout-during.component.html',
  standalone: true,
imports: [
  CommonModule,
  MatFormFieldModule,
  MatInputModule,
  MatProgressBarModule,
  FormsModule
]
})

export class startWorkoutDuringComponent implements OnInit {
  @Input() workout: Workout | null = null;
  
  progress: WorkoutStep | null = null;
  finalProgress: FinalProgress | null = null;
  remainingTime: number = 0;
  intervalId: any = null;
  timerId: any = null;
  timer: any = 0;
  completed: boolean = false;
  newWorkout: Workout | null = null;
  stats: Stats | null = null; 

  constructor(
    private startWorkoutService: startWorkoutService,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: { workout: Workout }
  ) {}

  ngOnInit(): void {
    this.workout = this.data.workout;
    this.finalProgress = this.generateFinalProgress(this.workout);
    this.progress = this.finalProgress.progress[0];
    this.startTimer();
  }

generateFinalProgress(workout: Workout): FinalProgress {
  const steps: WorkoutStep[] = [];
  let index = 1;

  workout.exercises.forEach(exercise => {
    const totalSets = exercise.sets.length;

    exercise.sets.forEach((set, setIndex) => {
      
      steps.push({
        index: index++,
        exerciseTitle: exercise.title,
        type: 'exercise',
        currentSet: setIndex + 1,
        totalSets: totalSets,
        reps: set.reps ?? 0,
        weight: set.weight ?? 0
      });

      steps.push({
        index: index++,
        exerciseTitle: 'break',
        type: 'break',
        currentSet: 0,
        totalSets: 0,
        reps: set.breakTime ?? 0,
        weight: 0
      });
    });
  });

  return {
    totalIndex: steps.length,
    progress: steps
  };
}

  nextStep() {
    if (this.progress && this.finalProgress) {
      const currentIndex = this.progress.index;
      if (currentIndex < this.finalProgress.totalIndex) {
        this.progress = this.finalProgress.progress[currentIndex];
      } else {
        this.completed = true;
        this.newWorkout = this.startWorkoutService.createNewWorkoutFromProgress(this.workout, this.finalProgress);
        this.stopTimer();
        this.getStats();
      }
      if (this.progress.type === 'break') {
        this.remainingTime = this.progress.reps;
        if (this.intervalId) clearInterval(this.intervalId);
        this.intervalId = setInterval(() => {
          this.remainingTime--;
          if (this.remainingTime <= 0) {
            clearInterval(this.intervalId);
            this.nextStep();
          }
        }, 1000);
      }
    }
  }

  previousStep() {
    if (this.progress && this.finalProgress) {
      const currentIndex = this.progress.index;
      if (currentIndex > 1) {
        this.progress = this.finalProgress.progress[currentIndex - 2];
      }
      if (this.progress.type === 'break') {
        this.progress = this.finalProgress.progress[currentIndex - 3];
      }
    }
  }

  getSetProgress(): number {
    if (!this.progress) return 0;
     return (this.progress.currentSet / this.progress.totalSets) * 100;
  }

  startTimer() {
    if (this.timerId) clearInterval(this.timerId);

    this.timerId = setInterval(() => {
      this.timer++;
    }, 1000);
  }

  stopTimer() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  formatTime(totalSeconds: number): string {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours.toString().padStart(2,'0')}:` +
          `${minutes.toString().padStart(2,'0')}:` +
          `${seconds.toString().padStart(2,'0')}`;
  }

  getStats() {
    if (!this.finalProgress) return;
    let totalExercises = 0;
    let totalReps = 0;
    let totalWeight = 0;
    this.finalProgress.progress.forEach(step => {
      if (step.type === 'exercise') {
        totalExercises++;
        totalReps += step.reps;
        totalWeight += step.reps * step.weight;
      }
    });
    this.stats = {
      totalTime: this.timer,
      totalExercises: totalExercises,
      totalReps: totalReps,
      totalWeight: totalWeight
    };
  }

  closeDialog() {
    this.dialog.closeAll();
  }
}
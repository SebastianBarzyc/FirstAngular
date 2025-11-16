import { Component, Inject, Input, OnInit } from '@angular/core';
import { startWorkoutService } from './StartWorkout.service';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormField, MatLabel } from "@angular/material/form-field";
import { MatInput } from "@angular/material/input";
import {MatProgressBarModule} from '@angular/material/progress-bar';

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

interface Progress {
  index: number;
  exerciseTitle: string;
  type: string;
  currentSet: number;
  totalSets: number;
  reps: number;
  weight: number;
}

interface FinalProgress {
  totalIndex: number;
  progress: Progress[];
}

@Component({
  selector: 'app-startworkout-during',
  templateUrl: './startWorkout-during.component.html',
  standalone: true,
  imports: [CommonModule, MatFormField, MatInput, MatLabel, MatProgressBarModule]
})

export class startWorkoutDuringComponent implements OnInit {
  @Input() workout: Workout | null = null;
  
  progress: Progress | null = null;
  finalProgress: FinalProgress | null = null;
  remainingTime: number = 0;

  constructor(
    private startWorkoutService: startWorkoutService,
    @Inject(MAT_DIALOG_DATA) public data: { workout: Workout }
  ) {}

  ngOnInit(): void {
    this.workout = this.data.workout;
    console.log("startWorkoutDuringComponent initialized with workout:", this.workout);
  }
}
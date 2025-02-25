import { Component, Injectable, OnInit } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatSelectModule } from '@angular/material/select';
import { ExerciseService } from "../Exercises/exercises.service";
import { CommonModule } from '@angular/common';
import { WorkoutExercise, WorkoutService } from "./workouts.service";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";

@Component({
  selector: 'app-workouts-exercise',
  standalone: true,
  templateUrl: './workouts-exercise.component.html',
  imports: [FormsModule, MatSelectModule, CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule]
})

@Injectable({
  providedIn: 'root'
})

export class WorkoutsExerciseComponent implements OnInit {
  selectedExercise: any;
  exercises: any[] = [];
  sets: number | null = null;
  repsArray: number[] = [];

  constructor(private exerciseService: ExerciseService, private workoutService: WorkoutService) { }

  ngOnInit(): void {
    this.loadExercises();
  }

  loadExercises(): void {
    this.exerciseService.getData().subscribe(data => {
      this.exercises = data;
    });
  }
  
  onSetsChange() {
    if (this.sets !== null) {
      this.repsArray = new Array(this.sets).fill(0);     
    }
  }

  onChange() {
    const selectedExerciseData = this.exercises.find(ex => ex.title === this.selectedExercise);
    if (selectedExerciseData) {
      this.workoutService.addExerciseToWorkout({
        title: this.selectedExercise,
        reps: [...this.repsArray],
        exercise_id: selectedExerciseData.id
      });
    }
  }

  trackByFn(index: number, item: any): number {
    return item.exercise_id; // or item.id
  }

  trackByIndex(index: number): number {
    return index;
  }
}

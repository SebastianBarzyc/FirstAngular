import { Component, Injectable} from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import {  MatSelectModule } from '@angular/material/select';
import { ExerciseService } from "../Exercises/exerecise.service";
import { CommonModule } from '@angular/common';
import { WorkoutService } from "./workouts.service";

@Component({
  selector: 'app-workouts-exercise',
  standalone: true,
  templateUrl: './workouts-exercise.component.html',
  imports: [FormsModule, MatSelectModule, CommonModule, ReactiveFormsModule]
})

@Injectable({
  providedIn: 'root'
})

export class WorkoutsExerciseComponent{
  constructor(private exerciseService: ExerciseService, private workoutService: WorkoutService) { }

  exerciseIdCounter = this.workoutService.getId();
  exerciseAllCounter = this.workoutService.getCounter();
  selectedExercise: any;
  exercises: any[] = [];
  sets: number | null = null;
  reps: number | null = null;
  localExercises: any[] = [];
  workoutExercises: any[] = [];

  ngOnInit() {
    this.loadExercises();
  }

  loadExercises(): void {
    this.exerciseService.getData().subscribe(data => {
      this.exercises = data;
    });
  }

  onSelectChange(): void {
    this.workoutService.getId();
  }
  
  addExercise() {
    this.exerciseAllCounter = this.workoutService.getCounter();
    for (let i = 0; i <= this.exerciseAllCounter; i++) {
      const reps = document.getElementById('reps-' + i) as HTMLInputElement;
      const sets = document.getElementById('sets-' + i) as HTMLInputElement;
      const title = document.getElementById('title-' + i) as HTMLInputElement;
    
      if (reps && sets && title) {
        const repsValue = reps.value;
        const setsValue = sets.value;
        const titleValue = title.value;
        const existingExerciseIndex = this.workoutExercises.findIndex(exercise => exercise.id === i);
    
        if (existingExerciseIndex > -1) {
          this.workoutExercises[existingExerciseIndex] = {
            id: i,
            title: titleValue,
            sets: setsValue,
            reps: repsValue
          };
        } else {
          this.workoutExercises.push({
            id: i,
            title: titleValue,
            sets: setsValue,
            reps: repsValue
          });
        }
        this.workoutService.setWorkoutExercises(this.workoutExercises);
      }
    }
  }
}
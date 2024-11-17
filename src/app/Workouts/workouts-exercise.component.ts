import { Component, Injectable} from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import {  MatSelectModule } from '@angular/material/select';
import { ExerciseService } from "../Exercises/exercises.service";
import { CommonModule } from '@angular/common';
import { WorkoutService } from "./workouts.service";
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
    
    // Zmienna do przechowywania kolejnego unikalnego id
    let newId = this.workoutExercises.length > 0 ? Math.max(...this.workoutExercises.map(exercise => exercise.id)) + 1 : 1;
    
    for (let i = 0; i <= this.exerciseAllCounter; i++) {
      const reps = document.getElementById('reps-' + i) as HTMLInputElement;
      const sets = document.getElementById('sets-' + i) as HTMLInputElement;
      const title = document.getElementById('title-' + i) as HTMLInputElement;
      
      if (reps && sets && title) {
        const repsValue = reps.value;
        const setsValue = sets.value;
        const titleValue = title.value;
        
        // Sprawdzamy, czy ćwiczenie już istnieje na podstawie tytułu
        const existingExerciseIndex = this.workoutExercises.findIndex(exercise => exercise.title === titleValue);
        
        if (existingExerciseIndex > -1) {
          // Zaktualizuj ćwiczenie, jeśli już istnieje
          this.workoutExercises[existingExerciseIndex] = {
            id: this.workoutExercises[existingExerciseIndex].id,  // Użyj id istniejącego ćwiczenia
            title: titleValue,
            sets: setsValue,
            reps: repsValue
          };
        } else {
          // Dodajemy nowe ćwiczenie z unikalnym id
          this.workoutExercises.push({
            id: newId,  // Nowe unikalne id
            title: titleValue,
            sets: setsValue,
            reps: repsValue
          });
          
          // Zwiększamy id, żeby dla kolejnego ćwiczenia było inne
          newId++;
        }
  
        // Ustawiamy ćwiczenia w serwisie
        this.workoutService.setWorkoutExercises(this.workoutExercises);
      }
    }
  
    console.log("this.workoutExercises: " + JSON.stringify(this.workoutExercises));
  }
  
}
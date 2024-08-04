import { Component, ElementRef, ViewChild, ViewContainerRef } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { ExerciseService } from "../Exercises/exerecise.service";
import { CommonModule } from '@angular/common';
import { WorkoutService } from "./workouts.service";

@Component({
    selector: 'app-workouts-exercise',
    standalone: true,
    templateUrl: './workouts-exercise.component.html',
    imports: [FormsModule, MatSelectModule, CommonModule, ReactiveFormsModule]
  })

  export class WorkoutsExerciseComponent{
    selectedExercise: any;

    constructor(private exerciseService: ExerciseService, private workoutService: WorkoutService) { }

    exerciseIdCounter = this.workoutService.getId();
    exercises: any[] = [];
    selectedValue: string | null = null;
    sets: number | null = null;
    reps: number | null = null;
    selectedExercises: { title: string, sets: number, reps: number }[] = [];
    workoutPlan: Array<{ exercise: string, sets: number, reps: number }> = [];
    localExercises: any[] = [];
    @ViewChild('parent', { read: ViewContainerRef, static: true }) target!: ViewContainerRef;
    @ViewChild('inputElement') inputElementRef!: ElementRef;

    workoutExercises: any[] = [];

    ngOnInit() {
      this.loadExercises();
    }

    loadExercises(): void {
      this.exerciseService.getData()
        .subscribe(data => {
          this.exercises = data;
        });
    }

    onSubmit() {
    }

    onSelectChange(event: any): void {
      this.selectedExercise = event.value;
      this.workoutService.getId();
    }
  
    addExercise() {
      for (let i = 0; i <= this.exerciseIdCounter; i++) {
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
        } else {
          console.error('One or more elements not found for ID:', i);
        }
      }
    }
    
}
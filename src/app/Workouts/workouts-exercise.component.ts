import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatSelectModule } from '@angular/material/select';
import { ExerciseService } from "../Exercises/exerecise.service";
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-workouts-exercise',
    standalone: true,
    templateUrl: './workouts-exercise.component.html',
    imports: [FormsModule, MatSelectModule, CommonModule]
  })

  export class WorkoutsExerciseComponent{
    selectedExercise: string = '';

    constructor(private exerciseService: ExerciseService) { }

    exercises: any[] = [];
    
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
      const sets = (document.getElementById('sets') as HTMLInputElement).value;
      const reps = (document.getElementById('reps') as HTMLInputElement).value;
      const exercise = this.selectedExercise;
  
      console.log('Submitted:', exercise, sets, reps);
    }
  }

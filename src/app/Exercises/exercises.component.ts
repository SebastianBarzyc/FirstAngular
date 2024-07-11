import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ExerciseService } from './exercises.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-exercises',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './exercises.component.html'
})
export class ExercisesComponent {
  exerciseForm: FormGroup;
  exercises: string[] = [];

  constructor(private fb: FormBuilder, private exercisesService: ExerciseService) {
    this.exerciseForm = this.fb.group({
      name: ['']
    });
  }

  addExercise() {
    const exerciseName = this.exerciseForm.value.name;
    if (exerciseName) {
      this.exercisesService.addExercise(exerciseName);
      this.exercises = this.exercisesService.getExercises();
      this.exerciseForm.reset();
    }
  }
}

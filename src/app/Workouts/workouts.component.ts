import { ExerciseService } from './../Exercises/exercises.service';
import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { WorkoutPlanService } from './workouts.service';

@Component({
  selector: 'app-workout-plan',
  standalone: true,
  templateUrl: './workouts.component.html',
  imports: [ReactiveFormsModule]
})
export class WorkoutsComponent {
  workoutPlanForm: FormGroup;
  exercises: string[] = [];

  constructor(
    private fb: FormBuilder,
    private ExerciseService: ExerciseService,
    private workoutPlanService: WorkoutPlanService
  ) {
    this.exercises = this.ExerciseService.getExercises();
    this.workoutPlanForm = this.fb.group({
      name: [''],
      exercises: this.fb.array([])
    });
  }

  get exercisesArray(): FormArray {
    return this.workoutPlanForm.get('exercises') as FormArray;
  }

  addExercise() {
    const exerciseFormGroup = this.fb.group({
      name: [''],
      repetitions: [0],
      sets: [0],
      restTime: [0]
    });
    this.exercisesArray.push(exerciseFormGroup);
  }

  submitPlan() {
    const workoutPlan = this.workoutPlanForm.value;
    this.workoutPlanService.addWorkoutPlan(workoutPlan);
    this.workoutPlanForm.reset();
    while (this.exercisesArray.length) {
      this.exercisesArray.removeAt(0);
    }
  }
}

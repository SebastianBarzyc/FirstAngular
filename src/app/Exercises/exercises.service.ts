import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ExerciseService {
  private exercises: string[] = [];

  addExercise(exercise: string) {
    this.exercises.push(exercise);
  }

  getExercises(): string[] {
    return this.exercises;
  }
}

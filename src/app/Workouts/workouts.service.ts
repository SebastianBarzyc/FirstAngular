import { Injectable } from '@angular/core';

interface WorkoutExercise {
  name: string;
  repetitions: number;
  sets: number;
  restTime: number;
}

interface WorkoutPlan {
  name: string;
  exercises: WorkoutExercise[];
}

@Injectable({
  providedIn: 'root'
})
export class WorkoutPlanService {
  private workoutPlans: WorkoutPlan[] = [];

  addWorkoutPlan(workoutPlan: WorkoutPlan) {
    this.workoutPlans.push(workoutPlan);
  }

  getWorkoutPlans(): WorkoutPlan[] {
    return this.workoutPlans;
  }
}

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ExercisesService{
  getExercisesTitle(){
    return ["Squat", "Deadlift", "Bench Press", "Pull-Up", "Incline Dumbbell Press", "Bent-Over Row", "Lateral Raise", "Leg Extension", "Leg Curl", "Calf Raise", "Hanging Leg Raise", "Plank", "Leg Press", "Upright Row", "Bent-Over Dumbbell Fly"];
  }

  getExercisesDesc(){
    return ["Crucial exercise for legs, targeting quadriceps, glutes, and lower back.", "Full-body exercise focusing on lower back, glutes, and legs.", "Chest, triceps, and shoulders exercise.", "Back and biceps exercise.", "Targets upper chest.", "Back exercise, primarily targeting the latissimus dorsi.", "Shoulder exercise focusing on the lateral deltoids.", "Isolated exercise for quadriceps.", "Isolated exercise for hamstrings.", "Exercise for calf muscles.", "Abdominal exercise.", "Isometric exercise for core muscles and stabilizers.", "Exercise for leg muscles.", "Exercise for shoulders and trapezius.", "Exercise for rear deltoids and upper back."];
  }
}
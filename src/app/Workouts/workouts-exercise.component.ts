import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import {MatSelectModule} from '@angular/material/select';

interface Exercise {
  value: string;
}

@Component({
    selector: 'app-workouts-exercise',
    standalone: true,
    templateUrl: './workouts-exercise.component.html',
    imports: [FormsModule, MatSelectModule]
  })

  export class WorkoutsExerciseComponent{
    selectedValue: string = "";

    exercises: Exercise[] = [
    {value: "Squat"},
    {value: "Deadlift"}, 
    {value: "Bench Press"}, 
    {value: "Pull-Up"},
    {value: "Incline Dumbbell Press"},
    {value: "Bent-Over Row"}, 
    {value: "Lateral Raise"}, 
    {value: "Leg Extension"}, 
    {value: "Leg Curl"}, 
    {value: "Calf Raise"},
    {value: "Hanging Leg Raise"}, 
    {value: "Plank"}, 
    {value: "Leg Press"}, 
    {value: "Upright Row"}, 
    {value: "Bent-Over Dumbbell Fly"}
    ]

    
  }
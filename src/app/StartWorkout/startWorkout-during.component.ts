import { Component, Input, OnInit } from '@angular/core';
import { startWorkoutService } from './startWorkout.service';

interface Workout {
  id: number;
  title: string;
  description: string;
  exercises: Exercise[];
}

interface Exercise {
  title: string;
  sets: Sets[];
}

interface Sets {
  reps: number;
  //weight: number;
}

@Component({
  selector: 'app-startworkout-during',
  templateUrl: './startWorkout-during.component.html',
  standalone: true,
  // service is providedIn: 'root'
  imports: []
})

export class startWorkoutDuringComponent implements OnInit {
  @Input() workout: Workout | null = null;
  

  constructor(private startWorkoutService: startWorkoutService) {
  }

  ngOnInit(): void {
    console.log("startWorkoutDuringComponent initialized with workout:", this.workout);
  }
  
}
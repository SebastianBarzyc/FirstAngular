import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common'; // Import CommonModule
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select'; // Import MatSelectModule
import { CalendarService } from './calendar.service';
import { MatOption } from '@angular/material/core';
import { MatSelectChange } from '@angular/material/select';
import { WorkoutService } from '../Workouts/workouts.service';

interface Workout {
  id: number;
  title: string;
  descripe: string;
}

interface Exercise {
    id: number;
    exercise_id: number;
    exercise_title: string;
    title: string;
    sets: Set[];
  }

  interface Set {
    reps: number;
    weight: number;
    breakTime?: number;
    id?: number;
  }

  interface Exercise2 {
    id: number;
    exercise_id: number;
    exercise_title: string;
    title: string;
    sets: Set[];
    reps: []
  }

@Component({
  selector: 'app-calendar-advanced-edit',
  templateUrl: './calendar-advanced-edit.component.html',
  standalone: true,
  imports: [
    CommonModule, // Add CommonModule here
    MatDialogContent,
    MatDialogActions,
    MatButton,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule, // Add MatSelectModule here
    FormsModule,
    MatOption,
  ],
})
export class CalendarAdvancedEditComponent {
  workouts: Workout[] = []; // Ensure workouts is initialized as an empty array
  advanced: any = {};
  selectedWorkoutTitle: string = '';
  exercisesList: Exercise[] = [];

  constructor(
    private calendarService: CalendarService,
    private workoutService: WorkoutService,
    public dialogRef: MatDialogRef<CalendarAdvancedEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { group: string }
  ) {}

  async ngOnInit(): Promise<void> {
    await this.loadWorkouts();
  }

  loadWorkouts(): Promise<void> {
    return this.calendarService.getWorkouts().toPromise()
      .then((response) => {
        if (response && response) {
          this.workouts = response;
        } else {
          console.error('No data received from getWorkouts.');
          this.workouts = [];
        }
      })
      .catch((error) => {
        console.error('Error fetching workouts:', error);
        this.workouts = [];
      });
  }

  workoutChange(event: MatSelectChange): void {
    const workoutTitle = event.value; // Access the selected value
    this.calendarService.workoutChange(workoutTitle).subscribe({
      next: (workoutDetails) => {
        console.log('Workout details:', workoutDetails);
        this.advanced = { ...this.advanced, workoutDetails };
      },
      error: (err) => {
        console.error('Error in workoutChange:', err);
      },
    });
  }

  loadExercisesForPlan(planID: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.workoutService.getExercisesForPlan(planID).subscribe({
        next: (response: Exercise2[]) => {
          console.log('Received raw exercises for planID:', planID, response);
  
          this.exercisesList = response.map((exercise: Exercise2) => ({
            exercise_id: exercise.exercise_id,
            exercise_title: exercise.exercise_title,
            title: exercise.title, // Include the missing 'title' property
            sets: exercise.reps.map(rep => ({ reps: rep, weight: 0 })),
            id: this.exercisesList.length > 0 
              ? Math.max(...this.exercisesList.map(ex => ex.id)) + 1 
              : 1
          }));
  
          
      }});
    });
  }
}

import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatDialogActions, MatDialogContent, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { CalendarService } from './calendar.service';
import { MatOption } from '@angular/material/core';
import { MatSelectChange } from '@angular/material/select';
import { WorkoutService } from '../Workouts/workouts.service';
import { DatePipe } from '@angular/common';

interface Exercise2 {
  id: number;
  exercise_id: number;
  exercise_title: string;
  title: string;
  sets: Set[];
  reps: []
}

interface Set {
  reps: number;
  weight: number;
  breakTime?: number;
  id?: number;
}

interface Exercise {
  id: number;
  exercise_id: number;
  exercise_title: string;
  title: string;
  sets: Set[];
}

@Component({
  selector: 'app-calendar-advanced-edit',
  templateUrl: './calendar-advanced-edit.component.html',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogContent,
    MatDialogActions,
    MatButton,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    FormsModule,
    MatOption,
  ],
  providers: [DatePipe],
})
export class CalendarAdvancedEditComponent {
  workouts: any[] = [];
  selectedWorkoutTitle: { title: string } = { title: '' };
  days: string[] = [];
  newGroupTitle: string = '';
  exercisesList: Exercise[] = [];
  isEditMode: boolean = false; // Flag to determine if it's edit mode
  workoutPlanName: string = ''; // Variable to store the workout plan name

  constructor(
    private calendarService: CalendarService,
    private workoutService: WorkoutService,
    private datePipe: DatePipe,
    public dialogRef: MatDialogRef<CalendarAdvancedEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { group?: string } // Inject the group data
  ) {}

  async ngOnInit(): Promise<void> {
    this.isEditMode = !!this.data.group; // Set edit mode if group is not null
    if (this.isEditMode) {
      this.newGroupTitle = this.data.group || ''; // Pre-fill group title for editing
      await this.loadDaysForGroup(); // Load days for the selected group
      await this.loadWorkoutPlanName(); // Load the workout plan name
    }
    await this.loadWorkouts();
  }

  loadWorkoutPlanName(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.calendarService.getSessions().subscribe({
        next: (sessions) => {
          const groupSession = sessions.find(session => session.Advanced_group === this.data.group);
          if (groupSession) {
            this.workoutPlanName = groupSession.title; // Set the workout plan name
          } else {
            this.workoutPlanName = 'Unknown Plan'; // Fallback if no session is found
          }
          console.log('Loaded workout plan name:', this.workoutPlanName); // Debug log
          resolve();
        },
        error: (err) => {
          console.error('Error loading workout plan name:', err);
          reject(err);
        },
      });
    });
  }

  loadDaysForGroup(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.calendarService.getSessions().subscribe({
        next: (sessions) => {
          const groupSessions = sessions.filter(session => session.Advanced_group === this.data.group);
          this.days = groupSessions.map(session => session.date); // Pre-fill days
          console.log('Loaded days for group:', this.days); // Debug log
          resolve();
        },
        error: (err) => {
          console.error('Error loading days for group:', err);
          reject(err);
        },
      });
    });
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

  loadExercisesForPlan(planID: number ): Promise<void> {
    console.log('Loading exercises for planID:', planID); // Debug log
    return new Promise((resolve, reject) => {
      this.workoutService.getExercisesForPlan(planID).subscribe({
        next: (response: Exercise2[]) => {
          console.log('Received raw exercises for planID:', planID, response);
  
          this.exercisesList = response.map((exercise: Exercise2) => ({
            exercise_id: exercise.exercise_id,
            exercise_title: exercise.exercise_title,
            title: exercise.title,
            sets: exercise.reps.map(rep => ({ reps: rep, weight: 0 })),
            id: this.exercisesList.length > 0 
              ? Math.max(...this.exercisesList.map(ex => ex.id)) + 1 
              : 1
          }));    
      }});
    });
  }

  getDays(choosenDay: number): void {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const lastDayOfMonth = new Date(year, month + 1, 0).getDate();

    this.days = [];
    for (let day = today.getDate(); day <= lastDayOfMonth; day++) {
      const date = new Date(year, month, day);
      if (date.getDay() == choosenDay) {
        const formattedDate = this.datePipe.transform(date, 'dd.MM.yyyy');
        if (formattedDate) {
          this.days.push(formattedDate);
        }
      }
    }
  }

  saveNewSeries(): Promise<void> { 
    const workoutTitle = this.selectedWorkoutTitle.title; // Extract the title
    console.log('Workout Title:', workoutTitle); // Debug log

    return new Promise((resolve, reject) => {
      console.log(`${this.isEditMode ? 'Editing' : 'Saving new'} series with data:`, {
        title: workoutTitle,
        days: this.days,
        exercises: this.exercisesList,
        group: this.newGroupTitle,
      });

      this.calendarService
        .saveSessionAndExercises(workoutTitle, this.days, this.exercisesList, this.newGroupTitle)
        .subscribe({
          next: () => {
            console.log(`${this.isEditMode ? 'Edited' : 'New'} series saved successfully.`);
            this.calendarService.triggerRefresh(); // Notify calendar to refresh
            this.dialogRef.close(); // Close the dialog
            resolve();
          },
          error: (err) => {
            console.error(`Error ${this.isEditMode ? 'editing' : 'adding new'} series:`, err);
            this.calendarService.triggerRefresh(); // Notify calendar to refresh
            reject(err);
          },
        });
    });
  }

  deleteGroup(): void {
    if (!this.data.group) {
      console.error('No group specified for deletion.');
      return;
    }
  
      this.calendarService.deleteAdvancedGroup(this.data.group).subscribe({
        next: () => {
          console.log('Advanced group deleted successfully.');
          this.calendarService.triggerRefresh(); // Notify calendar to refresh
          this.dialogRef.close(); // Close the dialog
        },
        error: (err) => {
          console.error('Error deleting advanced group:', err);
        },
      });
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
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
import { WorkoutService } from '../Workouts/workouts.service';
import { DatePipe } from '@angular/common';
import { Subscription } from 'rxjs';

interface Exercise2 {
  order: number;
  exercise_id: number;
  exercise_title: string;
  sets: number;
  reps: [];
  breakTimes: [];
}

interface Set {
  reps: number;
  weight: number;
  breakTime?: number;
  id?: number;
}

interface Exercise {
  order: number;
  exercise_id: number;
  exercise_title: string;
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
  isEditMode: boolean = false;
  workoutPlanName: string = '';
  maxIdSession: number = 0;

  constructor(
    private calendarService: CalendarService,
    private workoutService: WorkoutService,
    private datePipe: DatePipe,
    public dialogRef: MatDialogRef<CalendarAdvancedEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { group?: string }
  ) {}

  ngOnInit(): void{
    this.isEditMode = !!this.data.group;
    if (this.isEditMode) {
      this.newGroupTitle = this.data.group || '';
      this.loadDaysForGroup();
      this.loadWorkoutPlanName();
    }
    this.loadWorkouts();
  }

  loadWorkoutPlanName(): void {
    this.calendarService.getSessions().subscribe({
      next: (sessions) => {
        const groupSession = sessions.find(session => session.Advanced_group === this.data.group);
        if (groupSession) {
          this.workoutPlanName = groupSession.title;
        } else {
          this.workoutPlanName = 'Unknown Plan';
        }
        console.log('Loaded workout plan name:', this.workoutPlanName);
      },
      error: (err) => {
        console.error('Error loading workout plan name:', err);
      },
    });
  }

  loadDaysForGroup(): void {
      this.calendarService.getSessions().subscribe({
        next: (sessions) => {
          const groupSessions = sessions.filter(session => session.Advanced_group === this.data.group);
          this.days = groupSessions.map(session => session.date);
          console.log('Loaded days for group:', this.days);
        },
        error: (err) => {
          console.error('Error loading days for group:', err);
        },
      });
  }

  loadWorkouts(): Subscription {
    return this.calendarService.getWorkouts().subscribe({
      next: (response) => {
        this.workouts = response;
      },
      error: (error) => {
        console.error('Error fetching workouts:', error);
        this.workouts = [];
      }
    });
  }

  loadExercisesForPlan(planID: number ): void {
    console.log('Loading exercises for planID:', planID);
      this.workoutService.getExercisesForPlan(planID).subscribe({
        next: (response: Exercise2[]) => {
          console.log('Received raw exercises for planID:', planID, response);
  
          this.exercisesList = response.map((exercise: Exercise2, index: number) => ({
            exercise_id: exercise.exercise_id,
            exercise_title: exercise.exercise_title,
            sets: exercise.reps.map((rep, repIndex) => ({ reps: rep, weight: 0, breakTime: exercise.breakTimes[repIndex] || 0 })),
            order: this.maxIdSession + index + 1
          }));    
      }});
  }

  getMaxSessionId(){
    this.calendarService.getMaxSessionId().subscribe(maxId => {
      this.maxIdSession = maxId;
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

  async saveNewSeries(): Promise<void> { 
    const workoutTitle = this.selectedWorkoutTitle.title;
    console.log('Workout Title:', workoutTitle);

    console.log(`${this.isEditMode ? 'Editing' : 'Saving new'} series with data:`, {
      title: workoutTitle,
      days: this.days,
      exercises: this.exercisesList,
      group: this.newGroupTitle,
    });

    await this.calendarService.saveSessionAndExercises(workoutTitle, this.days, this.exercisesList, this.newGroupTitle);
    console.log(`${this.isEditMode ? 'Edited' : 'New'} series saved successfully.`);
    this.calendarService.triggerRefresh();
    this.dialogRef.close();
  }

  async deleteGroup(): Promise<void> {
    if (!this.data.group) {
      console.error('No group specified for deletion.');
      return;
    }
    await this.calendarService.deleteAdvancedGroup(this.data.group);
    console.log('Advanced group deleted successfully.');
    this.calendarService.triggerRefresh();
    this.dialogRef.close();
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
import { WorkoutService } from './../Workouts/workouts.service';
import { Component, ElementRef, Inject, OnInit, QueryList, ViewChildren, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { CalendarService} from './calendar.service';
import { MatOptionModule } from '@angular/material/core';
import { Subject, Subscription} from 'rxjs';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { CalendarItemComponent } from "./calendar-item.component";
import { Router } from '@angular/router';

interface Session {
  session_id: number;
  date: string;
  title: string,
  description: string
}

interface Workout {
  id: number
  title: string,
  descripe: string
}

interface Exercise {
  order: number;
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
  order: number;
  exercise_id: number;
  exercise_title: string;
  title: string;
  sets: number;
  reps: [];
  breakTimes: [];
}

@Component({
  selector: 'calendar-edit',
  templateUrl: './calendar-edit.component.html',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
    FormsModule,
    MatOptionModule,
    MatSelectModule,
    MatIconModule,
    CalendarItemComponent
],
})

export class CalendarEditComponent implements OnInit, AfterViewInit {
  refreshNeeded$!: Subject<void>;
  exercises: Exercise[] = [];
  exercisesList: Exercise[] = [];
  workouts: Workout[] = [];
  sessions: Session[] = [];
  selectedWorkoutTitle: string = '';
  currentSession: Session | null = null; // Cache current session
  newSession = {
    date: this.getDate(),
    title: '',
    description: ''
  };

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { date: Date, refreshNeeded$: Subject<void> },
    private calendarService: CalendarService,
    public dialogRef: MatDialogRef<CalendarEditComponent>,
    private workoutService: WorkoutService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {
  }

  @ViewChildren('textarea') textareas!: QueryList<ElementRef<HTMLTextAreaElement>>;

  async ngOnInit(): Promise<void> {
    console.log("CalendarEditComponent - data received:", this.data);
    await this.loadSessionsAsync();
    this.currentSession = this.getSessionOrEmpty();
    if (this.currentSession) {
      this.newSession.title = this.currentSession.title;
      this.newSession.description = this.currentSession.description;
      this.newSession.date = this.currentSession.date;
    }
    
    this.loadWorkouts();
    this.loadExercisesList();
  }

  ngAfterViewInit(): void {
    this.textareas.changes.subscribe(() => {
      setTimeout(() => {
        this.textareas.forEach(textarea => {
          this.autoResize(textarea.nativeElement);
        });
      }, 0);
    });
    setTimeout(() => {
      this.textareas.forEach(textarea => {
        this.autoResize(textarea.nativeElement);
      });
    }, 0);
    this.cdr.detectChanges(); 
  }
  
  loadSessions(): void {
    this.calendarService.getSessions().subscribe({
      next: (sessions) => {
        this.sessions = sessions;
      },
      error: (err) => {
        console.error('Error loading sessions:', err);
      },
    });
  }

  loadSessionsAsync(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.calendarService.getSessions().subscribe({
        next: (sessions) => {
          this.sessions = sessions;
          console.log('Sessions loaded:', this.sessions);
          resolve();
        },
        error: (err) => {
          console.error('Error loading sessions:', err);
          reject(err);
        },
      });
    });
  }

  loadWorkouts(): Subscription {
    return this.calendarService.getWorkouts().subscribe({
      next: (response) => {
        if (response && response) {
          this.workouts = response;
          console.log('Loaded workouts:', this.workouts);
        } else {
          console.error('No data received from getWorkouts.');
          this.workouts = [];
        }
      },
      error: (error) => {
        console.error('Error fetching workouts:', error);
        this.workouts = [];
      }
    });
  }
  
  getSessionOrEmpty(): any {
    const date = this.getDate()
    const session = this.sessions.find(s => s.date === date);
    if (session) {
      return session;
    } else {
      return {
        session_id: '',
        date: date,
        title: '',
        description: ''
      };
    }
  }

  getMaxSessionId(): number {
    if (this.sessions.length === 0) {
      return 0;
    }
    const maxId = Math.max(...this.sessions.map(session => session.session_id));
    console.log("Max Session ID:", maxId);
    return maxId;
  }

  async Delete(id: number): Promise<void>  {
    console.log("deleteid: ",id);
    const response = await this.calendarService.deleteSession(id);
    console.log("Session deleted: ", response);
    this.refreshNeeded$.next();
    this.dialogRef.close();
  }

  async Save(session: any): Promise<void> {
    if (this.calendarService.user === null) {
      console.error('User ID is null, cannot add exercise.');
      this.dialogRef.close();
      this.router.navigate(['/Profile']);
      return;
    } else {
      const newSessionId = this.getMaxSessionId() + 1;
      const sessionToSave = {
        ...session,
        title: this.newSession.title || session.title,
        description: this.newSession.description || session.description,
        date: this.newSession.date || session.date,
        session_id: newSessionId
      };
    
      if (sessionToSave.session_id == newSessionId) {
        this.createSession(sessionToSave);  
      } else {
        this.updateSession(sessionToSave);
      }
      
      const exercises = this.exercisesList.map((exercise) => ({
        exercise_id: exercise.exercise_id,
        exercise_title: exercise.exercise_title,
        sets: exercise.sets.map((set: Set) => ({
          reps: set.reps,
          weight: set.weight,
          breakTime: set.breakTime
        })),
        order: exercise.order
      }));

      const responseEditSession3 = await this.calendarService.editSession3(exercises, sessionToSave.session_id);
      
      console.log('Session saved:', responseEditSession3);
      this.dialogRef.close();
    }
  }

  async createSession(session: any): Promise<void> {
    console.log("create: ",session);
    try {
      const response = await this.calendarService.addSession(session);
          this.refreshNeeded$.next();
          console.log('Session created:', 'Date: ', session.date, 'Title: ', session.title, 'Description: ', session.description);
    } catch (error) {
      console.error('Unexpected error during session creation:', error);
    }
  }

  async updateSession(session: any): Promise<void> {
    const response = await this.calendarService.editSession(session.session_id, session.title, session.description);
    this.refreshNeeded$.next();
    console.log('Response from server (updateSession):', response);
    this.dialogRef.close();
  }

  updateExerciseTitle(): void {
    this.exercisesList.forEach(ex => {
      if (ex.exercise_id === 0) {
        const matchingExercise = this.exercises.find(exercise => exercise.title === ex.exercise_title);
        if (matchingExercise) {
          ex.exercise_id = matchingExercise.exercise_id;
        }
      }
    });
  
    console.log("Updated exercises list:", this.exercisesList);
  }
  
  autoResize(textarea: HTMLTextAreaElement) {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  }

  getDate(): string {
    const year = this.data.date.getFullYear();
    const month = String(this.data.date.getMonth() + 1).padStart(2, '0');
    const day = String(this.data.date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  isDateExist(): boolean{ 
    return this.sessions.some(session => {
      return session.date === this.getDate();
    });
  }

  removeExercise(ID: number): void {
    this.exercisesList = this.exercisesList.filter(exercise => exercise.order !== ID);
    console.log('Updated exercises list:', this.exercisesList);
  }

  addExercise(): void {
    const maxOrder = this.exercisesList.length > 0 
    ? Math.max(...this.exercisesList.map(exercise => exercise.order))
    : 0;

    const newExercise: Exercise = {
      exercise_id: 0,
      exercise_title: '', 
      title: this.currentSession?.title || '',
      sets: [
        { reps: 0, weight: 0, breakTime: 0 }
      ],
      order: maxOrder + 1
    };
    this.exercisesList.push(newExercise);
    console.log('Updated exercises list:', this.exercisesList);
  }

  loadExercisesList(): void {
    const session = this.currentSession || this.getSessionOrEmpty();
    console.log("Loading exercises for session:", session);
    if(session.session_id){
      this.calendarService.getExercisesList(session.session_id).subscribe({
        next: (response) => {
          this.exercisesList = response.map((exercise: any) => ({
            order: exercise.order,
            exercise_id: exercise.exercise_id,
            exercise_title: exercise.exercise_title,
            title: exercise.title ?? '',
            sets: exercise.sets ?? []
          }));
          setTimeout(() => {
            this.textareas.forEach(textarea => {
              this.autoResize(textarea.nativeElement);
            });
          }, 0);
              console.log("Loaded exercises list:", this.exercisesList);

      },
        error: (error) => {
          console.error('Error during exercise fetch:', error);
          this.exercisesList = [];
        }
      });
    }
  }
  
  workoutChange(workoutTitle: string) {
    const matchingWorkout = this.workouts.find(workout => workout.title === workoutTitle);
  
    if (matchingWorkout) {
      this.loadExercisesForPlan(matchingWorkout.id);
    } else {
      console.error(`Workout with title "${workoutTitle}" not found.`);
    }
  }

  loadExercises(): Subscription {
    return this.calendarService.getExercises().subscribe({
      next: (response) => {
        this.exercises = response.data;
      },
      error: (error) => {
        console.error('Error loading exercises:', error);
      }
    });
  }

  loadExercisesForPlan(planID: number): void {
      this.workoutService.getExercisesForPlan(planID).subscribe({
        next: (response) => {
          console.log('Received raw exercises for planID:', planID, response);
  
          this.exercisesList = response.map((exercise: Exercise2) => ({
            exercise_id: exercise.exercise_id,
            exercise_title: exercise.exercise_title,
            sets: Array.isArray(exercise.reps)
              ? exercise.reps.map((rep, index) => ({ reps: rep, weight: 0, breakTime: exercise.breakTimes[index] || 0 }))
              : [],
            id: this.exercisesList.length > 0 
              ? Math.max(...this.exercisesList.map(ex => ex.order)) + 1 
              : 1
          }));
  
          console.log('Transformed exercises list:', this.exercisesList);
          setTimeout(() => {
            this.textareas.forEach(textarea => {
              this.autoResize(textarea.nativeElement);
            });
          }, 0);
        },
        error: (err) => {
          console.error('Error fetching or transforming exercises:', err);
        }
      });
  }
  
}

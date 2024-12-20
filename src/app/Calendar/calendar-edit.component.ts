import { CalendarComponent } from './calendar.component';
import { WorkoutService } from './../Workouts/workouts.service';
import { Component, Inject, Input, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { CalendarService} from './calendar.service';
import { MatOptionModule } from '@angular/material/core';
import { Observable, Subject, tap } from 'rxjs';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { CalendarItemComponent } from "./calendar-item.component";

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
  id: number;
  exercise_id: number;
  exercise_title: string;
  title: string;
  sets: Set[];
}

interface Set {
  reps: number;
  weight: number;
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

export class CalendarEditComponent implements OnInit {
  refreshNeeded$!: Subject<void>;

  exercises: Exercise[] = [];
  exercisesList: Exercise[] = [];
  workouts: Workout[] = [];
  sessions: Session[] = [];
  selectedWorkoutTitle: string = '';
  newSession = {
    date: this.getDate(),
    title: '',
    description: ''
  };
  planExercises: [] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { date: Date, refreshNeeded$: Subject<void> },
    private calendarService: CalendarService,
    public dialogRef: MatDialogRef<CalendarEditComponent>,
    private workoutService: WorkoutService,
  ) {
    this.refreshNeeded$ = data.refreshNeeded$
  }

  async ngOnInit(): Promise<void> {
    await this.loadSessions().toPromise();
    this.loadWorkouts();
    this.loadExercisesList();
    const session = this.getSessionOrEmpty();
  if (session) {
    this.newSession.title = session.title;
    this.newSession.description = session.description;
    this.newSession.date = session.date;
  }
  }
  
  loadSessions(): Observable<Session[]> {
    return this.calendarService.getSessions().pipe(
      tap((data: Session[]) => {
        this.sessions = data;
      })
    );
  } 

  loadWorkouts(): Promise<void> {
    return this.calendarService.getWorkouts().toPromise().then(response => {
      this.workouts = response.data;
    });
  }
  
  getSessionOrEmpty(): any {
    const date = this.getDate();
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
    return Math.max(...this.sessions.map(session => session.session_id));
  }
  

  Delete(id: number) {
    console.log("deleteid: ",id);
    this.calendarService.deleteSession(id).subscribe({
      next: response => {
        console.log("Session deleted: ", response);
        this.refreshNeeded$.next();
        this.dialogRef.close();
      },
      error: error => {
        console.error('Error from server:', error);
      }
    });
  }

  Save(session: any): void {
    const newSessionId = this.getMaxSessionId() + 1;
  
    const sessionToSave = {
      ...session,
      title: this.newSession.title || session.title,
      description: this.newSession.description || session.description,
      date: this.newSession.date || session.date,
      session_id: this.getSessionOrEmpty().session_id || newSessionId
    };
  
    if (sessionToSave.session_id == newSessionId) {
      this.createSession(sessionToSave);  
    } else {
      this.updateSession(sessionToSave);
    }
    
    this.exercisesList.forEach(exercise => {
      exercise.sets.forEach(set => {
        this.calendarService.editSession3(
          exercise.exercise_id,
          exercise.exercise_title,
          set.reps,
          set.weight,
          sessionToSave.session_id
        ).subscribe({
          next: response => {
            this.refreshNeeded$.next();
            console.log('Session saved:', response);
          },
          error: error => {
            console.error('Error during saving session:', error);
          }
        });
      });
    });
    this.refreshNeeded$.next();
    this.dialogRef.close();
  }

  createSession(session: any) {
    console.log("create: ",session);
    this.calendarService.addSession(session).pipe(
      tap(response => {
        this.refreshNeeded$.next();
        console.log('Session added successfully:', response);
      })
    ).subscribe(
      response => {
        console.log('Session created:', 'Date: ', session.date, 'Title: ', session.title, 'Description: ', session.description);
      },
      error => {
          console.error('Error adding session:', error);
      }
    );
  }

  updateSession(session: any) {
    this.calendarService.editSession(session.session_id, session.title, session.description).subscribe({
      next: response => {
        this.refreshNeeded$.next();
        console.log('Response from server (updateSession):', response);
        this.dialogRef.close();
      },
      error: error => {
        console.error('Error from server (updateSession):', error);
      }
    });

    this.calendarService.editSession2(session.session_id).subscribe({
      next: response => {
        this.refreshNeeded$.next();
        console.log('Response from server (editSession2):', response);
      },
      error: error => {
        console.error('Error from server (editSession2):', error);
      }
    });
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

  getDate() {
    return this.data.date.toLocaleDateString('pl-PL');
  }

  isDateExist(): boolean{ 
    return this.sessions.some(session => {
      return session.date === this.getDate();
    });
  }

  loadExercises(): Promise<void> {
    return this.calendarService.getExercises().toPromise().then(response => {
      this.exercises = response.data;
    });
  }

  removeExercise(ID: number): void {
    this.exercisesList = this.exercisesList.filter(exercise => exercise.id !== ID);
    console.log('Updated exercises list:', this.exercisesList);
  }

  addExercise(): void {
    const maxId = this.exercisesList.length > 0 
    ? Math.max(...this.exercisesList.map(exercise => exercise.id))
    : 0;

    const newExercise: Exercise = {
      exercise_id: 0,
      exercise_title: '', 
      title: this.getSessionOrEmpty().title || '',
      sets: [
        { reps: 0, weight: 0 },
      ],
      id: maxId + 1
    };
    this.exercisesList.push(newExercise);
    console.log('Updated exercises list:', this.exercisesList);
  }

  loadExercisesList(): void {
    const session = this.getSessionOrEmpty();
    this.calendarService.getExercisesList(session.session_id).subscribe({
      next: (response) => {
        const maxId = this.exercisesList.length > 0 
          ? Math.max(...this.exercisesList.map(exercise => exercise.id))
          : 0;
  
        this.exercisesList = response.map((exercise, index) => ({
          ...exercise,
          id: maxId + index + 1
        }));
      },
      error: (error) => {
        console.error('Error during exercise fetch:', error);
        this.exercisesList = [];
      }
    });
  }
  
  workoutChange(workoutTitle: string) {
    const matchingWorkout = this.workouts.find(workout => workout.title === workoutTitle);
  
    if (matchingWorkout) {
      this.loadExercisesForPlan(matchingWorkout.id);
    } else {
      console.error(`Workout with title "${workoutTitle}" not found.`);
    }
  }

  loadExercisesForPlan(planID: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.workoutService.getExercisesForPlan(planID).subscribe({
        next: (response) => {
          console.log('Received raw exercises for planID:', planID, response.data);
  
          // Przekształcamy dane do oczekiwanego formatu
          this.exercisesList = response.data.map((exercise: Exercise2) => ({
            exercise_id: exercise.exercise_id,
            exercise_title: exercise.exercise_title,
            sets: exercise.reps.map(rep => ({ reps: rep, weight: 0 })), // Tworzymy tablicę `sets` na podstawie `reps`
            id: this.exercisesList.length > 0 
              ? Math.max(...this.exercisesList.map(ex => ex.id)) + 1 
              : 1 // Generujemy unikalne `id` dla każdego ćwiczenia
          }));
  
          console.log('Transformed exercises list:', this.exercisesList);
          resolve();
        },
        error: (err) => {
          console.error('Error fetching or transforming exercises:', err);
          reject(err);
        }
      });
    });
  }
  
}
 
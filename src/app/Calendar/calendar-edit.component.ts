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
  @Input() refreshNeeded$!: Subject<void>;

  exercises = [];
  exercisesList: Exercise[] = [];
  workouts: Workout[] = [];
  sessions: Session[] = [];
  selectedWorkoutTitle: string = '';
  newSession = {
    date: this.getDate(),
    title: '',
    description: ''
  };

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { date: Date },
    private calendarService: CalendarService,
    public dialogRef: MatDialogRef<CalendarEditComponent>
  ) {
  }

  async ngOnInit(): Promise<void> {
    await this.loadSessions().toPromise();
    this.loadWorkouts();
    this.loadExercisesList();
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

  Delete(id: number) {
    this.calendarService.deleteSession(id).subscribe({
      next: response => {
        this.refreshNeeded$.next();
        this.dialogRef.close();
      },
      error: error => {
        console.error('Error from server:', error);
      }
    });
  }

  Save(session: any): void {
    if (this.isDateExist()) {
      this.updateSession(session);
    } else {
      this.createSession(session);
    }
    this.refreshNeeded$.next();
    this.dialogRef.close();
  }

  createSession(session: any) {
    console.log(session);
    this.calendarService.addSession(session).pipe(
      tap(response => {
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
        console.log('Response from server (updateSession):', response);
        this.dialogRef.close();
      },
      error: error => {
        console.error('Error from server (updateSession):', error);
      }
    });
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
      id: maxId + 1,
      exercise_id: 0,
      exercise_title: '', 
      title: '',
      sets: [
        { reps: 0, weight: 0 },
      ]
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
        console.log('Updated exercises list with IDs:', this.exercisesList);
      },
      error: (error) => {
        console.error('Error during exercise fetch:', error);
        this.exercisesList = [];
      }
    });
  }
  
  
}
 
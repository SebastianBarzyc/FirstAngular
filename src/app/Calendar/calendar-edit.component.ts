import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { CalendarService} from './calendar.service';
import { MatOptionModule } from '@angular/material/core';
import { tap } from 'rxjs';
import { MatSelectModule } from '@angular/material/select';

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
    MatSelectModule
  ],
})

export class CalendarEditComponent implements OnInit {
  exercises = [];
  workouts: Workout[] = [];
  sessions: Session[] = [];
  exercisesSession: any[] = [];
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

  ngOnInit(): void {
    this.loadSessions();
    this.loadWorkouts();
  }

  loadSessions(): void {
    this.calendarService.getSessions().subscribe(
      (data: Session[]) => {
        this.sessions = data;
      }
    );
  }

  loadWorkouts(): Promise<void> {
    return this.calendarService.getWorkouts().toPromise().then(response => {
      this.workouts = response.data;
    });
  }
  
  getSessionOrEmpty(): any {
    const date = this.getDate();
    const formattedDate = date;
    const session = this.sessions.find(s => s.date === formattedDate);
 
    if (session) {
      return session;
    } else {
      return {
        session_id: '',
        date: formattedDate,
        title: '',
        description: ''
      };
    }
  }
  
  
  addExercise(): void {
    const newExercise = { name: '', description: '' };
      this.exercisesSession.push(newExercise);
  }

  Delete(id:number): void {
    console.log('Plan deleted: ', id);
    this.dialogRef.close(this.sessions);
  }

  Save(session: any): void {

    if (this.isDateExist()) {
      this.updateSession(session);
    } else {
      this.createSession(session);
    }
    console.log('Session data:', 'Date: ', session.date, 'Title: ', session.title, 'Description: ', session.description);
    this.dialogRef.close(this.sessions);
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
}

import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CalendarItemComponent } from './calendar-item.component';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { CalendarService} from './calendar.service';
import { MatOptionModule } from '@angular/material/core';

interface Session {
  session_id: number;
  plan_id: number;
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
    CalendarItemComponent,
    MatDialogModule,
    FormsModule,
    MatIcon,
    MatOptionModule
  ],
})

export class CalendarEditComponent implements OnInit {
  
  selectedDate: Date;
  exercises = [];
  workouts: Workout[] = [];
  sessions: Session[] = [];
  exercisesSession: any[] = [];
  selectedWorkoutTitle: string = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { date: Date },
    private calendarService: CalendarService,
    public dialogRef: MatDialogRef<CalendarEditComponent>
  ) {
    this.selectedDate = data.date;
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
    const selectedDate = this.getDate().toISOString();
    const session = this.sessions.find(s => s.date === selectedDate);
    if (session) {
      return session;
    } else {
      return { 
        session_id: null,
        plan_id: null,
        date: selectedDate,
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

  Save(id: number, title: string, description: string): void {
    console.log('Plan saved:', id, title, description);
    this.dialogRef.close(this.sessions);
  }

  autoResize(textarea: HTMLTextAreaElement) {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  }

  getDate() {
    return this.data.date;
  }
  
}

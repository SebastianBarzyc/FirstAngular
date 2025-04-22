import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { CalendarEditComponent } from './calendar-edit.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CalendarService } from './calendar.service';
import { Subject } from 'rxjs';
import { CalendarAdvancedComponent } from './calendar-advanced.component'; // Import the advanced component
import { getUser } from '../supabase-client';

interface Session {
  session_id: number;
  date: string;
  title: string,
  description: string
}

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
  ],
  providers: [DatePipe] 
})
export class CalendarComponent implements OnInit {
  currentDate: Date = new Date();
  days: number[][] = [];
  selectedDay: number = 0;
  sessions: Session[] = [];
  refreshNeeded$: Subject<void> = new Subject<void>();
  date2: string = '';

  constructor(private datePipe: DatePipe, private dialog: MatDialog, private calendarService: CalendarService) {
    this.generateCalendar(this.currentDate);
    this.subscribeToRefresh();
  }

  ngOnInit(): void {
    this.calendarService.refreshNeeded$.subscribe(() => {
      this.loadSessions(); // Reload sessions
    });

    this.loadSessions();
    console.log("getuser: ", getUser());
  }

  subscribeToRefresh(): void {
    this.calendarService.refreshNeeded$.subscribe(() => {
      this.loadSessions();
    });
  }

  generateCalendar(date: Date): void {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    this.date2 = this.datePipe.transform(date, 'MMMM yyyy') || '';
  
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
  
    let firstDayIndex = firstDay.getDay();
    firstDayIndex = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
  
    const totalDays = lastDay.getDate();
    let dayCounter = 1;
    this.days = [];
  
    for (let i = 0; i < 6; i++) {
      const week: number[] = [];
      for (let j = 0; j < 7; j++) {
        if (i === 0 && j < firstDayIndex) {
          week.push(0);
        } else if (dayCounter > totalDays) {
          week.push(0);
        } else {
          week.push(dayCounter++);
        }
      }
      this.days.push(week);
    }
  }
  
  openDayEditor(day: number): void {
    const selectedDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), day);
    console.log(selectedDate);
    const dialogRef = this.dialog.open(CalendarEditComponent, {
      data: { date: selectedDate, refreshNeeded$: this.refreshNeeded$},
      panelClass: 'editPanel'
    });

    dialogRef.afterClosed().subscribe(() => {
      this.loadSessions();
    });
  }

  changeMonth(offset: number): void {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + offset, 1);
    this.generateCalendar(this.currentDate);
  }

  isToday(day: number): boolean {
    const today = new Date();
    return (
      day === today.getDate() &&
      this.currentDate.getMonth() === today.getMonth() &&
      this.currentDate.getFullYear() === today.getFullYear()
    );
  }

  loadSessions(): void {
    this.calendarService.getSessions().subscribe({
      next: (sessions) => {
        this.sessions = sessions;
        this.generateCalendar(this.currentDate); // Regenerate calendar
      },
      error: (err) => {
        console.error('Error loading sessions:', err);
      },
    });
  }

  getPlanForDay(day: number): string | null {
    if (day === 0) {
      return null;
    }
    const date = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), day);
    const formattedDate = this.datePipe.transform(date, 'dd.MM.yyyy');
    const session = this.sessions.find(s => s.date === formattedDate);
    return session ? session.title : null;
  }
  
  private parseDate(dateString: string): Date {
    const [day, month, year] = dateString.split('.').map(Number);
    return new Date(year, month - 1, day);
  }

  getUpcomingSessions() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.sessions
      .filter(session => {
        const sessionDate = this.parseDate(session.date);
        return sessionDate >= today;
      })
      .sort((a, b) => {
        const dateA = this.parseDate(a.date);
        const dateB = this.parseDate(b.date);
        return dateA.getTime() - dateB.getTime();
      });
  }

  openSessionEditor(session: Session): void {
    if (session && session.date) {
      const dateParts = session.date.split('.');
      const sessionDate = new Date(
        parseInt(dateParts[2]),
        parseInt(dateParts[1]) - 1,
        parseInt(dateParts[0])
      );
  
      const dialogRef = this.dialog.open(CalendarEditComponent, {
        data: { session, date: sessionDate, refreshNeeded$: this.refreshNeeded$ },
        panelClass: 'editPanel'
      });

      dialogRef.afterClosed().subscribe(() => {
        this.loadSessions();
      });
    } else {
      console.error('Session data is missing or invalid', session);
    }
  }

  openAdvancedDialog(): void {
    this.dialog.open(CalendarAdvancedComponent, {
      width: '80vw',
      height: '80vh',
    });
  }
}

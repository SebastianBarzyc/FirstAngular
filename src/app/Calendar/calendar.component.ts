import { CommonModule, DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { CalendarEditComponent } from './calendar-edit.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

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
export class CalendarComponent {
  currentDate: Date = new Date();
  days: number[][] = [];
  selectedDay: number = 0;

  constructor(private datePipe: DatePipe, private dialog: MatDialog) {
    this.generateCalendar(this.currentDate);
  }

  date2: string = '';

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
    const dialogRef = this.dialog.open(CalendarEditComponent, {
      data: { date: selectedDate },
      panelClass: 'editPanel'
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
}

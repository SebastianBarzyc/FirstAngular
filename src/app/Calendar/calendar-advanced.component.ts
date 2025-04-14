import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogActions, MatDialogContent, MatDialogRef } from '@angular/material/dialog';
import { CalendarService } from './calendar.service';
import { CommonModule } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatButton, MatFabButton } from '@angular/material/button';
import { CalendarAdvancedEditComponent } from './calendar-advanced-edit.component';

@Component({
  selector: 'app-calendar-advanced',
  templateUrl: './calendar-advanced.component.html',
  standalone: true,
  imports: [
    CommonModule,
    MatIcon,
    MatFabButton,
    MatDialogActions,
    MatDialogContent
],
})
export class CalendarAdvancedComponent implements OnInit {
  advancedGroups: string[] = [];

  constructor(
    public dialogRef: MatDialogRef<CalendarAdvancedComponent>,
    private calendarService: CalendarService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadAdvancedGroups();
  }

  loadAdvancedGroups(): void {
    this.calendarService.getAdvancedGroups().subscribe({
      next: (groups) => {
        console.log('Reloaded advanced groups:', groups); // Debug log
        this.advancedGroups = groups;
      },
      error: (err) => {
        console.error('Error loading Advanced_group values:', err);
      },
    });
  }

  openAddDialog(group?: string): void {
    const dialogRef = this.dialog.open(CalendarAdvancedEditComponent, {
      width: '50vw',
      data: { group }, // Pass the group data
    });

    dialogRef.afterClosed().subscribe(() => {
      this.loadAdvancedGroups(); // Reload advanced groups after adding or editing
    });
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}

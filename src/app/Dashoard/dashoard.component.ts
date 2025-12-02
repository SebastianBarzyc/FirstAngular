import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { CalendarService } from '../Calendar/calendar.service';
import { getUser } from '../supabase-client';
import { startWorkoutComponent } from '../StartWorkout/StartWorkout.component';
import { CalendarEditComponent } from '../Calendar/calendar-edit.component';
import { AchievementsService } from './achievements.service';

@Component({
  selector: 'app-dashoard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashoard.component.html',
})

export class DashoardComponent implements OnInit {
  sessions: any;
  upcomingSessions: any[] = [];
  todaysWorkout: string = '';
  displayName: string = '';

  TitleAchievementList: string[];
  DescAchievementList: string[];
  ScoreAchievementList: string[];
  AchievementsIndexArray: number[];

  constructor(
    private achievementService: AchievementsService,
    private calendarService: CalendarService,
    public dialog: MatDialog
  ) {
  
    this.DescAchievementList = this.achievementService.getDescAchievement();
    this.TitleAchievementList = this.achievementService.getTitleAchievement();
    this.ScoreAchievementList = this.achievementService.getScoreAchievement();

    const AchievementsMaxLength = Math.min(this.TitleAchievementList.length, this.DescAchievementList.length);
    this.AchievementsIndexArray = Array.from({ length: AchievementsMaxLength }, (_, index) => index);
  }

  ngOnInit(): void {
    this.loadUpcomingSessions();
    const user = getUser();
    if (user && user.user_metadata) {
      this.displayName = user.user_metadata['display_name'] || 'User';
    } else {
      console.warn("User or user_metadata is null. Setting default displayName.");
      this.displayName = 'User';
    }
  }

  loadUpcomingSessions(): void {
    this.calendarService.getSessions().subscribe((sessions: any[]) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todaysSessions = sessions.filter(session => {
        const sessionDate = new Date(session.date.split('.').reverse().join('-'));
        sessionDate.setHours(0, 0, 0, 0);
        return sessionDate.getTime() === today.getTime();
      });

      if (todaysSessions.length > 0) {
        this.todaysWorkout = todaysSessions[0].title;
      } else {
        this.todaysWorkout = 'There is no workout today';
      }

      this.upcomingSessions = sessions
        .filter(session => {
          const sessionDate = new Date(session.date.split('.').reverse().join('-'));
          sessionDate.setHours(0, 0, 0, 0);
          return sessionDate >= today;
        })
        .sort((a, b) => {
          const dateA = new Date(a.date.split('.').reverse().join('-'));
          const dateB = new Date(b.date.split('.').reverse().join('-'));
          return dateA.getTime() - dateB.getTime();
        })
        .slice(0, 5);
            console.log("Upcoming Sessions: ", this.upcomingSessions);
    });
  }
  startWorkout(): void {
    this.dialog.open(startWorkoutComponent, {
      width: '50%',
      height: 'auto',
      maxHeight: '90vh'
    });
  }

  openSessionEditor(session: any): void {
    console.log('Editing session:', session);
        const realDate = new Date(session);
        const dialogRef = this.dialog.open(CalendarEditComponent, {
          data: { date: realDate},
          panelClass: 'editPanel'
        });

        dialogRef.afterClosed().subscribe(() => {
          this.loadSessions();
        });
  }

    loadSessions(): void {
      this.calendarService.getSessions().subscribe((sessions: any[]) => {
        this.sessions = sessions;
      });
    } 
    
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AchievementsService } from './achievements.service';
import { CalendarService } from '../Calendar/calendar.service';

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

  TitleAchievementList: string[];
  DescAchievementList: string[];
  ScoreAchievementList: string[];
  AchievementsIndexArray: number[];

  constructor(
    private achievementService: AchievementsService,
    private calendarService: CalendarService
  ) {
    this.DescAchievementList = achievementService.getDescAchievement();
    this.TitleAchievementList = achievementService.getTitleAchievement();
    this.ScoreAchievementList = achievementService.getScoreAchievement();

    const AchievementsMaxLength = Math.min(this.TitleAchievementList.length, this.DescAchievementList.length);
    this.AchievementsIndexArray = Array.from({ length: AchievementsMaxLength }, (_, index) => index);
  }

  ngOnInit(): void {
    this.loadUpcomingSessions();
  }

  loadUpcomingSessions(): void {
    this.calendarService.getSessions().subscribe((sessions: any[]) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todaysSessions = sessions.filter(session => {
        const sessionDate = new Date(session.date.split('.').reverse().join('-'));
        sessionDate.setHours(0, 0, 0, 0);
        console.log("sessionDate.getTime(): ", sessionDate.getTime(), "today.getTime(): ", today.getTime());
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
    });
  }
}

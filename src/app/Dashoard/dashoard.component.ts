import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WhatsnextService } from './whatsnext.service';
import { AchievementsService } from './achievements.service';

@Component({
  selector: 'app-dashoard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashoard.component.html',
})

export class DashoardComponent {
  WhatsnextDayList: string[];
  WhatsnextWorkoutsList: string[];
  WhatsnextIndexArray: number[];

  TitleAchievementList: string[];
  DescAchievementList: string[];
  ScoreAchievementList: string[];
  AchievementsIndexArray: number[];

    constructor(Whatsnext: WhatsnextService, Achievement: AchievementsService){
        this.WhatsnextDayList = Whatsnext.getWhatsnextDay();
        this.WhatsnextWorkoutsList = Whatsnext.getWhatsnextWorkout();

        const WhatsnextMaxLength = Math.min(this.WhatsnextDayList.length, this.WhatsnextWorkoutsList.length);
        this.WhatsnextIndexArray = Array.from({ length: WhatsnextMaxLength }, (_, index) => index);

        this.DescAchievementList = Achievement.getDescAchievement();
        this.TitleAchievementList = Achievement.getTitleAchievement();
        this.ScoreAchievementList = Achievement.getScoreAchievement();

        const AchievementsMaxLength = Math.min(this.TitleAchievementList.length, this.DescAchievementList.length);
        this.AchievementsIndexArray = Array.from({ length: AchievementsMaxLength }, (_, index) => index);
    }
}

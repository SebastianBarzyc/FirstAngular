
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AchievementsService{
    getTitleAchievement(){
        return [
          "Keep it up!", 
          "Great job!", 
          "Keep it up!", 
          "Keep it up!"
        ];
    }
    getDescAchievement(){
      return [
        "You're on a 3-day streak", 
        "You've completed 6 workouts this month", 
        "You've burned 1,500 calories this month",
        "You've completed 3 workouts this week"
      ];
    }
    getScoreAchievement(){
      return [
        "3 days", 
        "6 workouts", 
        "1,500 cal",
        "3 workouts"
      ];
    }
}
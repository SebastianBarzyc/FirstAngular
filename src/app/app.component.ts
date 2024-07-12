import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CoursesComponent } from './courses.component';
import { NavComponent } from './Nav/nav.component';
import { NavBtnComponent } from './Nav/nav-btn.component';
import { DashoardComponent } from './Dashoard/dashoard.component';
import { CalendarComponent } from './Calendar/calendar.component';
import { ExercisesComponent } from './Exercises/exercises.component';
import { ProfileComponent } from './Profile/profile.component';
import { ProgressComponent } from './Progress/progress.component';
import { WorkoutsComponent } from './Workouts/workouts.component';
import { ReactiveFormsModule } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet, CoursesComponent, NavComponent, NavBtnComponent, DashoardComponent,CalendarComponent, ExercisesComponent, ProfileComponent, ProgressComponent, WorkoutsComponent, ReactiveFormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  exercisesTitleList: string[] = [];
  exercisesDescList: string[] = [];

  constructor(private cookieService: CookieService) {}

  ngOnInit() {
    this.loadFromCookies();
  }

  private saveToCookies() {
    this.cookieService.set('exercisesTitleList', JSON.stringify(this.exercisesTitleList));
    this.cookieService.set('exercisesDescList', JSON.stringify(this.exercisesDescList));
  }

  private loadFromCookies() {
    const savedExercisesTitleList = this.cookieService.get('exercisesTitleList');
    const savedExercisesDescList = this.cookieService.get('exercisesDescList');
    if (savedExercisesTitleList && savedExercisesDescList) {
      this.exercisesTitleList = JSON.parse(savedExercisesTitleList);
      this.exercisesDescList = JSON.parse(savedExercisesDescList);
    }
  }

  addExercise(title: string, desc: string) {
    this.exercisesTitleList.push(title);
    this.exercisesDescList.push(desc);
    this.saveToCookies();
  }

  deleteExercise(index: number) {
    this.exercisesTitleList.splice(index, 1);
    this.exercisesDescList.splice(index, 1);
    this.saveToCookies();
  }
}

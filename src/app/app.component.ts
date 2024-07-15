import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavComponent } from './Nav/nav.component';
import { NavBtnComponent } from './Nav/nav-btn.component';
import { DashoardComponent } from './Dashoard/dashoard.component';
import { CalendarComponent } from './Calendar/calendar.component';
import { ExercisesComponent } from './Exercises/exercises.component';
import { ProfileComponent } from './Profile/profile.component';
import { ProgressComponent } from './Progress/progress.component';
import { WorkoutsComponent } from './Workouts/workouts.component';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet, NavComponent, NavBtnComponent, DashoardComponent, CalendarComponent, ExercisesComponent, ProfileComponent, ProgressComponent, ReactiveFormsModule, WorkoutsComponent],
  templateUrl: './app.component.html',
})
export class AppComponent {
}

import { Routes } from '@angular/router';
import { DashoardComponent } from './Dashoard/dashoard.component';
import { CalendarComponent } from './Calendar/calendar.component';
import { ExercisesComponent } from './Exercises/exercises.component';
import { ProfileComponent } from './Profile/profile.component';
import { ProgressComponent } from './Progress/progress.component';
import { WorkoutsComponent } from './Workouts/workouts.component';

export const routes: Routes = [
    {path: 'dashboard', component: DashoardComponent},
    {path: 'calendar', component: CalendarComponent},
    {path: 'exercises', component: ExercisesComponent},
    {path: 'profile', component: ProfileComponent},
    {path: 'progress', component: ProgressComponent},
    {path: 'workouts', component: WorkoutsComponent},
];

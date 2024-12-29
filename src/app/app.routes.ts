import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashoardComponent } from './Dashoard/dashoard.component';
import { CalendarComponent } from './Calendar/calendar.component';
import { ExercisesComponent } from './Exercises/exercises.component';
import { ProfileComponent } from './Profile/profile.component';
import { ProgressComponent } from './Progress/progress.component';
import { WorkoutsComponent } from './Workouts/workouts.component';
import { PasswordResetComponent } from './Profile/password-reset.component';
import { PasswordResetComponent2 } from './Profile/password-reset2.component';

export const routes: Routes = [
  { path: '', redirectTo: '/Dashboard', pathMatch: 'full' },
  { path: 'Dashboard', component: DashoardComponent },
  { path: 'Calendar', component: CalendarComponent },
  { path: 'Exercises', component: ExercisesComponent },
  { path: 'Profile', component: ProfileComponent },
  { path: 'Progress', component: ProgressComponent },
  { path: 'Workouts', component: WorkoutsComponent },
  { path: 'password-reset', component: PasswordResetComponent },
  { path: 'password-reset2', component: PasswordResetComponent2 },
  { path: '**', redirectTo: '/Dashboard' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

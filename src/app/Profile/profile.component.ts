import { Component, OnInit } from '@angular/core';
import { LoginComponent } from './login.component';
import { CommonModule } from '@angular/common';
import { getUser, supabase } from '../supabase-client';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ExerciseDialogComponent } from './exercise-dialog.component';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { from, map, Observable, switchMap, firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCheckboxModule,
    FormsModule,
    LoginComponent,
    MatButtonModule
  ],
  providers: [],
  templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit {
  isLoggedIn: boolean = false;
  session: any = null;
  totalSessions: number | null = null;
  totalWeights: number | null = null;
  activeSessions: number | null = null;
  userId: any;
  user: any = null;
  displayName: string | null = null;
  recentWorkouts: any[] = [];
  userExercises: any[] = [];
  userExercisesSelected: any[] = [];
  showExerciseSelection = false;
  sessionIds: any[] = [];

  constructor(public dialog: MatDialog, private router: Router) {
    supabase.auth.onAuthStateChange((event, session) => {
      console.log(`Event: ${event}`);
      if (session) {
        console.log('Logged in, active session:', session);
        this.session = session;
        localStorage.setItem('session', JSON.stringify(session));
        window.location.reload();
      }
    });
  }

  async ngOnInit() {
    this.user = getUser();
    if (this.user) {
      this.displayName = this.user.user_metadata['display_name'] || 'User';
    } else {
      this.router.navigate(['/Profile']);
    }
    this.refreshProfile();
  }

  refreshProfile() {
    if (this.user) {
      this.isLoggedIn = true;
      this.userId = this.user.id;
      console.log('isLoggedIn in refreshProfile:', this.isLoggedIn);
      this.loadUserProfile();
    } else {
      this.isLoggedIn = false;
    }
  }

  async loadUserProfile() {
    try {
      await firstValueFrom(this.doneSessions(this.user.id));
      this.getTotalSessions();
      await firstValueFrom(this.getTotalWeights());
      this.getActiveSessions();
      this.getRecentWorkouts();
      await firstValueFrom(this.getUserExercises());
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  }

  logout(): void {
    supabase.auth.signOut().then(() => {
      this.session = null;
      localStorage.removeItem('session');
      window.location.reload();
    });
  }

  getTotalSessions(): void {
    supabase
      .from('sessions')
      .select('date', { count: 'exact', head: true })
      .in('session_id', this.sessionIds)
      .then(({ count, error }) => {
        if (error) {
          console.error('Error fetching sessions:', error.message);
          return;
        }
        this.totalSessions = count || 0;
      });
  }

  doneSessions(userId: string): Observable<any> {
    return from (
      supabase
        .from('sessions')
        .select('session_id')
        .eq('user_id', userId)
        .gt('duration', 0)
    ).pipe(
      map(({ data, error }) => {
      if (error) throw error;
      console.log('Done sessions fetched:', data);
      this.sessionIds = data.map(session => session.session_id);
      })
    );
  }
  
  getTotalWeights() {
    return from(
      supabase
        .from('session_exercises')
        .select('weight')
        .in('session_id', this.sessionIds)
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
          this.totalWeights = data.reduce((sum, row) => sum + (row.weight || 0), 0);
      })
    );
  }

  getActiveSessions() {
  from(
    supabase
      .from('sessions')
      .select('session_id, date')
      .lte('date', new Date().toISOString().split('T')[0])
      .in('session_id', this.sessionIds)
  ).pipe(
    map(({ data, error }) => {
      if (error) throw error;
      if (!data || data.length === 0) return 0;

      const todayStr = new Date().toISOString().split('T')[0];

      const dates = data
        .map(s => new Date(s.date).toISOString().split('T')[0])
        .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

      const result: string[] = [];
      let current = todayStr;

      for (let i = 0; i < dates.length; i++) {
        if (dates.includes(current)) {
          result.push(current);

          const prev = new Date(current);
          prev.setDate(prev.getDate() - 1);
          current = prev.toISOString().split('T')[0];
        } else {
          break;
        }
      }
      return result.length;
    })
  ).subscribe({
    next: (activeDays) => {
      this.activeSessions = activeDays;

      from(
        supabase
          .from('users_goals')
          .select('goal')
          .eq('user_id', this.userId)
          .eq('title', 'maxActiveDays')
      ).subscribe(({ data, error }) => {
        if (error) return console.error('Error fetching user goals:', error.message);

        if (data && data.length > 0) {
          const currentGoal = data[0].goal;

          if (activeDays > currentGoal) {
            from(
              supabase
                .from('users_goals')
                .update({ goal: activeDays })
                .eq('user_id', this.userId)
                .eq('title', 'maxActiveDays')
            ).subscribe(({ error: updateError }) => {
              if (updateError) {
                console.error('Error updating maxActiveDays goal:', updateError.message);
              } else {
                console.log('maxActiveDays goal updated successfully');
              }
            });
          }
        }else {
          from(
            supabase
              .from('users_goals')
              .insert([{ user_id: this.userId, goal: activeDays, title: 'maxActiveDays' }])
          ).subscribe(({ error: insertError }) => {
            if (insertError) {
              console.error('Error inserting maxActiveDays goal:', insertError.message);
            } else {
              console.log('maxActiveDays goal inserted successfully');
            }
          });
        }
      });
    },

    error: (err) => console.error('Error processing active sessions:', err)
  });
  }

  getRecentWorkouts() {
    from(
      supabase
        .from('sessions')
        .select('title, date')
        .in('session_id', this.sessionIds)
        .order('date', { ascending: false })
    ).subscribe(({ data, error }) => {
      if (error) {
        console.error('Error fetching sessions:', error.message);
        return;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      this.recentWorkouts = data
      .filter(workout => {
        const [day, month, year] = workout.date.split('.');
        const workoutDate = new Date(`${year}-${month}-${day}`);
        return workoutDate <= today;
      })
      .map(workout => {
        const [day, month, year] = workout.date.split('.');
        const formattedDate = new Date(`${year}-${month}-${day}`);
        return {
          ...workout,
          date: formattedDate
        };
      })
      .slice(0, 5) || [];

      console.log('Recent Workouts:', this.recentWorkouts);
    });
  }

  getUserExercises() {
  const exercisesQuery = from(
    supabase
      .from('session_exercises')
      .select('exercise_title, weight')
      .eq('user_id', this.userId)
  );

  const goalsQuery = from(
    supabase
      .from('users_goals')
      .select('title, goal')
      .eq('user_id', this.userId)
  );

  return exercisesQuery.pipe(
    switchMap(({ data: exercisesData, error: exercisesError }) => {
      if (exercisesError) throw exercisesError;

      const highestWeights = (exercisesData || []).reduce((acc: any, ex: any) => {
        if (!acc[ex.exercise_title] || acc[ex.exercise_title] < ex.weight) {
          acc[ex.exercise_title] = ex.weight;
        }
        return acc;
      }, {});

      return goalsQuery.pipe(
        map(({ data: goalsData, error: goalsError }) => {
          if (goalsError) throw goalsError;

          const goalsMap = new Map((goalsData || []).map(g => [g.title, g.goal]));

          this.userExercises = Object.keys(highestWeights).map(title => ({
            title,
            highestWeight: highestWeights[title],
            goalWeight: goalsMap.get(title) || 0,
          }));
          this.userExercisesSelected = this.userExercises.filter(ex => goalsMap.has(ex.title));
        })
      );
    })
  );
}


  onExerciseSelectionChange(event: any) {
    const selectedExercise = JSON.parse(event.target.value);
    if (event.target.checked) {
      this.userExercisesSelected.push(selectedExercise);
    } else {
      this.userExercisesSelected = this.userExercisesSelected.filter(exercise => exercise.title !== selectedExercise.title);
    }
  }

  onAddExercise(event: any) {
    this.removeExerciseFromGoals().then(() => {
      const selectedExercises = event.value;
      for (const exercise of selectedExercises) {
        console.log("exercise: ", exercise, "selectedExercises: ", selectedExercises);
        this.saveExerciseToGoals(exercise);
      }
      console.log('Selected exercises:', selectedExercises);
    });
  }
  
  isExerciseSelected(exerciseTitle: string): boolean {
    return this.userExercisesSelected.some(ex => ex.title === exerciseTitle);
  }
  
  async saveExerciseToGoals(exercise: any): Promise<any> {
    try{
    const { data, error } = await supabase
      .from('users_goals')
      .insert([{ user_id: this.userId, title: exercise.title, goal: exercise.goalWeight }]);
      if (error) {
         console.error('Supabase error:', error.message);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
    }
  }
  
  async removeExerciseFromGoals(): Promise<any> {
    try{
      const { error } = await supabase
        .from('users_goals')
        .delete()
        .eq('user_id', this.userId);
      if (error) {
        console.error('Supabase error:', error.message);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
    }
  }

  async updateGoalWeight(exercise: any): Promise<any> {
    try{
      const { error } = await supabase
        .from('users_goals')
        .update({ goal: exercise.goalWeight })
        .eq('user_id', this.userId)
        .eq('title', exercise.title);
      if (error) {
        console.error('Supabase error:', error.message);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
    }
  }

  toggleExerciseSelection(exercise: any): void {
    if (this.isExerciseSelected(exercise.title)) {
      this.userExercisesSelected = this.userExercisesSelected.filter(ex => ex.title !== exercise.title);
    } else {
      this.userExercisesSelected.push(exercise);
    }
  }

  async saveSelectedExercises() {
    await this.removeExerciseFromGoals();
    for (const exercise of this.userExercisesSelected) {
      await this.saveExerciseToGoals(exercise);
    }
    this.showExerciseSelection = true;
  }

  openExerciseDialog() {
    console.log("exercises: ", this.userExercises);
    console.log("selectedExercises: ", [...this.userExercisesSelected]);
    const dialogRef = this.dialog.open(ExerciseDialogComponent, {
      width: '80vw',
      data: { exercises: this.userExercises, selectedExercises: [...this.userExercisesSelected] }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.userExercisesSelected = result;
        this.saveSelectedExercises();
      }
    });
  }

  editProfile() {
    this.showExerciseSelection = !this.showExerciseSelection;
  }
}

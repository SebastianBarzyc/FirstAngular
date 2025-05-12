import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { LoginComponent } from './login.component';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { getUser, supabase } from '../supabase-client';
import { BehaviorSubject } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ExerciseDialogComponent } from './exercise-dialog.component';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';

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
  userProfile: any = null;
  session: any = null;
  totalSessions: number | null = null;
  totalWeights: number | null = null;
  consecutiveSessions: number | null = null;
  userId: any;
  user: any = null;
  displayName: string | null = null;
  recentWorkouts: any[] = [];
  userExercises: any[] = [];
  userExercisesSelected: any[] = [];
  showExerciseSelection = false;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef, public dialog: MatDialog, private router: Router) {
    supabase.auth.onAuthStateChange((event, session) => {
      console.log(`Event: ${event}`);
      if (session) {
        console.log('Logged in, active session:', session);
        this.session = session;
        localStorage.setItem('session', JSON.stringify(session));
        this.refreshProfile();
        window.location.reload();
      }
    });
  }

  async ngOnInit() {
    this.user = getUser();
    if (this.user) {
      this.displayName = this.user.user_metadata['display_name'] || 'User';
      this.refreshProfile();
    } else {
      this.router.navigate(['/Profile']);
    }
  }

  loadUserProfile() {
    this.getTotalSessions();
    this.getTotalWeights();
    this.getConsecutiveSessions();
    this.getRecentWorkouts();
    this.cdr.detectChanges();
  }

  logout() {
    supabase.auth.signOut().then(() => {
      this.session = null;
      localStorage.removeItem('session');
      window.location.reload(); // Refresh the page after logout
    });
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

  getTotalSessions() {
    if (!this.user) {
      console.error('No active session');
      return;
    }
  
    if (!this.userId) {
      console.error('Failed to get userId from session');
      return;
    }
  
    supabase
      .from('sessions')
      .select('date', { count: 'exact', head: true })
      .eq('user_id', this.userId)
      .then(({ count, error }) => {
        if (error) {
          console.error('Error fetching sessions:', error.message);
          return;
        }
        this.totalSessions = count || 0;
        this.cdr.detectChanges();
      });
  }
  
  getTotalWeights() {
    if (!this.user) {
      console.error('No active session');
      return;
    }
  
    if (!this.userId) {
      console.error('Failed to get userId from session');
      return;
    }
  
    supabase
      .from('session_exercises')
      .select('weight')
      .eq('user_id', this.userId)
      .then(({ data, error }) => {
        if (error) {
          console.error('Error fetching weight data:', error.message);
          return;
        }
  
        if (!data || data.length === 0) {
          console.error('No session data for this user');
          return;
        }
  
        const totalWeights = data.reduce((sum, row) => sum + (row.weight || 0), 0);
        this.totalWeights = totalWeights;
      });
  }

  getConsecutiveSessions() {
    if (!this.user) {
      console.error('No active session');
      return;
    }
  
    if (!this.userId) {
      console.error('Failed to get userId from session');
      return;
    }
  
    supabase
      .from('sessions')
      .select('session_id, date')
      .eq('user_id', this.userId)
      .lte('date', new Date().toISOString().split('T')[0])
      .then(({ data, error }) => {
        if (error) {
          console.error('Error fetching sessions:', error.message);
          return;
        }
  
        if (!data || data.length === 0) {
          console.error('No sessions for this user');
          return;
        }
  
        const formattedDates = data
          .map(session => new Date(session.date))
          .sort((a, b) => a.getTime() - b.getTime());
  
        let maxStreak = 0;
        let currentStreak = 0;
  
        for (let i = 1; i < formattedDates.length; i++) {
          const prevDate = formattedDates[i - 1];
          const currDate = formattedDates[i];
  
          if ((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24) === 1) {
            currentStreak++;
          } else {
            maxStreak = Math.max(maxStreak, currentStreak);
            currentStreak = 0;
          }
        }
  
        maxStreak = Math.max(maxStreak, currentStreak);
        this.consecutiveSessions = maxStreak;
      });
  }

  getRecentWorkouts() {    
    if (!this.user) {
      console.error('No active session');
      return;
    }

    if (!this.userId) {
      console.error('Failed to get userId from session');
      return;
    }

    supabase
      .from('sessions')
      .select('title, date')
      .eq('user_id', this.userId)
      .order('date', { ascending: false })
      .then(({ data, error }) => {
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
        this.cdr.detectChanges();
      });
  }

  async getUserExercises() {
    if (!this.user) {
      console.error('No active session');
      return;
    }
  
    if (!this.userId) {
      console.error('Failed to get userId from session');
      return;
    }
  
    const { data: exercisesData, error: exercisesError } = await supabase
      .from('session_exercises')
      .select('exercise_title, weight')
      .eq('user_id', this.userId);
  
    if (exercisesError) {
      console.error('Error fetching exercises:', exercisesError.message);
      return;
    }
  
    const highestWeights: { [key: string]: number } = exercisesData.reduce((acc: { [key: string]: number }, exercise: any) => {
      if (!acc[exercise.exercise_title] || acc[exercise.exercise_title] < exercise.weight) {
        acc[exercise.exercise_title] = exercise.weight;
      }
      return acc;
    }, {});
  
    const { data: goalsData, error: goalsError } = await supabase
      .from('users_goals')
      .select('title, goal')
      .eq('user_id', this.userId);
  
    if (goalsError) {
      console.error('Error fetching goals:', goalsError.message);
      return;
    }
  
    const goalsMap = new Map(goalsData.map(goal => [goal.title, goal.goal]));
  
    this.userExercises = Object.keys(highestWeights).map(exerciseTitle => ({
      title: exerciseTitle,
      highestWeight: highestWeights[exerciseTitle],
      goalWeight: goalsMap.get(exerciseTitle) || 0
    }));
  
    this.userExercisesSelected = this.userExercises.filter(exercise => goalsMap.has(exercise.title));
  
    this.cdr.detectChanges();
  }

  onExerciseSelectionChange(event: any) {
    const selectedExercise = JSON.parse(event.target.value);
    if (event.target.checked) {
      this.userExercisesSelected.push(selectedExercise);
    } else {
      this.userExercisesSelected = this.userExercisesSelected.filter(exercise => exercise.title !== selectedExercise.title);
    }
    this.cdr.detectChanges();
  }

  onAddExercise(event: any) {
    this.removeExerciseFromGoals().then(() => {
      const selectedExercises = event.value;
      for (const exercise of selectedExercises) {
        console.log("exercise: ", exercise, "selectedExercises: ", selectedExercises);
        this.saveExerciseToGoals(exercise);
      }
      console.log('Selected exercises:', selectedExercises);
      this.cdr.detectChanges();
    });
  }
  
  isExerciseSelected(exerciseTitle: string): boolean {
    return this.userExercisesSelected.some(ex => ex.title === exerciseTitle);
  }
  
  async saveExerciseToGoals(exercise: any) {
    const { data, error } = await supabase
      .from('users_goals')
      .insert([{ user_id: this.userId, title: exercise.title, goal: exercise.goalWeight }]);
  
    if (error) {
      console.error('Error saving exercise to goals:', error.message);
    } else {
      console.log('Exercise saved to goals:', data);
    }
  }
  
  async removeExerciseFromGoals() {
    const { error } = await supabase
      .from('users_goals')
      .delete()
      .eq('user_id', this.userId);
  
    if (error) {
      console.error('Error removing exercises from goals:', error.message);
    } else {
      console.log('All exercises removed from goals');
    }
  }

  async updateGoalWeight(exercise: any) {
    const { error } = await supabase
      .from('users_goals')
      .update({ goal: exercise.goalWeight })
      .eq('user_id', this.userId)
      .eq('title', exercise.title);
  
    if (error) {
      console.error('Error updating goal weight:', error.message);
    } else {
      console.log('Goal weight updated successfully for exercise:', exercise.title);
    }
  }

  toggleExerciseSelection(exercise: any) {
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
    this.cdr.detectChanges();
  }

  openExerciseDialog() {
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

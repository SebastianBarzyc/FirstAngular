import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { LoginComponent } from './login.component';
import { CommonModule } from '@angular/common';
import { HttpClient} from '@angular/common/http';
import { supabase, getUser } from '../supabase-client';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    LoginComponent,
    CommonModule,
  ],
  providers: [
  ],
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
  displayName: string | null = null;
  recentWorkouts: any[] = [];
  private isLoggedInSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {
    supabase.auth.onAuthStateChange((event, session) => {
      console.log(`Event: ${event}`);
      if (session) {
        console.log('Logged in, active session:', session);
        this.session = session;
        localStorage.setItem('session', JSON.stringify(session));
        this.refreshProfile();
        this.isLoggedInSubject.next(true);
      } else {
        console.log('Logged out or no active session.');
        this.session = null;
        localStorage.removeItem('session');
        this.isLoggedInSubject.next(false);
      }
    });
  }

  async ngOnInit() {
    this.isLoggedIn$.subscribe(isLoggedIn => {
      console.log('isLoggedIn subscription:', isLoggedIn);
      this.isLoggedIn = isLoggedIn;
      if (isLoggedIn) {
        this.loadUserProfile();
        this.getRecentWorkouts();
      }
    });

    const storedSession = localStorage.getItem('session');
    if (storedSession) {
      this.session = JSON.parse(storedSession);
      this.userId = this.session.user.id;
      this.displayName = this.session.user.user_metadata?.['display_name'];
      this.isLoggedInSubject.next(true);
    } else {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;

        this.session = data.session;
        if (this.session) {
          this.userId = this.session.user.id;
          this.displayName = this.session.user.user_metadata?.['display_name'];
          localStorage.setItem('session', JSON.stringify(this.session));
          this.isLoggedInSubject.next(true);
        } else {
          this.isLoggedInSubject.next(false);
        }
      } catch (error) {
        console.error('Error during component initialization:', error);
      }
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
      this.isLoggedInSubject.next(false);
    });
  }

  refreshProfile() {
    if (this.session) {
      this.userId = this.session.user.id;
      this.isLoggedIn = true;
      console.log('isLoggedIn in refreshProfile:', this.isLoggedIn);
      this.loadUserProfile();
    } else {
      this.isLoggedIn = false;
    }
  }

  getTotalSessions() {
    if (!this.session) {
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
    if (!this.session) {
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
    if (!this.session) {
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
        let currentStreak = 1;
  
        for (let i = 1; i < formattedDates.length; i++) {
          const prevDate = formattedDates[i - 1];
          const currDate = formattedDates[i];
  
          if ((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24) === 1) {
            currentStreak++;
          } else {
            maxStreak = Math.max(maxStreak, currentStreak);
            currentStreak = 1;
          }
        }
  
        maxStreak = Math.max(maxStreak, currentStreak);
        this.consecutiveSessions = maxStreak;
      });
  }

  getRecentWorkouts() {    
    if (!this.session) {
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
        this.cdr.detectChanges(); // Trigger change detection
      });
  }
}

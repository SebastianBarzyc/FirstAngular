import { Component, OnInit } from '@angular/core';
import { LoginComponent } from './login.component';
import { CommonModule } from '@angular/common';
import { HttpClient} from '@angular/common/http';
import { JwtHelperService, JWT_OPTIONS } from '@auth0/angular-jwt';
import { supabase, getUser } from '../supabase-client';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    LoginComponent,
    CommonModule,
  ],
  providers: [
    JwtHelperService,
    {
      provide: JWT_OPTIONS,
      useValue: {
        tokenGetter: () => localStorage.getItem('token'),
        allowedDomains: ['localhost:3000, localhost:4200'],
      }
    }
  ],
  templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit {
  isLoggedIn: boolean = false;
  userProfile: any = null;
  token: string | null = null;
  totalSessions: number | null = null;
  totalWeights: number | null = null;
  consecutiveSessions: number | null = null;
  userId: any;

  constructor(private http: HttpClient) {}

  async ngOnInit() {
    this.token = localStorage.getItem('token');
    this.userId = getUser();
    console.log("token: ", this.token);
    console.log("userId: ", this.userId);

    this.isLoggedIn = !!this.token;
    this.getTotalSessions();
    this.getTotalWeights();
    this.getConsecutiveSessions();
  } 

  logout() {
    localStorage.removeItem('token');
    this.isLoggedIn = false;
  }

  getTotalSessions() {
    if (!this.token) {
      console.error('Brak tokena uwierzytelniającego');
      return;
    }
  
    if (!this.userId) {
      console.error('Nie udało się pobrać userId z tokena');
      return;
    }
  
    supabase
      .from('sessions')
      .select('date', { count: 'exact', head: true })
      .eq('user_id', this.userId)
      .then(({ count, error }) => {
        if (error) {
          console.error('Błąd pobierania sesji:', error.message);
          return;
        }
        this.totalSessions = count || 0;
        console.log(`Liczba sesji użytkownika: ${this.totalSessions}`);
      });
  }
  
  getTotalWeights() {
    if (!this.token) {
      console.error('Brak tokena uwierzytelniającego');
      return;
    }
  
    if (!this.userId) {
      console.error('Nie udało się pobrać userId z tokena');
      return;
    }
  
    supabase
      .from('session_exercises')
      .select('weight')
      .eq('user_id', this.userId)
      .then(({ data, error }) => {
        if (error) {
          console.error('Błąd pobierania danych o ciężarach:', error.message);
          return;
        }
  
        if (!data || data.length === 0) {
          console.error('Brak danych o sesjach dla tego użytkownika');
          return;
        }
  
        const totalWeights = data.reduce((sum, row) => sum + (row.weight || 0), 0);
        this.totalWeights = totalWeights;
        console.log(`Suma ciężarów: ${this.totalWeights}`);
      });
  }

  getConsecutiveSessions() {
    if (!this.token) {
      console.error('Brak tokena uwierzytelniającego');
      return;
    }
  
    if (!this.userId) {
      console.error('Nie udało się pobrać userId z tokena');
      return;
    }
  
    supabase
      .from('sessions')
      .select('session_id, date')
      .eq('user_id', this.userId)
      .lte('date', new Date().toISOString().split('T')[0])
      .then(({ data, error }) => {
        if (error) {
          console.error('Błąd pobierania sesji:', error.message);
          return;
        }
  
        if (!data || data.length === 0) {
          console.error('Brak sesji dla tego użytkownika');
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
        console.log(`Liczba kolejnych sesji: ${this.consecutiveSessions}`);
      });
  }
}

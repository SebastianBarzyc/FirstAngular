import { Component, OnInit } from '@angular/core';
import { LoginComponent } from './login.component';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { JwtHelperService, JWT_OPTIONS } from '@auth0/angular-jwt';
import { firstValueFrom } from 'rxjs';

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

  private apiUrl = 'http://localhost:3000/api/profile';

  constructor(private http: HttpClient) {}

  async ngOnInit() {
    this.token = localStorage.getItem('token');
    const userId = this.getUserIdFromToken();

    if (userId !== null) {
      await this.getProfile(userId);
      console.log(this.userProfile);
    }
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
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.token}`
    });
  
    this.http.get<any>(`${this.apiUrl}/totalSessions/`, { headers })
      .subscribe(
        response => {
          this.totalSessions = response.totalSessions.count;
        },
        error => {
          console.error('Error fetching total sessions:', error);
        }
      );
  }
  
  getTotalWeights() {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.token}`
    });
  
    this.http.get<any>(`${this.apiUrl}/totalWeights/`, { headers })
      .subscribe(
        response => {
          this.totalWeights = response.totalWeights.sum;
        },
        error => {
          console.error('Error fetching total weights:', error);
        }
      );
  }

  getConsecutiveSessions(){
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.token}`
    });
  
    this.http.get<any>(`${this.apiUrl}/consecutiveSessions/`, { headers })
      .subscribe(
        response => {
          this.consecutiveSessions = response.consecutiveSessions.consecutive_days;
        },
        error => {
          console.error('Error fetching total weights:', error);
        }
      );
  }

  async getProfile(id: number) {
    try {
      const data = await firstValueFrom(this.getProfileData(id));
      this.userProfile = data.user;
      console.log(this.userProfile);
    } catch (error) {
      console.error('Error fetching profile data:', error);
    }
  }

getProfileData(id: number) {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.token}`
    });
    return this.http.get<any>(`${this.apiUrl}/${id}`, { headers });
}

  getUserIdFromToken(): number | null {
    if (!this.token) {
      return null;
    }
    const decodedToken = this.decodeToken(this.token);
    return decodedToken?.userId ?? null;
  }

  decodeToken(token: string): any {
    const jwtHelper = new JwtHelperService();
    return jwtHelper.decodeToken(token);
  }
}

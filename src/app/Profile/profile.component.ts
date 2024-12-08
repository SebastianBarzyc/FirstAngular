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
  userProfile: any = null;  // Upewnij się, że userProfile jest inicjowane jako null
  token: string | null = null;

  constructor(private http: HttpClient, private jwtHelper: JwtHelperService) {}

  async ngOnInit() {
    this.token = localStorage.getItem('token');
    const userId = this.getUserIdFromToken();

    if (userId !== null) {
      this.getProfile(userId);
    }

    this.isLoggedIn = !!this.token;
  }

  logout() {
    localStorage.removeItem('token');
    this.isLoggedIn = false;
  }

  getProfileData(id: number) {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.token}`
    });
  return this.http.get<any>(`http://localhost:3000/api/profile/${id}`, { headers });
  }

  getProfile(id: number) {
    try {
      const data = firstValueFrom(this.getProfileData(id));
      console.log('User profile data:', data);
      this.userProfile = data;
    } catch (error) {
      console.error('Error fetching profile data:', error);
    }
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

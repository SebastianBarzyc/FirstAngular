import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, Injectable, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { supabase } from '../supabase-client';
import { BehaviorSubject } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    TranslateModule
  ]
})
@Injectable({
  providedIn: 'root'
})
export class LoginComponent implements OnInit {
  email: string = '';
  username: string = '';
  password: string = '';
  showRegister: boolean = false;
  supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1bnZzd3F1c3ZidGNjYWRvY2RpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQwMzgyOTYsImV4cCI6MjA0OTYxNDI5Nn0.zGoZJifm-QCa83fDOLG5U5MM9QsyQSeDZBaYtnkXLzw';
  token: string | null = null;
  errorMessage: string = '';
  successMessage: string = '';

  private isLoggedInSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();

  headers = new HttpHeaders({
    apikey: this.supabaseKey,
    'Content-Type': 'application/json',
  });

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    const session = localStorage.getItem('session');
    if (session) {
      this.isLoggedInSubject.next(true);
    }
  }

  onSubmit() {
    this.errorMessage = '';
    this.successMessage = '';
    const loginData = {
      email: this.email.toLowerCase(),
      password: this.password,
      username: this.username
    };

    if (this.showRegister) {
      this.checkEmailExists(loginData.email).then(exists => {
        if (exists) {
          this.errorMessage = 'Email already exists. Please use a different email.';
        } else {
          this.register(loginData.email, loginData.password, loginData.username);
        }
      }).catch(error => {
        this.errorMessage = 'Error checking email: ' + error.message;
        console.error('Error checking email existence:', error);
      });
    } else {
      this.login(loginData.email, loginData.password);
    }
  }

  async checkEmailExists(email: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.auth.admin.listUsers();
      if (error) {
        throw new Error(error.message);
      }

      return data.users.some(user => user.email === email);
    } catch (error) {
      console.error('Error checking email existence:', error);
      throw error;
    }
  }

  async register(email: string, password: string, displayName: string): Promise<void> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            display_name: displayName,
          },
        },
      });

      if (error) {
        this.errorMessage = error.message;
        console.error('Registration error:', error.message);
        return;
      }

      this.successMessage = 'Registration successful. Please check your email to verify your account.';
    } catch (error) {
      this.errorMessage = 'Error during registration.';
      console.error('Error during registration:', error);
    }
  }

  async login(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        this.errorMessage = 'Login failed: ' + error.message;
        console.error('Login failed:', error.message);
        return { error: error.message };
      }
      if (data?.session) {
        localStorage.setItem('session', JSON.stringify(data.session));
        console.log("session: ", data.session);
        this.isLoggedInSubject.next(true);
        console.log('isLoggedIn after login:', true);
        this.router.navigate(['/profile']); // Navigate to profile page
      }
      console.log("user: ", data);

      const sessionResponse = await supabase.auth.getSession();
      console.log("Session data: ", sessionResponse);
      return { user: data?.user };
    } catch (error) {
      this.errorMessage = 'Unexpected error during login.';
      console.error('Unexpected error during login:', error);
      return { error: 'Unexpected error occurred' };
    }
  }

  toggleRegister(event: Event) {
    this.showRegister = !this.showRegister;
    event.preventDefault();
  }

  navigateToPasswordReset() {
    this.router.navigate(['/password-reset']);
  }

  logout() {
    supabase.auth.signOut().then(() => {
      localStorage.removeItem('session');
      this.isLoggedInSubject.next(false);
    });
  }
}

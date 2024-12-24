import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, Injectable } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { supabase } from '../supabase-client';
import { BehaviorSubject } from 'rxjs';
import { AuthResponse } from '@supabase/supabase-js';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    standalone: true,
    imports: [
        FormsModule,
        CommonModule,
        ]
})
  @Injectable({
    providedIn: 'root'
  })
export class LoginComponent {
  email: string = '';
  username: string = '';
  password: string = '';
  showRegister: boolean = false;
  supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1bnZzd3F1c3ZidGNjYWRvY2RpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQwMzgyOTYsImV4cCI6MjA0OTYxNDI5Nn0.zGoZJifm-QCa83fDOLG5U5MM9QsyQSeDZBaYtnkXLzw';
  token: string | null = null;

  private isLoggedInSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();


  headers = new HttpHeaders({
    apikey: this.supabaseKey,
    'Content-Type': 'application/json',
  });

  constructor(private http: HttpClient) {}

  onSubmit() {
    const loginData = {
      email: this.email,
      password: this.password,
      username: this.username
    };

    if (this.showRegister) {
      this.register(loginData.email, loginData.password, loginData.username);
    } else {
      this.login(loginData.email, loginData.password);
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
        console.error('Błąd rejestracji:', error.message);
        return;
      }
  
    } catch (error) {
      console.error('Błąd podczas rejestracji:', error);
    }
  }
  
  async login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      console.error('Logowanie nieudane:', error.message);
      return { error: error.message };
    }
    if (data?.session?.access_token) {
      localStorage.setItem('token', data.session.access_token);
      this.isLoggedInSubject.next(true);
      console.log('isLoggedIn after login:', true);
    }
    console.log("user: ", data);

    const sessionResponse = await supabase.auth.getSession();
    console.log("Session data: ", sessionResponse);
    return { user: data?.user };
  }
  
  toggleRegister(event: Event) {
    this.showRegister = !this.showRegister;
    event.preventDefault();
  }
}

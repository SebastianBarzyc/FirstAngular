import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, Injectable } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { supabase } from '../supabase-client';
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
      this.registerAndLogin(loginData.email, loginData.password);
    } else {
      this.login(loginData.email, loginData.password);
    }
  }

  async register(email: string, password: string, username: string) {
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });
  
    if (authError) {
      console.error('Rejestracja nieudana:', authError.message);
      return { error: authError.message };
    }
  
    const user = data?.user;
  
    if (!user) {
      console.error('Brak danych użytkownika');
      return { error: 'Brak danych użytkownika po rejestracji' };
    }
  
    console.log('Rejestracja udana:', data);
    return { user };
  }

  async registerAndLogin(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
  
    if (error) {
      console.error('Błąd rejestracji:', error.message);
      return { error: error.message };
    }
  
    const user = data?.user;
    
    if (user) {
      console.log('Rejestracja udana. Link weryfikacyjny wysłany na e-mail.');
      return { user };
    }
  
    return { error: 'Błąd podczas rejestracji.' };
  }
  
  async login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      console.error('Logowanie nieudane:', error.message);
      return { error: error.message };
    }
    if (data?.session?.access_token) {
      localStorage.setItem('token', data.session.access_token);
    }

    return { user: data?.user };
  }
  
  toggleRegister(event: Event) {
    this.showRegister = !this.showRegister;
    event.preventDefault();
  }
}

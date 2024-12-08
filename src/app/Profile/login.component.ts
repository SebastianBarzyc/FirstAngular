import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, Injectable } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

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
  username: string = '';
  password: string = '';

  constructor(private http: HttpClient, private router: Router) {}

  onSubmit() {
    const loginData = {
      username: this.username,
      password: this.password
    };

    this.http.post<{ message: string, token: string }>('http://localhost:3000/api/login', loginData)
      .subscribe(
        response => {
          alert(response.message);
          localStorage.setItem('token', response.token);  // Przechowujemy token w localStorage
          //this.router.navigate(['/dashboard']);  // Przekierowanie na stronę dashboard
        },
        error => {
          alert('Błędna nazwa użytkownika lub hasło!');
        }
      );
  }
}

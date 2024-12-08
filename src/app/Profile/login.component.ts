import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, Injectable } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProfileComponent } from './profile.component';

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
  login: string = '';
  username: string = '';
  password: string = '';
  showRegister: boolean = false;

  constructor(private http: HttpClient, private profileComponent: ProfileComponent) {}

  onSubmit() {
    const loginData = {
      login: this.login,
      password: this.password,
      username: this.username
    };
    console.log(loginData);
    if(this.showRegister){
        this.http.post<{ message: string }>('http://localhost:3000/api/register', loginData)
      .subscribe(
        response => {
          this.showRegister = !this.showRegister;
        },
        error => {
        }
      );
    }else{
        this.http.post<{ message: string, token: string }>('http://localhost:3000/api/login', loginData)
        .subscribe(
            response => {
            localStorage.setItem('token', response.token);
            this.profileComponent.ngOnInit();
            },
            error => {
            }
        );
    }
  }

  toggleRegister(event: Event) {
    this.showRegister = !this.showRegister;
    event.preventDefault();
  }
}

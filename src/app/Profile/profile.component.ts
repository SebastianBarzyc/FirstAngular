import { Component, OnInit } from '@angular/core';
import { LoginComponent } from './login.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    LoginComponent,
    CommonModule
  ],
  templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit {
  isLoggedIn: boolean = false;

  constructor() {}

  ngOnInit() {
    const token = localStorage.getItem('token');
    if (token) {
      this.isLoggedIn = true;
    } else {
      this.isLoggedIn = false;
    }
  }

  logout() {
    localStorage.removeItem('token');
    this.isLoggedIn = false;
  }
}

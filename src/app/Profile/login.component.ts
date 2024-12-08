import { CommonModule } from '@angular/common';
import { Component, Injectable } from '@angular/core';
import { FormsModule } from '@angular/forms';

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

  constructor() {}

  onSubmit() {
    if (this.username === 'admin' && this.password === 'password') {
      alert('Zalogowano pomyślnie!');
      // this.router.navigate(['/dashboard']);
    } else {
      alert('Błędna nazwa użytkownika lub hasło!');
    }
  }
}

import { Component } from '@angular/core';
import { LoginComponent } from './login.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    LoginComponent
  ],
  templateUrl: './profile.component.html',
})
export class ProfileComponent {

}

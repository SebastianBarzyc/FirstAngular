import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { supabase } from '../supabase-client';

@Component({
  selector: 'app-password-reset',
  templateUrl: './password-reset.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class PasswordResetComponent {
  email: string = '';
  successMessage: string = '';
  errorMessage: string = '';

  constructor(private router: Router) {}

  async onSubmit() {
    this.errorMessage = '';
    this.successMessage = '';

    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(this.email);
      if (error) {
        this.errorMessage = 'Error sending password reset email: ' + error.message;
        console.error('Error sending password reset email:', error.message);
        return;
      }

      this.successMessage = 'Password reset email sent successfully. Please check your email.';
    } catch (error) {
      this.errorMessage = 'Unexpected error during password reset.';
      console.error('Unexpected error during password reset:', error);
    }
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }
}

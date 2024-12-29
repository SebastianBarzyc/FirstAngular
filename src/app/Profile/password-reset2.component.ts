import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { supabase } from '../supabase-client';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-password-reset2',
  templateUrl: './password-reset2.component.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ]
})
export class PasswordResetComponent2 {
  newPassword: string = '';
  confirmPassword: string = '';
  errorMessage: string = '';
  successMessage: string = '';
  accessToken: string | null = null;

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.accessToken = params['access_token'] || null;
      if (!this.accessToken) {
        this.errorMessage = 'Invalid or missing access token';
      }
    });
  }

  async resetPassword() {
    this.clearMessages();

    if (this.newPassword.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters long';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    if (!this.accessToken) {
      this.errorMessage = 'Invalid or missing access token';
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: this.newPassword
      });

      if (error) {
        this.errorMessage = 'Error resetting password: ' + error.message;
      } else {
        this.successMessage = 'Password reset successfully';
        setTimeout(() => {
          this.router.navigate(['/Profile']);
        }, 2000);
      }
    } catch (error) {
      this.errorMessage = 'Unexpected error occurred. Please try again later.';
      console.error('Password reset error:', error);
    }
  }

  clearMessages() {
    this.errorMessage = '';
    this.successMessage = '';
  }
}

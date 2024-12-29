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
  token: string | null = null;
  email: string | null = null;

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'] || null;
      this.email = params['email'] || null;
      console.log("this.token: ", this.token, "this.email: ", this.email);
      if (!this.token) {
        this.errorMessage = 'Invalid or missing token';
      }else if(!this.email){
        this.errorMessage = 'Invalid or missing email';
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

    if (!this.token || !this.email) {
      this.errorMessage = 'Invalid or missing token/email';
      return;
    }

    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        token: this.token,
        type: 'recovery',
        email: this.email
      });

      if (verifyError) {
        this.errorMessage = 'Error verifying token: ' + verifyError.message;
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: this.newPassword
      });

      if (updateError) {
        this.errorMessage = 'Error resetting password: ' + updateError.message;
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

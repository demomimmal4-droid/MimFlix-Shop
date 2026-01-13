import { ChangeDetectionStrategy, Component, inject, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
})
export class SignupComponent {
  private authService = inject(AuthService);

  authSuccess = output<void>();
  switchToLogin = output<void>();

  email = '';
  password = '';
  loading = signal(false);
  error = signal<string | null>(null);

  async onSubmit(): Promise<void> {
    if (!this.email || !this.password || this.loading()) {
      return;
    }
    
    if (this.password.length < 6) {
        this.error.set('Password must be at least 6 characters long.');
        return;
    }

    this.loading.set(true);
    this.error.set(null);

    try {
      await this.authService.signup(this.email, this.password);
      this.authSuccess.emit();
    } catch (e: any) {
      this.error.set(this.getFriendlyErrorMessage(e.code));
      console.error(e);
    } finally {
      this.loading.set(false);
    }
  }
  
  private getFriendlyErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/email-already-in-use':
        return 'This email is already registered. Please log in.';
      case 'auth/weak-password':
        return 'The password is too weak. Please choose a stronger one.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  }
}

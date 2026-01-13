import { ChangeDetectionStrategy, Component, inject, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
})
export class LoginComponent {
  private authService = inject(AuthService);

  authSuccess = output<void>();
  switchToSignup = output<void>();

  email = '';
  password = '';
  loading = signal(false);
  error = signal<string | null>(null);

  async onSubmit(): Promise<void> {
    if (!this.email || !this.password || this.loading()) {
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    try {
      await this.authService.login(this.email, this.password);
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
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Invalid email or password. Please try again.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  }
}

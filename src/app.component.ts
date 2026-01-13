import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink } from '@angular/router';
import { AuthModalComponent } from './components/auth-modal/auth-modal.component';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  // FIX: Corrected typo from `Change-DetectionStrategy` to `ChangeDetectionStrategy`.
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterOutlet, RouterLink, AuthModalComponent],
})
export class AppComponent {
  private readonly authService = inject(AuthService);

  showAuthModal = signal(false);
  currentUser = this.authService.currentUser;
  currentUserProfile = this.authService.currentUserProfile;

  logout(): void {
    this.authService.logout();
  }
}
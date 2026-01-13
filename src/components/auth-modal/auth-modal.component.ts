import { ChangeDetectionStrategy, Component, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from '../login/login.component';
import { SignupComponent } from '../signup/signup.component';

@Component({
  selector: 'app-auth-modal',
  templateUrl: './auth-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, LoginComponent, SignupComponent]
})
export class AuthModalComponent {
  close = output<void>();
  showLogin = signal(true);

  onAuthSuccess(): void {
    this.close.emit();
  }
}

import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { AdminService } from '../../services/admin.service';
import { UserProfile } from '../../models/user.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, DatePipe],
})
export class UserManagementComponent {
  private readonly adminService = inject(AdminService);
  private readonly authService = inject(AuthService);
  
  users = signal<UserProfile[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  
  currentAdminUid = this.authService.currentUser()?.uid;
  
  constructor() {
    this.loadUsers();
  }

  async loadUsers(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const userList = await this.adminService.getAllUsers();
      this.users.set(userList);
    } catch (e) {
      console.error("Failed to load users", e);
      this.error.set("Could not load user data. Please try again later.");
    } finally {
      this.loading.set(false);
    }
  }

  async changeRole(uid: string, event: Event): Promise<void> {
    const newRole = (event.target as HTMLSelectElement).value as 'user' | 'seller' | 'admin';
    try {
      await this.adminService.updateUserRole(uid, newRole);
      // Update local state for immediate feedback
      this.users.update(currentUsers => 
        currentUsers.map(u => u.uid === uid ? { ...u, role: newRole } : u)
      );
    } catch (e) {
      console.error(`Failed to update role for user ${uid}`, e);
      alert('Failed to update role. Please check console for errors.');
    }
  }
  
  // Helper to convert Firestore Timestamp to Date
  toDate(timestamp: any): Date {
    if (timestamp && typeof timestamp.toDate === 'function') {
      return timestamp.toDate();
    }
    return new Date();
  }
}

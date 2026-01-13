import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map } from 'rxjs/operators';
import { effect, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // We need to wait for the user profile to be loaded
  return new Promise(resolve => {
    // Effect will run once when the signal changes from its initial null state
    const watcher = effect(() => {
        const profile = authService.currentUserProfile();
        // The auth state is now determined (either a user profile or still null after loading)
        if (profile !== null || !authService.currentUser()) {
             if (profile?.role === 'admin') {
                resolve(true);
            } else {
                router.navigate(['/']);
                resolve(false);
            }
            watcher.destroy(); // Clean up the effect
        }
    });
  });
};

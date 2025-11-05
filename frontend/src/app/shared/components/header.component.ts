import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="bg-white shadow-sm border-b border-gray-200">
      <div class="px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center">
            <h1 class="text-xl font-bold text-gray-900">CKKS Admin Panel</h1>
          </div>
          <div class="flex items-center space-x-4">
            @if (currentUser) {
              <span class="text-gray-700 text-sm">{{ currentUser.email }}</span>
            }
            <button (click)="logout()" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
              Wyloguj
            </button>
          </div>
        </div>
      </div>
    </nav>
  `
})
export class HeaderComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  get currentUser() {
    return this.authService.getCurrentUser();
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        console.error('Logout error:', err);
        this.router.navigate(['/auth/login']);
      }
    });
  }
}

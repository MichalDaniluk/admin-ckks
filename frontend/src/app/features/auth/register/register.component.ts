import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        <div>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Zarejestruj nową organizację
          </h2>
        </div>
        <form class="mt-8 space-y-6" [formGroup]="registerForm" (ngSubmit)="onSubmit()">
          @if (errorMessage) {
            <div class="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              <span class="block sm:inline">{{ errorMessage }}</span>
            </div>
          }

          <div class="rounded-md shadow-sm space-y-2">
            <input formControlName="slug" type="text" class="w-full px-3 py-2 border rounded" placeholder="Slug organizacji (np. firma)"/>
            <input formControlName="companyName" type="text" class="w-full px-3 py-2 border rounded" placeholder="Nazwa firmy"/>
            <input formControlName="firstName" type="text" class="w-full px-3 py-2 border rounded" placeholder="Imię"/>
            <input formControlName="lastName" type="text" class="w-full px-3 py-2 border rounded" placeholder="Nazwisko"/>
            <input formControlName="email" type="email" class="w-full px-3 py-2 border rounded" placeholder="Email"/>
            <input formControlName="password" type="password" class="w-full px-3 py-2 border rounded" placeholder="Hasło (min. 8 znaków)"/>
            <input formControlName="phone" type="tel" class="w-full px-3 py-2 border rounded" placeholder="Telefon"/>
          </div>

          <button type="submit" [disabled]="!registerForm.valid || loading"
            class="w-full py-2 px-4 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50">
            {{ loading ? 'Rejestracja...' : 'Zarejestruj się' }}
          </button>

          <div class="text-center">
            <a routerLink="/auth/login" class="text-indigo-600 hover:text-indigo-500">
              Masz już konto? Zaloguj się
            </a>
          </div>
        </form>
      </div>
    </div>
  `
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  registerForm: FormGroup;
  loading = false;
  errorMessage = '';

  constructor() {
    this.registerForm = this.fb.group({
      slug: ['', [Validators.required]],
      companyName: ['', [Validators.required]],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      phone: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.loading = true;
      this.errorMessage = '';

      this.authService.register(this.registerForm.value).subscribe({
        next: () => {
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Błąd rejestracji.';
          this.loading = false;
        }
      });
    }
  }
}

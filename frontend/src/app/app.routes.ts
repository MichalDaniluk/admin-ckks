import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadChildren: () => import('./features/dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES)
  },
  {
    path: 'courses',
    canActivate: [authGuard],
    loadChildren: () => import('./features/courses/courses.routes').then(m => m.COURSES_ROUTES)
  },
  {
    path: 'sessions',
    canActivate: [authGuard],
    loadChildren: () => import('./features/sessions/sessions.routes').then(m => m.SESSIONS_ROUTES)
  },
  {
    path: 'enrollments',
    canActivate: [authGuard],
    loadChildren: () => import('./features/enrollments/enrollments.routes').then(m => m.ENROLLMENTS_ROUTES)
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];

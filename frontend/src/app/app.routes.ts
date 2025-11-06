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
    path: 'students',
    canActivate: [authGuard],
    loadChildren: () => import('./features/students/students.routes').then(m => m.STUDENTS_ROUTES)
  },
  {
    path: 'users',
    canActivate: [authGuard],
    loadChildren: () => import('./features/users/users.routes').then(m => m.USERS_ROUTES)
  },
  {
    path: 'instructors',
    canActivate: [authGuard],
    loadChildren: () => import('./features/instructors/instructors.routes').then(m => m.INSTRUCTORS_ROUTES)
  },
  {
    path: 'locations',
    canActivate: [authGuard],
    loadChildren: () => import('./features/locations/locations.routes').then(m => m.LOCATIONS_ROUTES)
  },
  {
    path: 'time-tracking',
    canActivate: [authGuard],
    loadChildren: () => import('./features/time-tracking/time-tracking.routes').then(m => m.TIME_TRACKING_ROUTES)
  },
  {
    path: 'marketing/blog',
    canActivate: [authGuard],
    loadChildren: () => import('./features/marketing/blog/blog.routes').then(m => m.BLOG_ROUTES)
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];

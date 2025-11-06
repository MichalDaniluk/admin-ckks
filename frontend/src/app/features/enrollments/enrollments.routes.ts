import { Routes } from '@angular/router';

export const ENROLLMENTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/enrollments-list.component').then(m => m.EnrollmentsListComponent)
  },
  {
    path: 'latest',
    loadComponent: () => import('./list/enrollments-list.component').then(m => m.EnrollmentsListComponent),
    data: { filterByLatest: true }
  },
  {
    path: 'upcoming-7-days',
    loadComponent: () => import('./list/enrollments-list.component').then(m => m.EnrollmentsListComponent),
    data: { filterByUpcoming7Days: true }
  },
  {
    path: 'upcoming-14-days',
    loadComponent: () => import('./list/enrollments-list.component').then(m => m.EnrollmentsListComponent),
    data: { filterByUpcoming14Days: true }
  }
];

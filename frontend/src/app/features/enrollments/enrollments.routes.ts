import { Routes } from '@angular/router';

export const ENROLLMENTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/enrollments-list.component').then(m => m.EnrollmentsListComponent)
  }
];

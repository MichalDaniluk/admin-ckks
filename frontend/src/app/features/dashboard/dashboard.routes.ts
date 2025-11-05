import { Routes } from '@angular/router';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./main/dashboard.component').then(m => m.DashboardComponent)
  }
];

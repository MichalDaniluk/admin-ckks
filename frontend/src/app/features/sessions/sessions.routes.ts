import { Routes } from '@angular/router';

export const SESSIONS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/sessions-list.component').then(m => m.SessionsListComponent)
  }
];

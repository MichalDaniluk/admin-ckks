import { Routes } from '@angular/router';

export const COURSES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/courses-list.component').then(m => m.CoursesListComponent)
  }
];

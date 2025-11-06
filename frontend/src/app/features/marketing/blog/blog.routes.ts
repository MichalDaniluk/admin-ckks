import { Routes } from '@angular/router';

export const BLOG_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/blog-list.component').then(m => m.BlogListComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./view/blog-view.component').then(m => m.BlogViewComponent)
  }
];

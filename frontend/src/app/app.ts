import { Component, inject } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { HeaderComponent } from './shared/components/header.component';
import { SidebarComponent } from './shared/components/sidebar.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, HeaderComponent, SidebarComponent],
  template: `
    @if (showLayout) {
      <div class="flex h-screen bg-gray-100">
        <!-- Sidebar -->
        <app-sidebar></app-sidebar>

        <!-- Main content area -->
        <div class="flex-1 flex flex-col overflow-hidden">
          <!-- Header -->
          <app-header></app-header>

          <!-- Main content -->
          <main class="flex-1 overflow-x-hidden overflow-y-auto">
            <router-outlet></router-outlet>
          </main>
        </div>
      </div>
    } @else {
      <!-- Auth pages without layout -->
      <router-outlet></router-outlet>
    }
  `,
  styles: []
})
export class AppComponent {
  title = 'CKKS Admin Panel';
  showLayout = false;
  private router = inject(Router);

  constructor() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.showLayout = !event.url.startsWith('/auth');
      });
  }
}

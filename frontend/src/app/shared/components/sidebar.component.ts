import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterModule],
  template: `
    <div class="flex flex-col w-64 bg-gray-800 min-h-screen">
      <nav class="flex-1 px-2 py-4 space-y-1">
        <a routerLink="/dashboard"
           routerLinkActive="bg-gray-900 text-white"
           [routerLinkActiveOptions]="{exact: false}"
           class="group flex items-center px-3 py-3 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white transition-colors">
          <svg class="mr-3 h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Dashboard
        </a>

        <a routerLink="/courses"
           routerLinkActive="bg-gray-900 text-white"
           [routerLinkActiveOptions]="{exact: false}"
           class="group flex items-center px-3 py-3 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white transition-colors">
          <svg class="mr-3 h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          Kursy
        </a>

        <a routerLink="/sessions"
           routerLinkActive="bg-gray-900 text-white"
           [routerLinkActiveOptions]="{exact: false}"
           class="group flex items-center px-3 py-3 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white transition-colors">
          <svg class="mr-3 h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Sesje
        </a>

        <!-- Zapisy - dropdown menu -->
        <div class="space-y-1">
          <button (click)="toggleEnrollmentsMenu()"
                  type="button"
                  [class.bg-gray-900]="enrollmentsMenuOpen"
                  [class.text-white]="enrollmentsMenuOpen"
                  class="group flex items-center justify-between w-full px-3 py-3 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white transition-colors">
            <div class="flex items-center">
              <svg class="mr-3 h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Zapisy
            </div>
            <svg [class.rotate-90]="enrollmentsMenuOpen" class="h-5 w-5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          @if (enrollmentsMenuOpen) {
            <div class="ml-11 space-y-1">
              <a routerLink="/enrollments"
                 routerLinkActive="bg-gray-700 text-white"
                 [routerLinkActiveOptions]="{exact: true}"
                 class="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-400 hover:bg-gray-700 hover:text-white transition-colors">
                Wszystkie zapisy
              </a>
              <a routerLink="/enrollments/latest"
                 routerLinkActive="bg-gray-700 text-white"
                 [routerLinkActiveOptions]="{exact: false}"
                 class="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-400 hover:bg-gray-700 hover:text-white transition-colors">
                Najnowsze zapisy
              </a>
              <a routerLink="/enrollments/upcoming-7-days"
                 routerLinkActive="bg-gray-700 text-white"
                 [routerLinkActiveOptions]="{exact: false}"
                 class="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-400 hover:bg-gray-700 hover:text-white transition-colors">
                7 dni
              </a>
              <a routerLink="/enrollments/upcoming-14-days"
                 routerLinkActive="bg-gray-700 text-white"
                 [routerLinkActiveOptions]="{exact: false}"
                 class="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-400 hover:bg-gray-700 hover:text-white transition-colors">
                14 dni
              </a>
            </div>
          }
        </div>

        <a routerLink="/students"
           routerLinkActive="bg-gray-900 text-white"
           [routerLinkActiveOptions]="{exact: false}"
           class="group flex items-center px-3 py-3 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white transition-colors">
          <svg class="mr-3 h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          Kursanci
        </a>

        <a routerLink="/users"
           routerLinkActive="bg-gray-900 text-white"
           [routerLinkActiveOptions]="{exact: false}"
           class="group flex items-center px-3 py-3 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white transition-colors">
          <svg class="mr-3 h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Użytkownicy
        </a>

        <a routerLink="/instructors"
           routerLinkActive="bg-gray-900 text-white"
           [routerLinkActiveOptions]="{exact: false}"
           class="group flex items-center px-3 py-3 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white transition-colors">
          <svg class="mr-3 h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Instruktorzy
        </a>

        <a routerLink="/locations"
           routerLinkActive="bg-gray-900 text-white"
           [routerLinkActiveOptions]="{exact: false}"
           class="group flex items-center px-3 py-3 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white transition-colors">
          <svg class="mr-3 h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Miejsca
        </a>

        <a routerLink="/time-tracking"
           routerLinkActive="bg-gray-900 text-white"
           [routerLinkActiveOptions]="{exact: false}"
           class="group flex items-center px-3 py-3 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white transition-colors">
          <svg class="mr-3 h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Czas pracy
        </a>

        <!-- Marketing - dropdown menu -->
        <div class="space-y-1">
          <button (click)="toggleMarketingMenu()"
                  type="button"
                  [class.bg-gray-900]="marketingMenuOpen"
                  [class.text-white]="marketingMenuOpen"
                  class="group flex items-center justify-between w-full px-3 py-3 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white transition-colors">
            <div class="flex items-center">
              <svg class="mr-3 h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
              Marketing
            </div>
            <svg [class.rotate-90]="marketingMenuOpen" class="h-5 w-5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          @if (marketingMenuOpen) {
            <div class="ml-11 space-y-1">
              <a routerLink="/marketing/blog"
                 routerLinkActive="bg-gray-700 text-white"
                 [routerLinkActiveOptions]="{exact: false}"
                 class="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-400 hover:bg-gray-700 hover:text-white transition-colors">
                Blog
              </a>
            </div>
          }
        </div>
      </nav>
    </div>
  `
})
export class SidebarComponent {
  enrollmentsMenuOpen = false;
  marketingMenuOpen = false;

  toggleEnrollmentsMenu(): void {
    this.enrollmentsMenuOpen = !this.enrollmentsMenuOpen;
  }

  toggleMarketingMenu(): void {
    this.marketingMenuOpen = !this.marketingMenuOpen;
  }
}

import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterModule],
  template: `
    <div class="bg-gray-100">
      <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div class="px-4 py-6 sm:px-0">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">Panel główny</h2>

          <!-- Stats Grid -->
          <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div class="bg-white overflow-hidden shadow rounded-lg">
              <div class="p-5">
                <div class="flex items-center">
                  <div class="flex-1">
                    <dl>
                      <dt class="text-sm font-medium text-gray-500 truncate">
                        Aktywne kursy
                      </dt>
                      <dd class="mt-1 text-3xl font-semibold text-gray-900">
                        --
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div class="bg-gray-50 px-5 py-3">
                <a routerLink="/courses" class="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                  Zobacz wszystkie
                </a>
              </div>
            </div>

            <div class="bg-white overflow-hidden shadow rounded-lg">
              <div class="p-5">
                <div class="flex items-center">
                  <div class="flex-1">
                    <dl>
                      <dt class="text-sm font-medium text-gray-500 truncate">
                        Zaplanowane sesje
                      </dt>
                      <dd class="mt-1 text-3xl font-semibold text-gray-900">
                        --
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div class="bg-gray-50 px-5 py-3">
                <a routerLink="/sessions" class="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                  Zobacz wszystkie
                </a>
              </div>
            </div>

            <div class="bg-white overflow-hidden shadow rounded-lg">
              <div class="p-5">
                <div class="flex items-center">
                  <div class="flex-1">
                    <dl>
                      <dt class="text-sm font-medium text-gray-500 truncate">
                        Aktywne zapisy
                      </dt>
                      <dd class="mt-1 text-3xl font-semibold text-gray-900">
                        --
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div class="bg-gray-50 px-5 py-3">
                <a routerLink="/enrollments" class="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                  Zobacz wszystkie
                </a>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="mt-8">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Szybkie akcje</h3>
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <button routerLink="/courses" class="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
                <span class="text-indigo-600 font-medium">+ Dodaj nowy kurs</span>
              </button>
              <button routerLink="/sessions" class="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
                <span class="text-indigo-600 font-medium">+ Zaplanuj sesję</span>
              </button>
              <button routerLink="/enrollments" class="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
                <span class="text-indigo-600 font-medium">+ Zapisz uczestnika</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  ngOnInit(): void {
    // Load dashboard data here
  }
}

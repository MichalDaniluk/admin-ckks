import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-enrollments-list',
  imports: [CommonModule, RouterModule],
  template: `
    <div class="bg-gray-100">
      <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div class="px-4 py-6 sm:px-0">
          <div class="mb-6">
            <h2 class="text-2xl font-bold text-gray-900">Zapisy na kursy</h2>
          </div>
          <div class="bg-white shadow rounded-lg p-6">
            <p class="text-gray-600">Lista zapisów - do implementacji</p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class EnrollmentsListComponent {}

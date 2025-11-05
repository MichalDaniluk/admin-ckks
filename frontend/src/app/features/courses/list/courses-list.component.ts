import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CoursesService } from '../../../core/services/courses.service';
import { Course } from '../../../core/models/course.model';

@Component({
  selector: 'app-courses-list',
  imports: [CommonModule, RouterModule],
  template: `
    <div class="bg-gray-100">
      <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div class="px-4 py-6 sm:px-0">
          <div class="mb-6">
            <h2 class="text-2xl font-bold text-gray-900">Kursy</h2>
          </div>

          @if (loading) {
            <div class="text-center py-8">Ładowanie kursów...</div>
          } @else if (error) {
            <div class="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
              {{ error }}
            </div>
          } @else {
            <div class="bg-white shadow overflow-hidden sm:rounded-md">
              <ul class="divide-y divide-gray-200">
                @for (course of courses; track course.id) {
                  <li class="px-6 py-4 hover:bg-gray-50">
                    <div class="flex items-center justify-between">
                      <div>
                        <h3 class="text-lg font-medium text-gray-900">{{ course.title }}</h3>
                        <p class="text-sm text-gray-500">Kod: {{ course.code }}</p>
                        <p class="text-sm text-gray-500">Status: {{ course.status }}</p>
                      </div>
                      <div class="text-right">
                        <p class="text-lg font-semibold text-gray-900">{{ course.price }} {{ course.currency }}</p>
                        <p class="text-sm text-gray-500">{{ course.durationHours }}h</p>
                      </div>
                    </div>
                  </li>
                } @empty {
                  <li class="px-6 py-4 text-center text-gray-500">
                    Brak kursów do wyświetlenia
                  </li>
                }
              </ul>
            </div>

            @if (totalPages > 1) {
              <div class="mt-4 flex justify-between items-center">
                <button (click)="previousPage()" [disabled]="currentPage === 1"
                  class="px-4 py-2 border rounded disabled:opacity-50">
                  Poprzednia
                </button>
                <span>Strona {{ currentPage }} z {{ totalPages }}</span>
                <button (click)="nextPage()" [disabled]="currentPage === totalPages"
                  class="px-4 py-2 border rounded disabled:opacity-50">
                  Następna
                </button>
              </div>
            }
          }
        </div>
      </div>
    </div>
  `
})
export class CoursesListComponent implements OnInit {
  private coursesService = inject(CoursesService);

  courses: Course[] = [];
  loading = false;
  error = '';
  currentPage = 1;
  totalPages = 1;
  limit = 10;

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(): void {
    this.loading = true;
    this.error = '';

    this.coursesService.getCourses({ page: this.currentPage, limit: this.limit }).subscribe({
      next: (response) => {
        this.courses = response.data;
        this.totalPages = response.totalPages;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Błąd podczas ładowania kursów';
        this.loading = false;
      }
    });
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadCourses();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadCourses();
    }
  }
}

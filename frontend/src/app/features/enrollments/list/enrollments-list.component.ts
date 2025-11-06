import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EnrollmentsService } from '../../../core/services/enrollments.service';
import { EnrollmentFormModalComponent } from '../form/enrollment-form-modal.component';
import {
  Enrollment,
  QueryEnrollmentsDto,
  EnrollmentStatus,
  PaymentStatus
} from '../../../core/models/enrollment.model';

@Component({
  selector: 'app-enrollments-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, EnrollmentFormModalComponent],
  template: `
    <div class="min-h-screen bg-gray-100">
      <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div class="px-4 py-6 sm:px-0">
          <!-- Header -->
          <div class="mb-6 flex justify-between items-center">
            <h2 class="text-2xl font-bold text-gray-900">{{ pageTitle }}</h2>
            <button
              (click)="openAddModal()"
              class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              + Dodaj zapis
            </button>
          </div>

          <!-- Filters -->
          <div class="bg-white shadow rounded-lg p-4 mb-6">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
              <!-- Search -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Szukaj</label>
                <input
                  type="text"
                  [(ngModel)]="searchTerm"
                  (keyup.enter)="applyFilters()"
                  placeholder="Kod zapisu, email..."
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <!-- Status Filter -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Status zapisu</label>
                <select
                  [(ngModel)]="filterStatus"
                  (change)="applyFilters()"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Wszystkie</option>
                  <option value="pending">Oczekujący</option>
                  <option value="confirmed">Potwierdzony</option>
                  <option value="cancelled">Anulowany</option>
                  <option value="completed">Ukończony</option>
                  <option value="no_show">Nieobecność</option>
                </select>
              </div>

              <!-- Payment Status Filter -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Status płatności</label>
                <select
                  [(ngModel)]="filterPaymentStatus"
                  (change)="applyFilters()"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Wszystkie</option>
                  <option value="unpaid">Nieopłacone</option>
                  <option value="partial">Częściowo</option>
                  <option value="paid">Opłacone</option>
                  <option value="refunded">Zwrócone</option>
                  <option value="waived">Zwolnione</option>
                </select>
              </div>

              <!-- Actions -->
              <div class="flex items-end">
                <button
                  (click)="clearFilters()"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                >
                  Wyczyść filtry
                </button>
              </div>
            </div>
          </div>

          <!-- Table -->
          <div class="bg-white shadow rounded-lg overflow-hidden">
            @if (isLoading) {
              <div class="p-12 text-center">
                <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                <p class="mt-2 text-gray-600">Ładowanie...</p>
              </div>
            } @else if (enrollments.length === 0) {
              <div class="p-12 text-center">
                <p class="text-gray-500">Brak zapisów do wyświetlenia</p>
              </div>
            } @else {
              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Kod zapisu
                      </th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student
                      </th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sesja
                      </th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Płatność
                      </th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cena
                      </th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data zapisu
                      </th>
                      <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Akcje
                      </th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    @for (enrollment of enrollments; track enrollment.id) {
                      <tr class="hover:bg-gray-50">
                        <td class="px-6 py-4 whitespace-nowrap">
                          <div class="text-sm font-medium text-gray-900">
                            {{ enrollment.enrollmentCode }}
                          </div>
                          @if (enrollment.isWaitlist) {
                            <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                              Lista oczekujących
                            </span>
                          }
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                          <div class="text-sm text-gray-900">
                            {{ enrollment.student?.firstName }} {{ enrollment.student?.lastName }}
                          </div>
                          <div class="text-sm text-gray-500">
                            {{ enrollment.student?.email }}
                          </div>
                        </td>
                        <td class="px-6 py-4">
                          <div class="text-sm text-gray-900">
                            {{ enrollment.session?.sessionName }}
                          </div>
                          <div class="text-sm text-gray-500">
                            {{ enrollment.session?.sessionCode }}
                          </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                          <span [class]="getStatusBadgeClass(enrollment.status)">
                            {{ getStatusLabel(enrollment.status) }}
                          </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                          <span [class]="getPaymentStatusBadgeClass(enrollment.paymentStatus)">
                            {{ getPaymentStatusLabel(enrollment.paymentStatus) }}
                          </span>
                          @if (enrollment.paymentStatus === 'partial') {
                            <div class="text-xs text-gray-500 mt-1">
                              {{ enrollment.amountPaid }} / {{ enrollment.price }} {{ enrollment.currency }}
                            </div>
                          }
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          @if (enrollment.price) {
                            {{ enrollment.price }} {{ enrollment.currency }}
                          } @else {
                            <span class="text-gray-500">Brak</span>
                          }
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {{ enrollment.enrolledAt | date:'short' }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            (click)="openEditModal(enrollment)"
                            class="text-indigo-600 hover:text-indigo-900 mr-3"
                            title="Edytuj"
                          >
                            Edytuj
                          </button>
                          <button
                            (click)="deleteEnrollment(enrollment)"
                            class="text-red-600 hover:text-red-900"
                            title="Usuń"
                          >
                            Usuń
                          </button>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>

              <!-- Pagination -->
              <div class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div class="flex-1 flex justify-between sm:hidden">
                  <button
                    (click)="previousPage()"
                    [disabled]="currentPage === 1"
                    class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Poprzednia
                  </button>
                  <button
                    (click)="nextPage()"
                    [disabled]="currentPage >= totalPages"
                    class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Następna
                  </button>
                </div>
                <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p class="text-sm text-gray-700">
                      Pokazuję
                      <span class="font-medium">{{ (currentPage - 1) * pageSize + 1 }}</span>
                      do
                      <span class="font-medium">{{ Math.min(currentPage * pageSize, totalItems) }}</span>
                      z
                      <span class="font-medium">{{ totalItems }}</span>
                      wyników
                    </p>
                  </div>
                  <div>
                    <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        (click)="previousPage()"
                        [disabled]="currentPage === 1"
                        class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span class="sr-only">Poprzednia</span>
                        ‹
                      </button>

                      @for (page of getPageNumbers(); track page) {
                        <button
                          (click)="goToPage(page)"
                          [class.bg-indigo-50]="page === currentPage"
                          [class.border-indigo-500]="page === currentPage"
                          [class.text-indigo-600]="page === currentPage"
                          class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                          {{ page }}
                        </button>
                      }

                      <button
                        (click)="nextPage()"
                        [disabled]="currentPage >= totalPages"
                        class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span class="sr-only">Następna</span>
                        ›
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <app-enrollment-form-modal
      [isOpen]="showModal"
      [enrollment]="selectedEnrollment"
      (closeModal)="closeModal()"
      (enrollmentSaved)="handleSave($event)"
    />
  `
})
export class EnrollmentsListComponent implements OnInit {
  private enrollmentsService = inject(EnrollmentsService);
  private route = inject(ActivatedRoute);

  enrollments: Enrollment[] = [];
  isLoading = false;

  // Page configuration
  pageTitle = 'Zapisy na kursy';
  isLatestView = false;
  isUpcoming7DaysView = false;
  isUpcoming14DaysView = false;

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  totalPages = 0;
  Math = Math;

  // Filters
  searchTerm = '';
  filterStatus: EnrollmentStatus | '' = '';
  filterPaymentStatus: PaymentStatus | '' = '';

  // Modal
  showModal = false;
  selectedEnrollment: Enrollment | null = null;

  ngOnInit(): void {
    // Check route data to determine view type
    this.route.data.subscribe(data => {
      this.isLatestView = data['filterByLatest'] || false;
      this.isUpcoming7DaysView = data['filterByUpcoming7Days'] || false;
      this.isUpcoming14DaysView = data['filterByUpcoming14Days'] || false;

      if (this.isLatestView) {
        this.pageTitle = 'Najnowsze zapisy';
        this.pageSize = 20; // Show more items for latest view
      } else if (this.isUpcoming7DaysView) {
        this.pageTitle = 'Zapisy na kursy rozpoczynające się w ciągu 7 dni';
        this.pageSize = 20; // Show more items for upcoming view
      } else if (this.isUpcoming14DaysView) {
        this.pageTitle = 'Zapisy na kursy rozpoczynające się w ciągu 14 dni';
        this.pageSize = 20; // Show more items for upcoming view
      }
    });

    this.loadEnrollments();
  }

  loadEnrollments(): void {
    this.isLoading = true;

    const query: QueryEnrollmentsDto = {
      page: this.currentPage,
      limit: this.pageSize,
      search: this.searchTerm || undefined,
      status: this.filterStatus || undefined,
      paymentStatus: this.filterPaymentStatus || undefined,
      sortBy: 'enrolledAt',
      sortOrder: 'DESC'
    };

    // For "latest" view, filter enrollments from last 30 days
    if (this.isLatestView) {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      query.enrolledAfter = thirtyDaysAgo.toISOString();
    }

    // For "7 days" view, filter sessions starting within next 7 days
    if (this.isUpcoming7DaysView) {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Start of today
      const sevenDaysLater = new Date(today);
      sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);
      sevenDaysLater.setHours(23, 59, 59, 999); // End of 7th day

      query.sessionStartAfter = today.toISOString();
      query.sessionStartBefore = sevenDaysLater.toISOString();
    }

    // For "14 days" view, filter sessions starting within next 14 days
    if (this.isUpcoming14DaysView) {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Start of today
      const fourteenDaysLater = new Date(today);
      fourteenDaysLater.setDate(fourteenDaysLater.getDate() + 14);
      fourteenDaysLater.setHours(23, 59, 59, 999); // End of 14th day

      query.sessionStartAfter = today.toISOString();
      query.sessionStartBefore = fourteenDaysLater.toISOString();
    }

    this.enrollmentsService.getEnrollments(query).subscribe({
      next: (response) => {
        this.enrollments = response.data;
        this.totalItems = response.total;
        this.totalPages = response.totalPages;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading enrollments', err);
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.loadEnrollments();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.filterStatus = '';
    this.filterPaymentStatus = '';
    this.applyFilters();
  }

  // Pagination
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadEnrollments();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadEnrollments();
    }
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.loadEnrollments();
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(this.totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }

  // Modal operations
  openAddModal(): void {
    this.selectedEnrollment = null;
    this.showModal = true;
  }

  openEditModal(enrollment: Enrollment): void {
    this.selectedEnrollment = enrollment;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedEnrollment = null;
  }

  handleSave(enrollment: Enrollment): void {
    this.loadEnrollments();
  }

  deleteEnrollment(enrollment: Enrollment): void {
    if (confirm(`Czy na pewno chcesz usunąć zapis ${enrollment.enrollmentCode}?`)) {
      this.enrollmentsService.deleteEnrollment(enrollment.id).subscribe({
        next: () => {
          this.loadEnrollments();
        },
        error: (err) => {
          console.error('Error deleting enrollment', err);
          alert('Wystąpił błąd podczas usuwania zapisu');
        }
      });
    }
  }

  // Status helpers
  getStatusLabel(status: EnrollmentStatus): string {
    const labels: Record<EnrollmentStatus, string> = {
      pending: 'Oczekujący',
      confirmed: 'Potwierdzony',
      cancelled: 'Anulowany',
      completed: 'Ukończony',
      no_show: 'Nieobecność'
    };
    return labels[status];
  }

  getStatusBadgeClass(status: EnrollmentStatus): string {
    const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
    const statusClasses: Record<EnrollmentStatus, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800',
      no_show: 'bg-gray-100 text-gray-800'
    };
    return `${baseClasses} ${statusClasses[status]}`;
  }

  getPaymentStatusLabel(status: PaymentStatus): string {
    const labels: Record<PaymentStatus, string> = {
      unpaid: 'Nieopłacone',
      partial: 'Częściowo',
      paid: 'Opłacone',
      refunded: 'Zwrócone',
      waived: 'Zwolnione'
    };
    return labels[status];
  }

  getPaymentStatusBadgeClass(status: PaymentStatus): string {
    const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
    const statusClasses: Record<PaymentStatus, string> = {
      unpaid: 'bg-red-100 text-red-800',
      partial: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      refunded: 'bg-purple-100 text-purple-800',
      waived: 'bg-blue-100 text-blue-800'
    };
    return `${baseClasses} ${statusClasses[status]}`;
  }
}

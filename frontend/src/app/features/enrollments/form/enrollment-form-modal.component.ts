import { Component, Input, Output, EventEmitter, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EnrollmentsService } from '../../../core/services/enrollments.service';
import { SessionsService } from '../../../core/services/sessions.service';
import { UsersService } from '../../../core/services/users.service';
import { PaymentService } from '../../../core/services/payment.service';
import {
  Enrollment,
  CreateEnrollmentDto,
  UpdateEnrollmentDto,
  EnrollmentStatus,
  PaymentStatus
} from '../../../core/models/enrollment.model';
import { CourseSession } from '../../../core/models/session.model';
import { User } from '../../../core/models/user.model';
import {
  Payment,
  PaymentType,
  PaymentMethod,
  CreatePaymentDto,
  PaymentSummary
} from '../../../core/models/payment.model';

@Component({
  selector: 'app-enrollment-form-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" *ngIf="isOpen">
      <div class="relative top-10 mx-auto p-5 border w-[800px] shadow-lg rounded-md bg-white mb-20">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-bold text-gray-900">
            {{ isEditMode ? 'Edytuj zapis' : 'Nowy zapis na kurs' }}
          </h3>
          <button
            type="button"
            (click)="onClose()"
            class="text-gray-400 hover:text-gray-600"
          >
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Tabs -->
        <div class="mb-6 border-b border-gray-200">
          <nav class="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              type="button"
              (click)="setActiveTab('basic')"
              [class.border-indigo-500]="activeTab === 'basic'"
              [class.text-indigo-600]="activeTab === 'basic'"
              [class.border-transparent]="activeTab !== 'basic'"
              [class.text-gray-500]="activeTab !== 'basic'"
              class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm hover:text-gray-700 hover:border-gray-300"
            >
              Podstawowe informacje
            </button>
            <button
              type="button"
              (click)="setActiveTab('payments')"
              [class.border-indigo-500]="activeTab === 'payments'"
              [class.text-indigo-600]="activeTab === 'payments'"
              [class.border-transparent]="activeTab !== 'payments'"
              [class.text-gray-500]="activeTab !== 'payments'"
              class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm hover:text-gray-700 hover:border-gray-300"
            >
              Wpłaty/Zwroty
            </button>
          </nav>
        </div>

        <form [formGroup]="enrollmentForm" (ngSubmit)="onSubmit()">
          <!-- Basic Tab Content -->
          <div *ngIf="activeTab === 'basic'" class="space-y-6">
            <!-- Basic Information -->
            <div>
              <h4 class="text-lg font-medium text-gray-900 mb-4">Podstawowe informacje</h4>

              <!-- Student -->
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Student
                </label>
                @if (isEditMode && enrollment) {
                  <div class="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md">
                    <p class="text-sm text-gray-900">
                      {{ enrollment.student?.firstName }} {{ enrollment.student?.lastName }}
                    </p>
                    <p class="text-xs text-gray-500">{{ enrollment.student?.email }}</p>
                  </div>
                } @else {
                  <select
                    formControlName="studentId"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    [class.border-red-500]="enrollmentForm.get('studentId')?.invalid && enrollmentForm.get('studentId')?.touched"
                  >
                    <option [value]="''">-- Wybierz studenta --</option>
                    @for (student of students; track student.id) {
                      <option [value]="student.id">
                        {{ student.firstName }} {{ student.lastName }} ({{ student.email }})
                      </option>
                    }
                  </select>
                  @if (enrollmentForm.get('studentId')?.invalid && enrollmentForm.get('studentId')?.touched) {
                    <p class="mt-1 text-sm text-red-600">Student jest wymagany</p>
                  }
                }
              </div>

              <!-- Session -->
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Sesja kursu
                </label>
                @if (isEditMode && enrollment) {
                  <div class="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md">
                    <p class="text-sm text-gray-900">
                      {{ enrollment.session?.sessionName }}
                    </p>
                    <p class="text-xs text-gray-500">
                      {{ enrollment.session?.sessionCode }} •
                      {{ enrollment.session?.startDate | date:'short' }} - {{ enrollment.session?.endDate | date:'short' }}
                    </p>
                    @if (enrollment.course) {
                      <p class="text-xs text-gray-500 mt-1">
                        Kurs: {{ enrollment.course?.courseTitle }}
                      </p>
                    }
                  </div>
                } @else {
                  <select
                    formControlName="sessionId"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    [class.border-red-500]="enrollmentForm.get('sessionId')?.invalid && enrollmentForm.get('sessionId')?.touched"
                  >
                    <option value="">-- Wybierz sesję --</option>
                    @for (session of sessions; track session.id) {
                      <option [value]="session.id">
                        {{ session.sessionName }} ({{ session.sessionCode }}) - {{ session.startDate | date:'short' }}
                      </option>
                    }
                  </select>
                  @if (enrollmentForm.get('sessionId')?.invalid && enrollmentForm.get('sessionId')?.touched) {
                    <p class="mt-1 text-sm text-red-600">Sesja jest wymagana</p>
                  }
                }
              </div>

              <!-- Enrollment Code -->
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Kod zapisu
                </label>
                <input
                  type="text"
                  formControlName="enrollmentCode"
                  placeholder="np. ENR-2024-001 (zostanie wygenerowany automatycznie)"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  [class.border-red-500]="enrollmentForm.get('enrollmentCode')?.invalid && enrollmentForm.get('enrollmentCode')?.touched"
                />
                <p class="mt-1 text-sm text-gray-500">
                  Pozostaw puste, aby wygenerować automatycznie
                </p>
                @if (enrollmentForm.get('enrollmentCode')?.invalid && enrollmentForm.get('enrollmentCode')?.touched) {
                  <p class="mt-1 text-sm text-red-600">
                    Kod zapisu musi mieć od 3 do 50 znaków
                  </p>
                }
              </div>
            </div>

            <!-- Status Information -->
            <div>
              <h4 class="text-lg font-medium text-gray-900 mb-4">Status</h4>

              <!-- Enrollment Status -->
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Status zapisu
                </label>
                <select
                  formControlName="status"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="pending">Oczekujący</option>
                  <option value="confirmed">Potwierdzony</option>
                  <option value="cancelled">Anulowany</option>
                  <option value="completed">Ukończony</option>
                  <option value="no_show">Nieobecność</option>
                </select>
              </div>

              <!-- Payment Status -->
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Status płatności
                </label>
                <select
                  formControlName="paymentStatus"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="unpaid">Nieopłacone</option>
                  <option value="partial">Częściowo opłacone</option>
                  <option value="paid">Opłacone</option>
                  <option value="refunded">Zwrócone</option>
                  <option value="waived">Zwolnione z opłaty</option>
                </select>
              </div>
            </div>

            <!-- Price Information -->
            <div>
              <h4 class="text-lg font-medium text-gray-900 mb-4">Cena</h4>

              <div class="grid grid-cols-2 gap-4">
                <!-- Price -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Cena
                  </label>
                  <input
                    type="number"
                    formControlName="price"
                    min="0"
                    step="0.01"
                    placeholder="np. 299.99"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <p class="mt-1 text-sm text-gray-500">Domyślnie cena z sesji/kursu</p>
                </div>

                <!-- Currency -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Waluta
                  </label>
                  <input
                    type="text"
                    formControlName="currency"
                    maxlength="3"
                    placeholder="PLN"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            <!-- Notes -->
            <div>
              <h4 class="text-lg font-medium text-gray-900 mb-4">Notatki</h4>

              <!-- Public Notes -->
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Notatki (widoczne dla studenta)
                </label>
                <textarea
                  formControlName="notes"
                  rows="3"
                  placeholder="Dodatkowe informacje..."
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                ></textarea>
              </div>

              <!-- Internal Notes -->
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Notatki wewnętrzne (tylko dla administratorów)
                </label>
                <textarea
                  formControlName="internalNotes"
                  rows="3"
                  placeholder="Notatki wewnętrzne..."
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                ></textarea>
              </div>
            </div>

            <!-- Settings -->
            <div>
              <h4 class="text-lg font-medium text-gray-900 mb-4">Ustawienia</h4>

              <!-- Send Notifications -->
              <div class="mb-4 flex items-center">
                <input
                  type="checkbox"
                  id="sendNotifications"
                  formControlName="sendNotifications"
                  class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label for="sendNotifications" class="ml-2 block text-sm text-gray-900">
                  Wysyłaj powiadomienia do studenta
                </label>
              </div>

              <!-- Waitlist -->
              <div class="mb-4 flex items-center">
                <input
                  type="checkbox"
                  id="isWaitlist"
                  formControlName="isWaitlist"
                  class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label for="isWaitlist" class="ml-2 block text-sm text-gray-900">
                  Dodaj do listy oczekujących
                </label>
              </div>
            </div>
          </div>

          <!-- Payments Tab Content -->
          <div *ngIf="activeTab === 'payments'" class="space-y-6">
            @if (!isEditMode) {
              <div class="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <p class="text-sm text-yellow-800">
                  Zapisz zapis na kurs, aby móc zarządzać wpłatami i zwrotami.
                </p>
              </div>
            } @else {
              <!-- Payment Summary -->
              <div class="bg-gray-50 rounded-lg p-4 space-y-3">
                <h4 class="text-base font-medium text-gray-900 mb-3">Podsumowanie płatności</h4>

                <div class="grid grid-cols-2 gap-4">
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">Cena kursu:</span>
                    <span class="text-sm font-medium text-gray-900">
                      {{ enrollmentForm.get('price')?.value || 0 | number:'1.2-2' }} {{ enrollmentForm.get('currency')?.value }}
                    </span>
                  </div>

                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">Wpłacono:</span>
                    <span class="text-sm font-medium text-green-600">
                      {{ paymentSummary?.totalPaid || 0 | number:'1.2-2' }} {{ enrollmentForm.get('currency')?.value }}
                    </span>
                  </div>

                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">Zwrócono:</span>
                    <span class="text-sm font-medium text-red-600">
                      {{ paymentSummary?.totalRefunded || 0 | number:'1.2-2' }} {{ enrollmentForm.get('currency')?.value }}
                    </span>
                  </div>

                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">Bilans:</span>
                    <span class="text-sm font-medium text-gray-900">
                      {{ paymentSummary?.netAmount || 0 | number:'1.2-2' }} {{ enrollmentForm.get('currency')?.value }}
                    </span>
                  </div>
                </div>

                <div class="border-t border-gray-200 pt-3">
                  <div class="flex justify-between items-center">
                    <span class="text-sm font-semibold text-gray-900">Do zapłaty:</span>
                    <span class="text-lg font-bold" [class]="getRemainingAmountClass()">
                      {{ getRemainingAmount() | number:'1.2-2' }} {{ enrollmentForm.get('currency')?.value }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Add New Payment Form -->
              <div class="border border-gray-200 rounded-lg p-4">
                <div class="flex justify-between items-center mb-4">
                  <h4 class="text-base font-medium text-gray-900">
                    {{ showPaymentForm ? 'Nowa wpłata/zwrot' : 'Dodaj wpłatę lub zwrot' }}
                  </h4>
                  <button
                    type="button"
                    (click)="togglePaymentForm()"
                    class="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    {{ showPaymentForm ? 'Anuluj' : '+ Dodaj' }}
                  </button>
                </div>

                @if (showPaymentForm) {
                  <form [formGroup]="paymentForm" (ngSubmit)="onAddPayment()" class="space-y-4">
                    <div class="grid grid-cols-2 gap-4">
                      <!-- Payment Type -->
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">
                          Typ <span class="text-red-500">*</span>
                        </label>
                        <select
                          formControlName="paymentType"
                          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="payment">Wpłata</option>
                          <option value="refund">Zwrot</option>
                          <option value="adjustment">Korekta</option>
                        </select>
                      </div>

                      <!-- Amount -->
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">
                          Kwota <span class="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          formControlName="amount"
                          min="0.01"
                          step="0.01"
                          placeholder="np. 150.00"
                          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                      <!-- Payment Method -->
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">
                          Metoda płatności
                        </label>
                        <select
                          formControlName="paymentMethod"
                          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="cash">Gotówka</option>
                          <option value="card">Karta</option>
                          <option value="bank_transfer">Przelew bankowy</option>
                          <option value="online">Płatność online</option>
                          <option value="other">Inna</option>
                        </select>
                      </div>

                      <!-- Payment Date -->
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">
                          Data
                        </label>
                        <input
                          type="date"
                          formControlName="paymentDate"
                          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>

                    <!-- Reference Number -->
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">
                        Numer referencyjny
                      </label>
                      <input
                        type="text"
                        formControlName="referenceNumber"
                        placeholder="np. TRF-2024-001"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <!-- Description -->
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">
                        Opis
                      </label>
                      <textarea
                        formControlName="description"
                        rows="2"
                        placeholder="Opcjonalny opis płatności..."
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      ></textarea>
                    </div>

                    <div class="flex justify-end">
                      <button
                        type="submit"
                        [disabled]="paymentForm.invalid || isProcessingPayment"
                        class="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        {{ isProcessingPayment ? 'Zapisywanie...' : 'Dodaj wpłatę' }}
                      </button>
                    </div>
                  </form>
                }
              </div>

              <!-- Payment History -->
              <div>
                <h4 class="text-base font-medium text-gray-900 mb-4">Historia wpłat i zwrotów</h4>

                @if (isLoadingPayments) {
                  <div class="text-center py-8">
                    <p class="text-sm text-gray-500">Ładowanie...</p>
                  </div>
                } @else if (payments.length === 0) {
                  <div class="text-center py-8 bg-gray-50 rounded-lg">
                    <p class="text-sm text-gray-500">Brak wpłat</p>
                  </div>
                } @else {
                  <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
                    <table class="min-w-full divide-y divide-gray-300">
                      <thead class="bg-gray-50">
                        <tr>
                          <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Data
                          </th>
                          <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Typ
                          </th>
                          <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Metoda
                          </th>
                          <th class="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Kwota
                          </th>
                          <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Referencja
                          </th>
                          <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Opis
                          </th>
                          <th class="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Akcje
                          </th>
                        </tr>
                      </thead>
                      <tbody class="bg-white divide-y divide-gray-200">
                        @for (payment of payments; track payment.id) {
                          <tr>
                            <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                              {{ payment.paymentDate | date:'short' }}
                            </td>
                            <td class="px-3 py-4 whitespace-nowrap text-sm">
                              @if (payment.paymentType === 'payment') {
                                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                  Wpłata
                                </span>
                              } @else if (payment.paymentType === 'refund') {
                                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                  Zwrot
                                </span>
                              } @else {
                                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                  Korekta
                                </span>
                              }
                            </td>
                            <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                              {{ getPaymentMethodLabel(payment.paymentMethod) }}
                            </td>
                            <td class="px-3 py-4 whitespace-nowrap text-sm text-right font-medium"
                                [class.text-green-600]="payment.paymentType === 'payment'"
                                [class.text-red-600]="payment.paymentType === 'refund'">
                              {{ payment.paymentType === 'refund' ? '-' : '' }}{{ payment.amount | number:'1.2-2' }} {{ payment.currency }}
                            </td>
                            <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                              {{ payment.referenceNumber || '-' }}
                            </td>
                            <td class="px-3 py-4 text-sm text-gray-500">
                              {{ payment.description || '-' }}
                            </td>
                            <td class="px-3 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                type="button"
                                (click)="onDeletePayment(payment.id)"
                                class="text-red-600 hover:text-red-900"
                              >
                                Usuń
                              </button>
                            </td>
                          </tr>
                        }
                      </tbody>
                    </table>
                  </div>
                }
              </div>
            }
          </div>

          <!-- Form Actions -->
          <div class="flex justify-end space-x-3 pt-4 border-t mt-6">
            <button
              type="button"
              (click)="onClose()"
              class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Anuluj
            </button>
            <button
              type="submit"
              [disabled]="enrollmentForm.invalid || isLoading"
              class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {{ isLoading ? 'Zapisywanie...' : (isEditMode ? 'Zapisz zmiany' : 'Utwórz zapis') }}
            </button>
          </div>

          <!-- Error Message -->
          @if (errorMessage) {
            <div class="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p class="text-sm text-red-600">{{ errorMessage }}</p>
            </div>
          }
        </form>
      </div>
    </div>
  `
})
export class EnrollmentFormModalComponent implements OnInit {
  @Input() isOpen = false;
  @Input() enrollment: Enrollment | null = null;
  @Input() prefilledSessionId?: string;
  @Output() closeModal = new EventEmitter<void>();
  @Output() enrollmentSaved = new EventEmitter<Enrollment>();

  private fb = inject(FormBuilder);
  private enrollmentsService = inject(EnrollmentsService);
  private sessionsService = inject(SessionsService);
  private usersService = inject(UsersService);
  private paymentService = inject(PaymentService);
  private cdr = inject(ChangeDetectorRef);

  enrollmentForm!: FormGroup;
  paymentForm!: FormGroup;
  students: User[] = [];
  sessions: CourseSession[] = [];
  payments: Payment[] = [];
  paymentSummary: PaymentSummary | null = null;
  isLoading = false;
  isLoadingPayments = false;
  isProcessingPayment = false;
  showPaymentForm = false;
  errorMessage = '';
  activeTab: 'basic' | 'payments' = 'basic';

  PaymentType = PaymentType;
  PaymentMethod = PaymentMethod;

  get isEditMode(): boolean {
    return !!this.enrollment;
  }

  ngOnInit(): void {
    this.initPaymentForm();

    // Load data first, then init form
    if (this.isEditMode && this.enrollment) {
      // For edit mode, load data and then init form
      Promise.all([
        this.loadStudentsPromise(),
        this.loadSessionsPromise()
      ]).then(() => {
        this.initForm();
        this.cdr.detectChanges();
        this.loadPayments();
        this.loadPaymentSummary();
      });
    } else {
      // For create mode, init form first
      this.initForm();
      this.loadStudents();
      this.loadSessions();
    }
  }

  private loadStudentsPromise(): Promise<void> {
    return new Promise((resolve) => {
      this.usersService.getUsers({ page: 1, limit: 100, isActive: true }).subscribe({
        next: (response) => {
          this.students = response.data;
          resolve();
        },
        error: (err) => {
          console.error('Error loading students', err);
          this.errorMessage = 'Nie udało się załadować listy studentów';
          resolve();
        }
      });
    });
  }

  private loadSessionsPromise(): Promise<void> {
    return new Promise((resolve) => {
      this.sessionsService.getSessions({ page: 1, limit: 100, isActive: true }).subscribe({
        next: (response) => {
          this.sessions = response.data;
          resolve();
        },
        error: (err) => {
          console.error('Error loading sessions', err);
          this.errorMessage = 'Nie udało się załadować listy sesji';
          resolve();
        }
      });
    });
  }

  setActiveTab(tab: 'basic' | 'payments'): void {
    this.activeTab = tab;

    // Load payments when switching to payments tab
    if (tab === 'payments' && this.isEditMode && this.enrollment && this.payments.length === 0) {
      this.loadPayments();
      this.loadPaymentSummary();
    }
  }

  getRemainingAmount(): number {
    const price = this.enrollmentForm.get('price')?.value || 0;
    const netAmount = this.paymentSummary?.netAmount || 0;
    return price - netAmount;
  }

  getRemainingAmountClass(): string {
    const remaining = this.getRemainingAmount();
    if (remaining <= 0) {
      return 'text-green-600';
    } else if (remaining < (this.enrollmentForm.get('price')?.value || 0) / 2) {
      return 'text-yellow-600';
    } else {
      return 'text-red-600';
    }
  }

  initPaymentForm(): void {
    const today = new Date().toISOString().split('T')[0];
    this.paymentForm = this.fb.group({
      paymentType: [PaymentType.PAYMENT],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      paymentMethod: [PaymentMethod.CASH],
      paymentDate: [today],
      referenceNumber: [''],
      description: [''],
    });
  }

  loadPayments(): void {
    if (!this.enrollment?.id) return;

    this.isLoadingPayments = true;
    this.paymentService.getPaymentsByEnrollment(this.enrollment.id).subscribe({
      next: (payments) => {
        this.payments = payments;
        this.isLoadingPayments = false;
      },
      error: (err) => {
        console.error('Error loading payments', err);
        this.isLoadingPayments = false;
        this.errorMessage = 'Nie udało się załadować historii wpłat';
      }
    });
  }

  loadPaymentSummary(): void {
    if (!this.enrollment?.id) return;

    this.paymentService.getPaymentSummary(this.enrollment.id).subscribe({
      next: (summary) => {
        this.paymentSummary = summary;
      },
      error: (err) => {
        console.error('Error loading payment summary', err);
      }
    });
  }

  togglePaymentForm(): void {
    this.showPaymentForm = !this.showPaymentForm;
    if (this.showPaymentForm) {
      this.paymentForm.reset({
        paymentType: PaymentType.PAYMENT,
        paymentMethod: PaymentMethod.CASH,
        paymentDate: new Date().toISOString().split('T')[0],
      });
    }
  }

  onAddPayment(): void {
    if (this.paymentForm.invalid || !this.enrollment?.id) {
      this.paymentForm.markAllAsTouched();
      return;
    }

    this.isProcessingPayment = true;
    const formValue = this.paymentForm.value;

    const paymentDto: CreatePaymentDto = {
      enrollmentId: this.enrollment.id,
      paymentType: formValue.paymentType,
      amount: formValue.amount,
      currency: this.enrollmentForm.get('currency')?.value || 'PLN',
      paymentMethod: formValue.paymentMethod,
      paymentDate: formValue.paymentDate,
      referenceNumber: formValue.referenceNumber || undefined,
      description: formValue.description || undefined,
    };

    this.paymentService.createPayment(paymentDto).subscribe({
      next: () => {
        this.isProcessingPayment = false;
        this.showPaymentForm = false;
        this.paymentForm.reset({
          paymentType: PaymentType.PAYMENT,
          paymentMethod: PaymentMethod.CASH,
          paymentDate: new Date().toISOString().split('T')[0],
        });
        // Reload payments and summary
        this.loadPayments();
        this.loadPaymentSummary();
      },
      error: (err) => {
        this.isProcessingPayment = false;
        this.errorMessage = err.error?.message || 'Wystąpił błąd podczas dodawania wpłaty';
        console.error('Error adding payment', err);
      }
    });
  }

  onDeletePayment(paymentId: string): void {
    if (!confirm('Czy na pewno chcesz usunąć tę wpłatę?')) {
      return;
    }

    this.paymentService.deletePayment(paymentId).subscribe({
      next: () => {
        // Reload payments and summary
        this.loadPayments();
        this.loadPaymentSummary();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Wystąpił błąd podczas usuwania wpłaty';
        console.error('Error deleting payment', err);
      }
    });
  }

  getPaymentMethodLabel(method: PaymentMethod): string {
    const labels: Record<PaymentMethod, string> = {
      [PaymentMethod.CASH]: 'Gotówka',
      [PaymentMethod.CARD]: 'Karta',
      [PaymentMethod.BANK_TRANSFER]: 'Przelew',
      [PaymentMethod.ONLINE]: 'Online',
      [PaymentMethod.OTHER]: 'Inna',
    };
    return labels[method] || method;
  }

  initForm(): void {
    const studentId = this.enrollment?.studentId || '';
    const sessionId = this.enrollment?.sessionId || this.prefilledSessionId || '';

    this.enrollmentForm = this.fb.group({
      studentId: [studentId, Validators.required],
      sessionId: [sessionId, Validators.required],
      enrollmentCode: [
        this.enrollment?.enrollmentCode || '',
        [Validators.minLength(3), Validators.maxLength(50)]
      ],
      status: [this.enrollment?.status || EnrollmentStatus.PENDING],
      paymentStatus: [this.enrollment?.paymentStatus || PaymentStatus.UNPAID],
      price: [this.enrollment?.price || null],
      currency: [this.enrollment?.currency || 'PLN', Validators.maxLength(3)],
      notes: [this.enrollment?.notes || ''],
      internalNotes: [''],
      sendNotifications: [
        this.enrollment?.sendNotifications !== undefined ? this.enrollment.sendNotifications : true
      ],
      isWaitlist: [this.enrollment?.isWaitlist || false],
      amountPaid: [this.enrollment?.amountPaid || 0],
      paymentDate: [this.enrollment?.paymentDate ? this.formatDateForInput(this.enrollment.paymentDate) : ''],
      paymentReference: [this.enrollment?.paymentReference || ''],
      paymentNotes: ['']
    });
  }

  formatDateForInput(dateString: string | Date): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  }

  loadStudents(): void {
    this.usersService.getUsers({ page: 1, limit: 100, isActive: true }).subscribe({
      next: (response) => {
        this.students = response.data;
      },
      error: (err) => {
        console.error('Error loading students', err);
        this.errorMessage = 'Nie udało się załadować listy studentów';
      }
    });
  }

  loadSessions(): void {
    this.sessionsService.getSessions({ page: 1, limit: 100, isActive: true }).subscribe({
      next: (response) => {
        this.sessions = response.data;
      },
      error: (err) => {
        console.error('Error loading sessions', err);
        this.errorMessage = 'Nie udało się załadować listy sesji';
      }
    });
  }

  onSubmit(): void {
    if (this.enrollmentForm.invalid) {
      this.enrollmentForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const formValue = this.enrollmentForm.value;

    const enrollmentData: CreateEnrollmentDto | UpdateEnrollmentDto = {
      ...formValue,
      enrollmentCode: formValue.enrollmentCode || undefined,
      price: formValue.price || undefined,
      currency: formValue.currency || 'PLN',
      amountPaid: formValue.amountPaid || 0,
      paymentDate: formValue.paymentDate || undefined,
      paymentReference: formValue.paymentReference || undefined
    };

    delete (enrollmentData as any).paymentNotes;

    // Remove studentId and sessionId from update requests (they cannot be changed)
    if (this.isEditMode) {
      delete (enrollmentData as any).studentId;
      delete (enrollmentData as any).sessionId;
    }

    const request = this.isEditMode
      ? this.enrollmentsService.updateEnrollment(this.enrollment!.id, enrollmentData)
      : this.enrollmentsService.createEnrollment(enrollmentData as CreateEnrollmentDto);

    request.subscribe({
      next: (enrollment) => {
        this.isLoading = false;
        this.enrollmentSaved.emit(enrollment);
        this.onClose();
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Wystąpił błąd podczas zapisywania zapisu na kurs';
        console.error('Error saving enrollment', err);
      }
    });
  }

  onClose(): void {
    this.enrollmentForm.reset();
    this.errorMessage = '';
    this.activeTab = 'basic';
    this.closeModal.emit();
  }
}

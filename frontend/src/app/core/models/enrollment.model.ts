export enum EnrollmentStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
  NO_SHOW = 'no_show'
}

export enum PaymentStatus {
  UNPAID = 'unpaid',
  PARTIAL = 'partial',
  PAID = 'paid',
  REFUNDED = 'refunded',
  WAIVED = 'waived'
}

export enum AttendanceStatus {
  NOT_STARTED = 'not_started',
  PRESENT = 'present',
  ABSENT = 'absent',
  PARTIAL = 'partial'
}

export interface Enrollment {
  id: string;
  studentId: string;
  courseId: string;
  sessionId: string;
  enrollmentCode: string;
  status: EnrollmentStatus;
  paymentStatus: PaymentStatus;
  attendanceStatus: AttendanceStatus;
  enrolledAt: Date;
  confirmedAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  price?: number;
  currency: string;
  amountPaid: number;
  paymentDate?: Date;
  paymentReference?: string;
  attendancePercentage: number;
  completionPercentage: number;
  finalGrade?: number;
  passed?: boolean;
  certificateIssued: boolean;
  certificateIssuedAt?: Date;
  certificateNumber?: string;
  certificateUrl?: string;
  notes?: string;
  sendNotifications: boolean;
  isWaitlist: boolean;
  waitlistPosition?: number;
  createdAt: Date;
  updatedAt: Date;
  course?: any;
  session?: any;
  student?: any;
}

export interface CreateEnrollmentDto {
  studentId: string;
  sessionId: string;
  enrollmentCode?: string;
  status?: EnrollmentStatus;
  paymentStatus?: PaymentStatus;
  price?: number;
  currency?: string;
  notes?: string;
  internalNotes?: string;
  sendNotifications?: boolean;
  isWaitlist?: boolean;
  amountPaid?: number;
  paymentDate?: string;
  paymentReference?: string;
}

export interface UpdateEnrollmentDto {
  enrollmentCode?: string;
  status?: EnrollmentStatus;
  paymentStatus?: PaymentStatus;
  price?: number;
  currency?: string;
  notes?: string;
  internalNotes?: string;
  sendNotifications?: boolean;
  amountPaid?: number;
  paymentDate?: string;
  paymentReference?: string;
}

export interface RecordPaymentDto {
  amount: number;
  reference?: string;
}

export interface IssueCertificateDto {
  certificateNumber: string;
  certificateUrl?: string;
}

export interface UpdateGradeDto {
  finalGrade: number;
  passed: boolean;
}

export interface CancelEnrollmentDto {
  reason?: string;
}

export interface PaginatedEnrollmentsResponse {
  data: Enrollment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface QueryEnrollmentsDto {
  page?: number;
  limit?: number;
  search?: string;
  studentId?: string;
  courseId?: string;
  sessionId?: string;
  status?: EnrollmentStatus;
  paymentStatus?: PaymentStatus;
  attendanceStatus?: AttendanceStatus;
  passed?: boolean;
  certificateIssued?: boolean;
  isWaitlist?: boolean;
  enrolledAfter?: string;
  enrolledBefore?: string;
  sessionStartAfter?: string;
  sessionStartBefore?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

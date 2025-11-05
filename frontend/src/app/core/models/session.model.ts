export enum SessionStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum SessionType {
  ONLINE = 'online',
  ONSITE = 'onsite',
  HYBRID = 'hybrid'
}

export interface CourseSession {
  id: string;
  courseId: string;
  sessionCode: string;
  sessionName: string;
  description?: string;
  status: SessionStatus;
  sessionType: SessionType;
  startDate: Date;
  endDate: Date;
  registrationDeadline?: Date;
  location?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  onlineMeetingUrl?: string;
  onlineMeetingId?: string;
  onlineMeetingPassword?: string;
  instructorName?: string;
  instructorEmail?: string;
  instructorPhone?: string;
  maxParticipants?: number;
  minParticipants?: number;
  currentParticipants: number;
  price?: number;
  currency?: string;
  notes?: string;
  isActive: boolean;
  isRegistrationOpen: boolean;
  sendReminders: boolean;
  reminderDaysBefore?: number;
  createdAt: Date;
  updatedAt: Date;
  course?: any; // Will be populated if included
}

export interface CreateSessionDto {
  courseId: string;
  sessionCode: string;
  sessionName: string;
  description?: string;
  status?: SessionStatus;
  sessionType: SessionType;
  startDate: Date | string;
  endDate: Date | string;
  registrationDeadline?: Date | string;
  location?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  onlineMeetingUrl?: string;
  onlineMeetingId?: string;
  onlineMeetingPassword?: string;
  instructorName?: string;
  instructorEmail?: string;
  instructorPhone?: string;
  maxParticipants?: number;
  minParticipants?: number;
  price?: number;
  currency?: string;
  notes?: string;
  isActive?: boolean;
  isRegistrationOpen?: boolean;
  sendReminders?: boolean;
  reminderDaysBefore?: number;
}

export interface UpdateSessionDto extends Partial<CreateSessionDto> {}

export interface PaginatedSessionsResponse {
  data: CourseSession[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface QuerySessionsDto {
  page?: number;
  limit?: number;
  search?: string;
  courseId?: string;
  status?: SessionStatus;
  sessionType?: SessionType;
  startDateFrom?: string;
  startDateTo?: string;
  isActive?: boolean;
  isUpcoming?: boolean;
  isPast?: boolean;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export enum CourseStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived'
}

export enum CourseLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  ALL_LEVELS = 'all_levels'
}

export interface Course {
  id: string;
  code: string;
  title: string;
  description?: string;
  shortDescription?: string;
  status: CourseStatus;
  level: CourseLevel;
  category?: string;
  tags?: string[];
  price?: number;
  currency?: string;
  durationHours?: number;
  durationDays?: number;
  maxParticipants?: number;
  minParticipants?: number;
  imageUrl?: string;
  thumbnailUrl?: string;
  syllabus?: string;
  prerequisites?: string;
  learningObjectives?: string[];
  isActive: boolean;
  isFeatured: boolean;
  certificationProvided: boolean;
  certificateTemplate?: string;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCourseDto {
  code: string;
  title: string;
  description?: string;
  shortDescription?: string;
  status?: CourseStatus;
  level?: CourseLevel;
  category?: string;
  tags?: string[];
  price?: number;
  currency?: string;
  durationHours?: number;
  durationDays?: number;
  maxParticipants?: number;
  minParticipants?: number;
  imageUrl?: string;
  syllabus?: string;
  prerequisites?: string;
  learningObjectives?: string[];
  isActive?: boolean;
  isFeatured?: boolean;
  certificationProvided?: boolean;
  certificateTemplate?: string;
}

export interface UpdateCourseDto extends Partial<CreateCourseDto> {}

export interface PaginatedCoursesResponse {
  data: Course[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface QueryCoursesDto {
  page?: number;
  limit?: number;
  search?: string;
  status?: CourseStatus;
  level?: CourseLevel;
  category?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

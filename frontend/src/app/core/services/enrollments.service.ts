import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Enrollment,
  CreateEnrollmentDto,
  UpdateEnrollmentDto,
  PaginatedEnrollmentsResponse,
  QueryEnrollmentsDto,
  RecordPaymentDto,
  IssueCertificateDto,
  UpdateGradeDto,
  CancelEnrollmentDto
} from '../models/enrollment.model';

@Injectable({
  providedIn: 'root'
})
export class EnrollmentsService {
  private readonly API_URL = 'http://localhost:3000/api/v1/enrollments';
  private http = inject(HttpClient);

  getEnrollments(query?: QueryEnrollmentsDto): Observable<PaginatedEnrollmentsResponse> {
    let params = new HttpParams();

    if (query) {
      Object.keys(query).forEach(key => {
        const value = (query as any)[key];
        if (value !== undefined && value !== null) {
          params = params.append(key, value.toString());
        }
      });
    }

    return this.http.get<PaginatedEnrollmentsResponse>(this.API_URL, { params });
  }

  getEnrollment(id: string): Observable<Enrollment> {
    return this.http.get<Enrollment>(`${this.API_URL}/${id}`);
  }

  createEnrollment(data: CreateEnrollmentDto): Observable<Enrollment> {
    return this.http.post<Enrollment>(this.API_URL, data);
  }

  updateEnrollment(id: string, data: UpdateEnrollmentDto): Observable<Enrollment> {
    return this.http.patch<Enrollment>(`${this.API_URL}/${id}`, data);
  }

  deleteEnrollment(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  confirmEnrollment(id: string): Observable<Enrollment> {
    return this.http.post<Enrollment>(`${this.API_URL}/${id}/confirm`, {});
  }

  cancelEnrollment(id: string, data: CancelEnrollmentDto): Observable<Enrollment> {
    return this.http.post<Enrollment>(`${this.API_URL}/${id}/cancel`, data);
  }

  completeEnrollment(id: string): Observable<Enrollment> {
    return this.http.post<Enrollment>(`${this.API_URL}/${id}/complete`, {});
  }

  recordPayment(id: string, data: RecordPaymentDto): Observable<Enrollment> {
    return this.http.post<Enrollment>(`${this.API_URL}/${id}/payment`, data);
  }

  issueCertificate(id: string, data: IssueCertificateDto): Observable<Enrollment> {
    return this.http.post<Enrollment>(`${this.API_URL}/${id}/certificate`, data);
  }

  updateGrade(id: string, data: UpdateGradeDto): Observable<Enrollment> {
    return this.http.patch<Enrollment>(`${this.API_URL}/${id}/grade`, data);
  }
}

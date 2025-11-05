import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  CourseSession,
  CreateSessionDto,
  UpdateSessionDto,
  PaginatedSessionsResponse,
  QuerySessionsDto
} from '../models/session.model';

@Injectable({
  providedIn: 'root'
})
export class SessionsService {
  private readonly API_URL = 'http://localhost:3000/api/v1/course-sessions';
  private http = inject(HttpClient);

  getSessions(query?: QuerySessionsDto): Observable<PaginatedSessionsResponse> {
    let params = new HttpParams();

    if (query) {
      Object.keys(query).forEach(key => {
        const value = (query as any)[key];
        if (value !== undefined && value !== null) {
          params = params.append(key, value.toString());
        }
      });
    }

    return this.http.get<PaginatedSessionsResponse>(this.API_URL, { params });
  }

  getSession(id: string): Observable<CourseSession> {
    return this.http.get<CourseSession>(`${this.API_URL}/${id}`);
  }

  createSession(data: CreateSessionDto): Observable<CourseSession> {
    return this.http.post<CourseSession>(this.API_URL, data);
  }

  updateSession(id: string, data: UpdateSessionDto): Observable<CourseSession> {
    return this.http.patch<CourseSession>(`${this.API_URL}/${id}`, data);
  }

  deleteSession(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  startSession(id: string): Observable<CourseSession> {
    return this.http.post<CourseSession>(`${this.API_URL}/${id}/start`, {});
  }

  completeSession(id: string): Observable<CourseSession> {
    return this.http.post<CourseSession>(`${this.API_URL}/${id}/complete`, {});
  }

  cancelSession(id: string, reason?: string): Observable<CourseSession> {
    return this.http.post<CourseSession>(`${this.API_URL}/${id}/cancel`, { reason });
  }
}

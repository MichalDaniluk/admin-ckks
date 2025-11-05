import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Course,
  CreateCourseDto,
  UpdateCourseDto,
  PaginatedCoursesResponse,
  QueryCoursesDto
} from '../models/course.model';

@Injectable({
  providedIn: 'root'
})
export class CoursesService {
  private readonly API_URL = 'http://localhost:3000/api/v1/courses';
  private http = inject(HttpClient);

  getCourses(query?: QueryCoursesDto): Observable<PaginatedCoursesResponse> {
    let params = new HttpParams();

    if (query) {
      Object.keys(query).forEach(key => {
        const value = (query as any)[key];
        if (value !== undefined && value !== null) {
          params = params.append(key, value.toString());
        }
      });
    }

    return this.http.get<PaginatedCoursesResponse>(this.API_URL, { params });
  }

  getCourse(id: string): Observable<Course> {
    return this.http.get<Course>(`${this.API_URL}/${id}`);
  }

  createCourse(data: CreateCourseDto): Observable<Course> {
    return this.http.post<Course>(this.API_URL, data);
  }

  updateCourse(id: string, data: UpdateCourseDto): Observable<Course> {
    return this.http.patch<Course>(`${this.API_URL}/${id}`, data);
  }

  deleteCourse(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  publishCourse(id: string): Observable<Course> {
    return this.http.post<Course>(`${this.API_URL}/${id}/publish`, {});
  }

  archiveCourse(id: string): Observable<Course> {
    return this.http.post<Course>(`${this.API_URL}/${id}/archive`, {});
  }

  duplicateCourse(id: string): Observable<Course> {
    return this.http.post<Course>(`${this.API_URL}/${id}/duplicate`, {});
  }
}

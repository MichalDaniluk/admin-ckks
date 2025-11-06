import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  BlogPost,
  CreateBlogPostDto,
  UpdateBlogPostDto,
  QueryBlogPostsDto,
  PaginatedBlogPostsResponse
} from '../models/blog.model';

@Injectable({
  providedIn: 'root'
})
export class BlogService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/blog-posts`;

  getBlogPosts(query: QueryBlogPostsDto): Observable<PaginatedBlogPostsResponse> {
    let params = new HttpParams();

    if (query.page) params = params.set('page', query.page.toString());
    if (query.limit) params = params.set('limit', query.limit.toString());
    if (query.search) params = params.set('search', query.search);
    if (query.status) params = params.set('status', query.status);
    if (query.isActive !== undefined) params = params.set('isActive', query.isActive.toString());
    if (query.sortBy) params = params.set('sortBy', query.sortBy);
    if (query.sortOrder) params = params.set('sortOrder', query.sortOrder);

    return this.http.get<PaginatedBlogPostsResponse>(this.apiUrl, { params });
  }

  getBlogPost(id: string): Observable<BlogPost> {
    return this.http.get<BlogPost>(`${this.apiUrl}/${id}`);
  }

  createBlogPost(data: CreateBlogPostDto): Observable<BlogPost> {
    return this.http.post<BlogPost>(this.apiUrl, data);
  }

  updateBlogPost(id: string, data: UpdateBlogPostDto): Observable<BlogPost> {
    return this.http.patch<BlogPost>(`${this.apiUrl}/${id}`, data);
  }

  deleteBlogPost(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  publishBlogPost(id: string): Observable<BlogPost> {
    return this.http.post<BlogPost>(`${this.apiUrl}/${id}/publish`, {});
  }

  archiveBlogPost(id: string): Observable<BlogPost> {
    return this.http.post<BlogPost>(`${this.apiUrl}/${id}/archive`, {});
  }
}

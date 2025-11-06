import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { BlogService } from '../../../../core/services/blog.service';
import { BlogPost } from '../../../../core/models/blog.model';

@Component({
  selector: 'app-blog-view',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-100">
      <div class="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        @if (isLoading) {
          <div class="bg-white shadow rounded-lg p-12 text-center">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <p class="mt-2 text-gray-600">Ładowanie...</p>
          </div>
        } @else if (blogPost) {
          <div class="bg-white shadow rounded-lg overflow-hidden">
            <!-- Header -->
            <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h1 class="text-2xl font-bold text-gray-900">Podgląd artykułu</h1>
              <button
                (click)="goBack()"
                class="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                ← Powrót
              </button>
            </div>

            <!-- Status Badge -->
            <div class="px-6 py-3 bg-gray-50 border-b border-gray-200">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4">
                  <span [class]="getStatusBadgeClass(blogPost.status)">
                    {{ getStatusLabel(blogPost.status) }}
                  </span>
                  @if (!blogPost.isActive) {
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Nieaktywny
                    </span>
                  }
                </div>
                <div class="text-sm text-gray-500">
                  Wyświetlenia: {{ blogPost.viewCount }}
                </div>
              </div>
            </div>

            <!-- Article Content -->
            <article class="px-6 py-8">
              <!-- Title -->
              <h1 class="text-4xl font-bold text-gray-900 mb-4">
                {{ blogPost.title }}
              </h1>

              <!-- Meta Info -->
              <div class="flex items-center text-sm text-gray-500 mb-6 pb-6 border-b border-gray-200">
                <div class="flex items-center space-x-6">
                  @if (blogPost.author) {
                    <span class="flex items-center">
                      <svg class="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>
                      </svg>
                      {{ blogPost.author }}
                    </span>
                  }
                  @if (blogPost.publishedAt) {
                    <span class="flex items-center">
                      <svg class="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/>
                      </svg>
                      {{ blogPost.publishedAt | date:'medium' }}
                    </span>
                  } @else {
                    <span class="flex items-center">
                      <svg class="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/>
                      </svg>
                      Utworzono: {{ blogPost.createdAt | date:'medium' }}
                    </span>
                  }
                </div>
              </div>

              <!-- Excerpt -->
              @if (blogPost.excerpt) {
                <div class="text-xl text-gray-600 italic mb-8 pb-8 border-b border-gray-200">
                  {{ blogPost.excerpt }}
                </div>
              }

              <!-- Main Content -->
              <div class="prose prose-lg max-w-none">
                <div [innerHTML]="sanitizedContent"></div>
              </div>

              <!-- Tags -->
              @if (blogPost.tags && blogPost.tags.length > 0) {
                <div class="mt-8 pt-8 border-t border-gray-200">
                  <h3 class="text-sm font-medium text-gray-900 mb-3">Tagi:</h3>
                  <div class="flex flex-wrap gap-2">
                    @for (tag of blogPost.tags; track tag) {
                      <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                        {{ tag }}
                      </span>
                    }
                  </div>
                </div>
              }
            </article>

            <!-- SEO Section -->
            <div class="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <h3 class="text-sm font-semibold text-gray-900 mb-3">Metadane SEO:</h3>
              <div class="space-y-3">
                <div>
                  <label class="block text-xs font-medium text-gray-500 mb-1">URL (slug):</label>
                  <p class="text-sm text-gray-900 font-mono">{{ blogPost.slug }}</p>
                </div>
                @if (blogPost.metaTitle) {
                  <div>
                    <label class="block text-xs font-medium text-gray-500 mb-1">Meta tytuł:</label>
                    <p class="text-sm text-gray-900">{{ blogPost.metaTitle }}</p>
                  </div>
                }
                @if (blogPost.metaDescription) {
                  <div>
                    <label class="block text-xs font-medium text-gray-500 mb-1">Meta opis:</label>
                    <p class="text-sm text-gray-900">{{ blogPost.metaDescription }}</p>
                  </div>
                }
              </div>
            </div>

            <!-- Footer Actions -->
            <div class="px-6 py-4 bg-white border-t border-gray-200 flex justify-between">
              <button
                (click)="goBack()"
                class="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Powrót do listy
              </button>
              <div class="space-x-3">
                @if (blogPost.status === 'draft') {
                  <button
                    (click)="publishPost()"
                    class="px-4 py-2 text-sm text-white bg-green-600 rounded-md hover:bg-green-700"
                  >
                    Publikuj
                  </button>
                }
                <button
                  (click)="editPost()"
                  class="px-4 py-2 text-sm text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                >
                  Edytuj
                </button>
              </div>
            </div>
          </div>
        } @else {
          <div class="bg-white shadow rounded-lg p-12 text-center">
            <p class="text-gray-500">Artykuł nie został znaleziony</p>
            <button
              (click)="goBack()"
              class="mt-4 px-4 py-2 text-sm text-indigo-600 hover:text-indigo-800"
            >
              Powrót do listy
            </button>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    :host ::ng-deep .prose {
      @apply text-gray-900;
    }
    :host ::ng-deep .prose h2 {
      @apply text-2xl font-bold mt-8 mb-4 text-gray-900;
    }
    :host ::ng-deep .prose h3 {
      @apply text-xl font-bold mt-6 mb-3 text-gray-900;
    }
    :host ::ng-deep .prose p {
      @apply mb-4 leading-relaxed;
    }
    :host ::ng-deep .prose ul {
      @apply list-disc pl-6 mb-4 space-y-2;
    }
    :host ::ng-deep .prose ol {
      @apply list-decimal pl-6 mb-4 space-y-2;
    }
    :host ::ng-deep .prose li {
      @apply mb-2;
    }
    :host ::ng-deep .prose strong {
      @apply font-semibold text-gray-900;
    }
    :host ::ng-deep .prose a {
      @apply text-indigo-600 hover:text-indigo-800 underline;
    }
  `]
})
export class BlogViewComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private blogService = inject(BlogService);
  private sanitizer = inject(DomSanitizer);

  blogPost: BlogPost | null = null;
  isLoading = false;
  sanitizedContent: SafeHtml = '';

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadBlogPost(id);
    }
  }

  loadBlogPost(id: string): void {
    this.isLoading = true;
    this.blogService.getBlogPost(id).subscribe({
      next: (post) => {
        this.blogPost = post;
        this.sanitizedContent = this.sanitizer.bypassSecurityTrustHtml(post.content);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading blog post', err);
        this.isLoading = false;
      }
    });
  }

  publishPost(): void {
    if (this.blogPost && confirm(`Czy na pewno chcesz opublikować artykuł "${this.blogPost.title}"?`)) {
      this.blogService.publishBlogPost(this.blogPost.id).subscribe({
        next: (updatedPost) => {
          this.blogPost = updatedPost;
          this.sanitizedContent = this.sanitizer.bypassSecurityTrustHtml(updatedPost.content);
        },
        error: (err) => {
          console.error('Error publishing post', err);
          alert('Wystąpił błąd podczas publikowania artykułu');
        }
      });
    }
  }

  editPost(): void {
    if (this.blogPost) {
      this.router.navigate(['/marketing/blog'], {
        queryParams: { edit: this.blogPost.id }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/marketing/blog']);
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      draft: 'Szkic',
      published: 'Opublikowany',
      archived: 'Zarchiwizowany'
    };
    return labels[status] || status;
  }

  getStatusBadgeClass(status: string): string {
    const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
    const statusClasses: Record<string, string> = {
      draft: 'bg-yellow-100 text-yellow-800',
      published: 'bg-green-100 text-green-800',
      archived: 'bg-gray-100 text-gray-800'
    };
    return `${baseClasses} ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`;
  }
}

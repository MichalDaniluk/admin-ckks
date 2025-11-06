import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BlogService } from '../../../../core/services/blog.service';
import { BlogFormModalComponent } from '../form/blog-form-modal.component';
import { BlogPost, QueryBlogPostsDto, BlogPostStatus } from '../../../../core/models/blog.model';

@Component({
  selector: 'app-blog-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, BlogFormModalComponent],
  template: `
    <div class="min-h-screen bg-gray-100">
      <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div class="px-4 py-6 sm:px-0">
          <!-- Header -->
          <div class="mb-6 flex justify-between items-center">
            <h2 class="text-2xl font-bold text-gray-900">Artykuły bloga</h2>
            <button
              (click)="openAddModal()"
              class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              + Dodaj artykuł
            </button>
          </div>

          <!-- Filters -->
          <div class="bg-white shadow rounded-lg p-4 mb-6">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Szukaj</label>
                <input
                  type="text"
                  [(ngModel)]="searchTerm"
                  (keyup.enter)="applyFilters()"
                  placeholder="Tytuł lub treść..."
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  [(ngModel)]="filterStatus"
                  (change)="applyFilters()"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Wszystkie</option>
                  <option value="draft">Szkic</option>
                  <option value="published">Opublikowane</option>
                  <option value="archived">Zarchiwizowane</option>
                </select>
              </div>
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
            } @else if (blogPosts.length === 0) {
              <div class="p-12 text-center">
                <p class="text-gray-500">Brak artykułów do wyświetlenia</p>
              </div>
            } @else {
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tytuł</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Autor</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Wyświetlenia</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data utworzenia</th>
                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Akcje</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  @for (post of blogPosts; track post.id) {
                    <tr class="hover:bg-gray-50">
                      <td class="px-6 py-4">
                        <div class="text-sm font-medium text-gray-900">{{ post.title }}</div>
                        <div class="text-xs text-gray-500">{{ post.slug }}</div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {{ post.author || '-' }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <span [class]="getStatusBadgeClass(post.status)">
                          {{ getStatusLabel(post.status) }}
                        </span>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {{ post.viewCount }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {{ post.createdAt | date:'short' }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <a
                          [routerLink]="['/marketing/blog', post.id]"
                          class="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          Podgląd
                        </a>
                        <button
                          (click)="openEditModal(post)"
                          class="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          Edytuj
                        </button>
                        <button
                          *ngIf="post.status === 'draft'"
                          (click)="publishPost(post)"
                          class="text-green-600 hover:text-green-900 mr-3"
                        >
                          Publikuj
                        </button>
                        <button
                          (click)="deletePost(post)"
                          class="text-red-600 hover:text-red-900"
                        >
                          Usuń
                        </button>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>

              <!-- Pagination -->
              <div class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div class="flex-1 flex justify-between sm:hidden">
                  <button
                    (click)="previousPage()"
                    [disabled]="currentPage === 1"
                    class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Poprzednia
                  </button>
                  <button
                    (click)="nextPage()"
                    [disabled]="currentPage >= totalPages"
                    class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Następna
                  </button>
                </div>
                <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p class="text-sm text-gray-700">
                      Pokazuję <span class="font-medium">{{ (currentPage - 1) * pageSize + 1 }}</span>
                      do <span class="font-medium">{{ Math.min(currentPage * pageSize, totalItems) }}</span>
                      z <span class="font-medium">{{ totalItems }}</span> wyników
                    </p>
                  </div>
                  <div>
                    <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        (click)="previousPage()"
                        [disabled]="currentPage === 1"
                        class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        ‹
                      </button>
                      @for (page of getPageNumbers(); track page) {
                        <button
                          (click)="goToPage(page)"
                          [class.bg-indigo-50]="page === currentPage"
                          [class.text-indigo-600]="page === currentPage"
                          class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                          {{ page }}
                        </button>
                      }
                      <button
                        (click)="nextPage()"
                        [disabled]="currentPage >= totalPages"
                        class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
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
    <app-blog-form-modal
      [isOpen]="showModal"
      [blogPost]="selectedBlogPost"
      (closeModal)="closeModal()"
      (blogPostSaved)="handleSave($event)"
    />
  `
})
export class BlogListComponent implements OnInit {
  private blogService = inject(BlogService);

  blogPosts: BlogPost[] = [];
  isLoading = false;

  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  totalPages = 0;
  Math = Math;

  searchTerm = '';
  filterStatus: BlogPostStatus | '' = '';

  showModal = false;
  selectedBlogPost: BlogPost | null = null;

  ngOnInit(): void {
    this.loadBlogPosts();
  }

  loadBlogPosts(): void {
    this.isLoading = true;

    const query: QueryBlogPostsDto = {
      page: this.currentPage,
      limit: this.pageSize,
      search: this.searchTerm || undefined,
      status: this.filterStatus || undefined,
      sortBy: 'createdAt',
      sortOrder: 'DESC'
    };

    this.blogService.getBlogPosts(query).subscribe({
      next: (response) => {
        this.blogPosts = response.data;
        this.totalItems = response.total;
        this.totalPages = response.totalPages;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading blog posts', err);
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.loadBlogPosts();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.filterStatus = '';
    this.applyFilters();
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadBlogPosts();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadBlogPosts();
    }
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.loadBlogPosts();
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

  openAddModal(): void {
    this.selectedBlogPost = null;
    this.showModal = true;
  }

  openEditModal(post: BlogPost): void {
    this.selectedBlogPost = post;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedBlogPost = null;
  }

  handleSave(post: BlogPost): void {
    this.loadBlogPosts();
  }

  publishPost(post: BlogPost): void {
    if (confirm(`Czy na pewno chcesz opublikować artykuł "${post.title}"?`)) {
      this.blogService.publishBlogPost(post.id).subscribe({
        next: () => {
          this.loadBlogPosts();
        },
        error: (err) => {
          console.error('Error publishing post', err);
          alert('Wystąpił błąd podczas publikowania artykułu');
        }
      });
    }
  }

  deletePost(post: BlogPost): void {
    if (confirm(`Czy na pewno chcesz usunąć artykuł "${post.title}"?`)) {
      this.blogService.deleteBlogPost(post.id).subscribe({
        next: () => {
          this.loadBlogPosts();
        },
        error: (err) => {
          console.error('Error deleting post', err);
          alert('Wystąpił błąd podczas usuwania artykułu');
        }
      });
    }
  }

  getStatusLabel(status: BlogPostStatus): string {
    const labels: Record<BlogPostStatus, string> = {
      draft: 'Szkic',
      published: 'Opublikowany',
      archived: 'Zarchiwizowany'
    };
    return labels[status];
  }

  getStatusBadgeClass(status: BlogPostStatus): string {
    const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
    const statusClasses: Record<BlogPostStatus, string> = {
      draft: 'bg-yellow-100 text-yellow-800',
      published: 'bg-green-100 text-green-800',
      archived: 'bg-gray-100 text-gray-800'
    };
    return `${baseClasses} ${statusClasses[status]}`;
  }
}

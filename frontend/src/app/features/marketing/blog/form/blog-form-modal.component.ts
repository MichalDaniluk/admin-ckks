import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BlogService } from '../../../../core/services/blog.service';
import { BlogPost, CreateBlogPostDto, UpdateBlogPostDto, BlogPostStatus } from '../../../../core/models/blog.model';

@Component({
  selector: 'app-blog-form-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div *ngIf="isOpen" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-medium text-gray-900">
            {{ blogPost ? 'Edytuj artykuł' : 'Dodaj nowy artykuł' }}
          </h3>
          <button (click)="close()" class="text-gray-400 hover:text-gray-500">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form (ngSubmit)="onSubmit()">
          <div class="grid grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto pr-2">
            <!-- Title -->
            <div class="col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Tytuł <span class="text-red-500">*</span>
              </label>
              <input
                type="text"
                [(ngModel)]="formData.title"
                name="title"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Wprowadź tytuł artykułu"
              />
            </div>

            <!-- Slug -->
            <div class="col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Slug (URL)
              </label>
              <input
                type="text"
                [(ngModel)]="formData.slug"
                name="slug"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="slug-url (zostanie wygenerowany automatycznie)"
              />
              <p class="text-xs text-gray-500 mt-1">Pozostaw puste, aby slug został wygenerowany automatycznie z tytułu</p>
            </div>

            <!-- Excerpt -->
            <div class="col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Streszczenie
              </label>
              <textarea
                [(ngModel)]="formData.excerpt"
                name="excerpt"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Krótkie streszczenie artykułu"
              ></textarea>
            </div>

            <!-- Content -->
            <div class="col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Treść <span class="text-red-500">*</span>
              </label>
              <textarea
                [(ngModel)]="formData.content"
                name="content"
                required
                rows="8"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Treść artykułu (HTML lub Markdown)"
              ></textarea>
            </div>

            <!-- Featured Image URL -->
            <div class="col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">
                URL obrazka głównego
              </label>
              <input
                type="url"
                [(ngModel)]="formData.featuredImage"
                name="featuredImage"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <!-- Author -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Autor
              </label>
              <input
                type="text"
                [(ngModel)]="formData.author"
                name="author"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Imię i nazwisko autora"
              />
            </div>

            <!-- Status -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                [(ngModel)]="formData.status"
                name="status"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="draft">Szkic</option>
                <option value="published">Opublikowany</option>
                <option value="archived">Zarchiwizowany</option>
              </select>
            </div>

            <!-- Published Date -->
            <div *ngIf="formData.status === 'published'">
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Data publikacji
              </label>
              <input
                type="datetime-local"
                [(ngModel)]="formData.publishedAt"
                name="publishedAt"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <!-- Tags -->
            <div class="col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Tagi
              </label>
              <input
                type="text"
                [(ngModel)]="tagsInput"
                name="tags"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="tag1, tag2, tag3"
              />
              <p class="text-xs text-gray-500 mt-1">Oddzielaj tagi przecinkami</p>
            </div>

            <!-- SEO Section -->
            <div class="col-span-2 border-t pt-4">
              <h4 class="text-sm font-medium text-gray-900 mb-3">SEO</h4>

              <!-- Meta Title -->
              <div class="mb-3">
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Meta Title
                </label>
                <input
                  type="text"
                  [(ngModel)]="formData.metaTitle"
                  name="metaTitle"
                  maxlength="60"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Tytuł dla wyszukiwarek (max 60 znaków)"
                />
              </div>

              <!-- Meta Description -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Meta Description
                </label>
                <textarea
                  [(ngModel)]="formData.metaDescription"
                  name="metaDescription"
                  maxlength="160"
                  rows="2"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Opis dla wyszukiwarek (max 160 znaków)"
                ></textarea>
              </div>
            </div>

            <!-- Is Active -->
            <div class="col-span-2">
              <label class="flex items-center">
                <input
                  type="checkbox"
                  [(ngModel)]="formData.isActive"
                  name="isActive"
                  class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span class="ml-2 text-sm text-gray-700">Artykuł aktywny</span>
              </label>
            </div>
          </div>

          <!-- Error Message -->
          <div *ngIf="errorMessage" class="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {{ errorMessage }}
          </div>

          <!-- Buttons -->
          <div class="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              (click)="close()"
              class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Anuluj
            </button>
            <button
              type="submit"
              [disabled]="isSubmitting"
              class="px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {{ isSubmitting ? 'Zapisywanie...' : 'Zapisz' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class BlogFormModalComponent implements OnInit, OnChanges {
  private blogService = inject(BlogService);

  @Input() isOpen = false;
  @Input() blogPost: BlogPost | null = null;
  @Output() closeModal = new EventEmitter<void>();
  @Output() blogPostSaved = new EventEmitter<BlogPost>();

  formData: any = {
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featuredImage: '',
    author: '',
    status: 'draft',
    publishedAt: '',
    metaTitle: '',
    metaDescription: '',
    isActive: true
  };

  tagsInput = '';
  isSubmitting = false;
  errorMessage = '';

  ngOnInit(): void {
    this.initializeForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['blogPost'] || changes['isOpen']) {
      this.initializeForm();
    }
  }

  initializeForm(): void {
    if (this.blogPost) {
      this.formData = {
        title: this.blogPost.title || '',
        slug: this.blogPost.slug || '',
        excerpt: this.blogPost.excerpt || '',
        content: this.blogPost.content || '',
        featuredImage: this.blogPost.featuredImage || '',
        author: this.blogPost.author || '',
        status: this.blogPost.status || 'draft',
        publishedAt: this.blogPost.publishedAt ? new Date(this.blogPost.publishedAt).toISOString().slice(0, 16) : '',
        metaTitle: this.blogPost.metaTitle || '',
        metaDescription: this.blogPost.metaDescription || '',
        isActive: this.blogPost.isActive
      };
      this.tagsInput = this.blogPost.tags?.join(', ') || '';
    } else {
      this.formData = {
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        featuredImage: '',
        author: '',
        status: 'draft',
        publishedAt: '',
        metaTitle: '',
        metaDescription: '',
        isActive: true
      };
      this.tagsInput = '';
    }
    this.errorMessage = '';
  }

  onSubmit(): void {
    this.isSubmitting = true;
    this.errorMessage = '';

    // Parse tags from input
    const tags = this.tagsInput
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    const data: CreateBlogPostDto | UpdateBlogPostDto = {
      ...this.formData,
      tags: tags.length > 0 ? tags : undefined,
      publishedAt: this.formData.publishedAt || undefined
    };

    const request = this.blogPost
      ? this.blogService.updateBlogPost(this.blogPost.id, data as UpdateBlogPostDto)
      : this.blogService.createBlogPost(data as CreateBlogPostDto);

    request.subscribe({
      next: (result) => {
        this.isSubmitting = false;
        this.blogPostSaved.emit(result);
        this.close();
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err.error?.message || 'Wystąpił błąd podczas zapisywania artykułu';
      }
    });
  }

  close(): void {
    this.initializeForm();
    this.closeModal.emit();
  }
}

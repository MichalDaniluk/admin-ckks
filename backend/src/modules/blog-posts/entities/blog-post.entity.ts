import { Entity, Column, ManyToOne, JoinColumn, BeforeInsert, BeforeUpdate } from 'typeorm';
import { TenantBaseEntity } from '@/database/entities/base.entity';
import { Tenant } from '@/modules/tenant/entities/tenant.entity';

export enum BlogPostStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

@Entity('blog_post')
export class BlogPost extends TenantBaseEntity {
  @Column({ name: 'title', type: 'varchar', length: 255 })
  title: string;

  @Column({ name: 'slug', type: 'varchar', length: 255, unique: true })
  slug: string;

  @Column({ name: 'excerpt', type: 'text', nullable: true })
  excerpt: string;

  @Column({ name: 'content', type: 'text' })
  content: string;

  @Column({ name: 'featured_image', type: 'varchar', length: 500, nullable: true })
  featuredImage: string;

  @Column({ name: 'author', type: 'varchar', length: 255, nullable: true })
  author: string;

  @Column({
    name: 'status',
    type: 'enum',
    enum: BlogPostStatus,
    default: BlogPostStatus.DRAFT,
  })
  status: BlogPostStatus;

  @Column({ name: 'published_at', type: 'timestamp', nullable: true })
  publishedAt: Date;

  @Column({ name: 'tags', type: 'simple-array', nullable: true })
  tags: string[];

  @Column({ name: 'meta_title', type: 'varchar', length: 255, nullable: true })
  metaTitle: string;

  @Column({ name: 'meta_description', type: 'varchar', length: 500, nullable: true })
  metaDescription: string;

  @Column({ name: 'view_count', type: 'int', default: 0 })
  viewCount: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  // Relationships
  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  // Hooks to generate slug from title if not provided
  @BeforeInsert()
  @BeforeUpdate()
  generateSlug() {
    if (!this.slug && this.title) {
      // Map Polish characters to ASCII equivalents
      const polishMap: { [key: string]: string } = {
        'ą': 'a', 'ć': 'c', 'ę': 'e', 'ł': 'l', 'ń': 'n',
        'ó': 'o', 'ś': 's', 'ź': 'z', 'ż': 'z',
        'Ą': 'A', 'Ć': 'C', 'Ę': 'E', 'Ł': 'L', 'Ń': 'N',
        'Ó': 'O', 'Ś': 'S', 'Ź': 'Z', 'Ż': 'Z'
      };

      // Replace Polish characters
      let normalized = this.title;
      Object.keys(polishMap).forEach(key => {
        normalized = normalized.replace(new RegExp(key, 'g'), polishMap[key]);
      });

      // Generate slug
      this.slug = normalized
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }
  }

  // Helper methods
  isPublished(): boolean {
    return this.status === BlogPostStatus.PUBLISHED && this.isActive;
  }

  incrementViewCount(): void {
    this.viewCount += 1;
  }
}

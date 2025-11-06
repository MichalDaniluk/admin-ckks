import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsArray,
  MaxLength,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BlogPostStatus } from '../entities/blog-post.entity';

export class CreateBlogPostDto {
  @ApiProperty({
    example: 'Jak skutecznie zarządzać kursami online',
    description: 'Blog post title',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional({
    example: 'jak-skutecznie-zarzadzac-kursami-online',
    description: 'URL slug (auto-generated from title if not provided)',
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  slug?: string;

  @ApiPropertyOptional({
    example: 'Poznaj najlepsze praktyki zarządzania kursami online...',
    description: 'Short excerpt or summary',
  })
  @IsString()
  @IsOptional()
  excerpt?: string;

  @ApiProperty({
    example: '<p>Full content of the blog post...</p>',
    description: 'Full blog post content (HTML or Markdown)',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({
    example: 'https://example.com/images/featured.jpg',
    description: 'Featured image URL',
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  featuredImage?: string;

  @ApiPropertyOptional({
    example: 'Jan Kowalski',
    description: 'Author name',
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  author?: string;

  @ApiPropertyOptional({
    enum: BlogPostStatus,
    example: BlogPostStatus.DRAFT,
    description: 'Post status',
    default: BlogPostStatus.DRAFT,
  })
  @IsEnum(BlogPostStatus)
  @IsOptional()
  status?: BlogPostStatus;

  @ApiPropertyOptional({
    example: '2025-01-15T10:00:00Z',
    description: 'Publication date (ISO 8601)',
  })
  @IsDateString()
  @IsOptional()
  publishedAt?: string;

  @ApiPropertyOptional({
    example: ['zarządzanie', 'kursy online', 'edukacja'],
    description: 'Post tags',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({
    example: 'Jak skutecznie zarządzać kursami online - Poradnik',
    description: 'SEO meta title',
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  metaTitle?: string;

  @ApiPropertyOptional({
    example: 'Kompleksowy przewodnik po zarządzaniu kursami online. Poznaj najlepsze praktyki...',
    description: 'SEO meta description',
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  metaDescription?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether post is active',
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

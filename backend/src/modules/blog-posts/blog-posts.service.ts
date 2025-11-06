import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { BlogPost, BlogPostStatus } from './entities/blog-post.entity';
import { CreateBlogPostDto } from './dto/create-blog-post.dto';
import { UpdateBlogPostDto } from './dto/update-blog-post.dto';
import { QueryBlogPostsDto } from './dto/query-blog-posts.dto';
import { TenantContextService } from '@/common/tenant/tenant-context.service';

@Injectable()
export class BlogPostsService {
  constructor(
    @InjectRepository(BlogPost)
    private readonly blogPostRepository: Repository<BlogPost>,
    private readonly tenantContext: TenantContextService,
  ) {}

  /**
   * Create a new blog post
   */
  async create(createBlogPostDto: CreateBlogPostDto): Promise<BlogPost> {
    const tenantId = this.tenantContext.getTenantId();

    if (!tenantId) {
      throw new BadRequestException('Tenant context not found');
    }

    // Check if slug already exists for this tenant (if slug is provided)
    if (createBlogPostDto.slug) {
      const existingPost = await this.blogPostRepository.findOne({
        where: { slug: createBlogPostDto.slug, tenantId },
      });

      if (existingPost) {
        throw new ConflictException(`Blog post with slug '${createBlogPostDto.slug}' already exists`);
      }
    }

    // Create blog post with tenant ID
    const blogPost = this.blogPostRepository.create({
      ...createBlogPostDto,
      tenantId,
      publishedAt: createBlogPostDto.publishedAt ? new Date(createBlogPostDto.publishedAt) : undefined,
    });

    return this.blogPostRepository.save(blogPost);
  }

  /**
   * Find all blog posts with pagination and filtering
   */
  async findAll(queryDto: QueryBlogPostsDto): Promise<{
    data: BlogPost[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const tenantId = this.tenantContext.getTenantId();

    if (!tenantId) {
      throw new BadRequestException('Tenant context not found');
    }

    const { page, limit, search, status, isActive, sortBy, sortOrder } = queryDto;

    const skip = (page - 1) * limit;

    const queryBuilder = this.blogPostRepository
      .createQueryBuilder('blogPost')
      .where('blogPost.tenantId = :tenantId', { tenantId });

    // Apply filters
    if (search) {
      queryBuilder.andWhere(
        '(blogPost.title LIKE :search OR blogPost.excerpt LIKE :search OR blogPost.content LIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (status) {
      queryBuilder.andWhere('blogPost.status = :status', { status });
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('blogPost.isActive = :isActive', { isActive });
    }

    // Apply sorting
    const sortField = sortBy || 'createdAt';
    const order = sortOrder || 'DESC';
    queryBuilder.orderBy(`blogPost.${sortField}`, order);

    // Apply pagination
    queryBuilder.skip(skip).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Find one blog post by ID
   */
  async findOne(id: string): Promise<BlogPost> {
    const tenantId = this.tenantContext.getTenantId();

    if (!tenantId) {
      throw new BadRequestException('Tenant context not found');
    }

    const blogPost = await this.blogPostRepository.findOne({
      where: { id, tenantId },
    });

    if (!blogPost) {
      throw new NotFoundException(`Blog post with ID '${id}' not found`);
    }

    return blogPost;
  }

  /**
   * Find one blog post by slug (public endpoint)
   */
  async findBySlug(slug: string): Promise<BlogPost> {
    const tenantId = this.tenantContext.getTenantId();

    if (!tenantId) {
      throw new BadRequestException('Tenant context not found');
    }

    const blogPost = await this.blogPostRepository.findOne({
      where: { slug, tenantId },
    });

    if (!blogPost) {
      throw new NotFoundException(`Blog post with slug '${slug}' not found`);
    }

    // Increment view count
    blogPost.incrementViewCount();
    await this.blogPostRepository.save(blogPost);

    return blogPost;
  }

  /**
   * Update a blog post
   */
  async update(id: string, updateBlogPostDto: UpdateBlogPostDto): Promise<BlogPost> {
    const tenantId = this.tenantContext.getTenantId();

    if (!tenantId) {
      throw new BadRequestException('Tenant context not found');
    }

    const blogPost = await this.findOne(id);

    // Check if slug is being changed and if it already exists
    if (updateBlogPostDto.slug && updateBlogPostDto.slug !== blogPost.slug) {
      const existingPost = await this.blogPostRepository.findOne({
        where: { slug: updateBlogPostDto.slug, tenantId },
      });

      if (existingPost) {
        throw new ConflictException(`Blog post with slug '${updateBlogPostDto.slug}' already exists`);
      }
    }

    // Update blog post
    Object.assign(blogPost, {
      ...updateBlogPostDto,
      publishedAt: updateBlogPostDto.publishedAt ? new Date(updateBlogPostDto.publishedAt) : blogPost.publishedAt,
    });

    return this.blogPostRepository.save(blogPost);
  }

  /**
   * Publish a blog post
   */
  async publish(id: string): Promise<BlogPost> {
    const blogPost = await this.findOne(id);

    blogPost.status = BlogPostStatus.PUBLISHED;
    blogPost.publishedAt = new Date();

    return this.blogPostRepository.save(blogPost);
  }

  /**
   * Archive a blog post
   */
  async archive(id: string): Promise<BlogPost> {
    const blogPost = await this.findOne(id);

    blogPost.status = BlogPostStatus.ARCHIVED;

    return this.blogPostRepository.save(blogPost);
  }

  /**
   * Delete a blog post (soft delete)
   */
  async remove(id: string): Promise<void> {
    const blogPost = await this.findOne(id);
    await this.blogPostRepository.softRemove(blogPost);
  }
}

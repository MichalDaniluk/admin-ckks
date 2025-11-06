import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course, CourseStatus } from './entities/course.entity';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { QueryCoursesDto } from './dto/query-courses.dto';
import { TenantContextService } from '@/common/tenant/tenant-context.service';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    private readonly tenantContext: TenantContextService,
  ) {}

  /**
   * Create a new course
   */
  async create(createCourseDto: CreateCourseDto): Promise<Course> {
    const tenantId = this.tenantContext.getTenantId();

    if (!tenantId) {
      throw new BadRequestException('Tenant context not found');
    }

    // Check if course code already exists for this tenant
    const existingCourse = await this.courseRepository.findOne({
      where: { code: createCourseDto.code, tenantId },
    });

    if (existingCourse) {
      throw new ConflictException(`Course with code '${createCourseDto.code}' already exists`);
    }

    // Create course with tenant ID
    const course = this.courseRepository.create({
      ...createCourseDto,
      tenantId,
    });

    return this.courseRepository.save(course);
  }

  /**
   * Find all courses with pagination and filtering
   */
  async findAll(queryDto: QueryCoursesDto): Promise<{
    data: Course[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const isSuperAdmin = this.tenantContext.hasRole('SUPER_ADMIN');
    const contextTenantId = this.tenantContext.getTenantId();
    const userRoles = this.tenantContext.getUserRoles();

    // DEBUG LOGGING
    console.log('=== COURSES FINDALL DEBUG ===');
    console.log('isSuperAdmin:', isSuperAdmin);
    console.log('contextTenantId:', contextTenantId);
    console.log('userRoles:', userRoles);
    console.log('queryDto.tenantId:', queryDto.tenantId);

    // For non-super admins, require tenant context
    if (!isSuperAdmin && !contextTenantId) {
      throw new BadRequestException('Tenant context not found');
    }

    const { page, limit, search, status, level, category, isActive, isFeatured, tenantId, sortBy, sortOrder } =
      queryDto;

    const skip = (page - 1) * limit;

    const queryBuilder = this.courseRepository
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.tenant', 'tenant');

    // Apply tenant filter
    if (isSuperAdmin) {
      console.log('DEBUG: Super admin path - applying conditional tenant filter');
      // Super admin can see all courses or filter by specific tenant
      if (tenantId) {
        console.log('DEBUG: Filtering by specific tenant:', tenantId);
        queryBuilder.where('course.tenantId = :tenantId', { tenantId });
      } else {
        console.log('DEBUG: No tenant filter - should see ALL courses');
      }
    } else {
      console.log('DEBUG: Regular user path - filtering by tenant:', contextTenantId);
      // Regular users only see their own tenant's courses
      queryBuilder.where('course.tenantId = :tenantId', { tenantId: contextTenantId });
    }

    // Apply filters
    if (search) {
      queryBuilder.andWhere(
        '(course.title ILIKE :search OR course.description ILIKE :search OR course.code ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (status) {
      queryBuilder.andWhere('course.status = :status', { status });
    }

    if (level) {
      queryBuilder.andWhere('course.level = :level', { level });
    }

    if (category) {
      queryBuilder.andWhere('course.category = :category', { category });
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('course.isActive = :isActive', { isActive });
    }

    if (isFeatured !== undefined) {
      queryBuilder.andWhere('course.isFeatured = :isFeatured', { isFeatured });
    }

    // Apply sorting
    const sortField = `course.${sortBy}`;
    queryBuilder.orderBy(sortField, sortOrder);

    // DEBUG: Log the generated SQL query
    const sql = queryBuilder.getQuery();
    const parameters = queryBuilder.getParameters();
    console.log('DEBUG: Generated SQL:', sql);
    console.log('DEBUG: SQL Parameters:', parameters);

    // Get total count
    const total = await queryBuilder.getCount();
    console.log('DEBUG: Total courses found:', total);

    // Apply pagination
    queryBuilder.skip(skip).take(limit);

    // Get data
    const data = await queryBuilder.getMany();

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
   * Find one course by ID
   */
  async findOne(id: string): Promise<Course> {
    const tenantId = this.tenantContext.getTenantId();

    if (!tenantId) {
      throw new BadRequestException('Tenant context not found');
    }

    const course = await this.courseRepository.findOne({
      where: { id, tenantId },
    });

    if (!course) {
      throw new NotFoundException(`Course with ID '${id}' not found`);
    }

    return course;
  }

  /**
   * Find one course by code
   */
  async findByCode(code: string): Promise<Course> {
    const tenantId = this.tenantContext.getTenantId();

    if (!tenantId) {
      throw new BadRequestException('Tenant context not found');
    }

    const course = await this.courseRepository.findOne({
      where: { code, tenantId },
    });

    if (!course) {
      throw new NotFoundException(`Course with code '${code}' not found`);
    }

    return course;
  }

  /**
   * Update course
   */
  async update(id: string, updateCourseDto: UpdateCourseDto): Promise<Course> {
    const course = await this.findOne(id);

    // If updating code, check for conflicts
    if (updateCourseDto.code && updateCourseDto.code !== course.code) {
      const tenantId = this.tenantContext.getTenantId();
      const existingCourse = await this.courseRepository.findOne({
        where: { code: updateCourseDto.code, tenantId },
      });

      if (existingCourse) {
        throw new ConflictException(`Course with code '${updateCourseDto.code}' already exists`);
      }
    }

    // Update course
    Object.assign(course, updateCourseDto);

    return this.courseRepository.save(course);
  }

  /**
   * Remove course (soft delete)
   */
  async remove(id: string): Promise<void> {
    const course = await this.findOne(id);
    await this.courseRepository.softRemove(course);
  }

  /**
   * Publish a course
   */
  async publish(id: string): Promise<Course> {
    const course = await this.findOne(id);

    if (course.status === CourseStatus.PUBLISHED) {
      throw new BadRequestException('Course is already published');
    }

    course.status = CourseStatus.PUBLISHED;
    course.publishedAt = new Date();
    course.isActive = true;

    return this.courseRepository.save(course);
  }

  /**
   * Unpublish a course (set to draft)
   */
  async unpublish(id: string): Promise<Course> {
    const course = await this.findOne(id);

    if (course.status !== CourseStatus.PUBLISHED) {
      throw new BadRequestException('Course is not published');
    }

    course.status = CourseStatus.DRAFT;

    return this.courseRepository.save(course);
  }

  /**
   * Archive a course
   */
  async archive(id: string): Promise<Course> {
    const course = await this.findOne(id);

    if (course.status === CourseStatus.ARCHIVED) {
      throw new BadRequestException('Course is already archived');
    }

    course.status = CourseStatus.ARCHIVED;
    course.isActive = false;

    return this.courseRepository.save(course);
  }

  /**
   * Toggle featured status
   */
  async toggleFeatured(id: string): Promise<Course> {
    const course = await this.findOne(id);
    course.isFeatured = !course.isFeatured;

    return this.courseRepository.save(course);
  }

  /**
   * Get published courses (public endpoint)
   */
  async getPublishedCourses(queryDto: QueryCoursesDto): Promise<{
    data: Course[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    // Override status and isActive filters
    const modifiedQuery = {
      ...queryDto,
      status: CourseStatus.PUBLISHED,
      isActive: true,
    };

    return this.findAll(modifiedQuery);
  }
}

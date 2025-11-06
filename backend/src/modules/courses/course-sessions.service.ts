import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseSession, SessionStatus } from './entities/course-session.entity';
import { Course } from './entities/course.entity';
import { CreateCourseSessionDto } from './dto/create-course-session.dto';
import { UpdateCourseSessionDto } from './dto/update-course-session.dto';
import { QueryCourseSessionsDto } from './dto/query-course-sessions.dto';
import { TenantContextService } from '@/common/tenant/tenant-context.service';

@Injectable()
export class CourseSessionsService {
  constructor(
    @InjectRepository(CourseSession)
    private readonly sessionRepository: Repository<CourseSession>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    private readonly tenantContext: TenantContextService,
  ) {}

  /**
   * Create a new course session
   */
  async create(createSessionDto: CreateCourseSessionDto): Promise<CourseSession> {
    const tenantId = this.tenantContext.getTenantId();

    if (!tenantId) {
      throw new BadRequestException('Tenant context not found');
    }

    // Verify course exists and belongs to tenant
    const course = await this.courseRepository.findOne({
      where: { id: createSessionDto.courseId, tenantId },
    });

    if (!course) {
      throw new NotFoundException(`Course with ID '${createSessionDto.courseId}' not found`);
    }

    // Check if session code already exists for this tenant
    const existingSession = await this.sessionRepository.findOne({
      where: { sessionCode: createSessionDto.sessionCode, tenantId },
    });

    if (existingSession) {
      throw new ConflictException(
        `Session with code '${createSessionDto.sessionCode}' already exists`,
      );
    }

    // Validate dates
    const startDate = new Date(createSessionDto.startDate);
    const endDate = new Date(createSessionDto.endDate);

    if (endDate <= startDate) {
      throw new BadRequestException('End date must be after start date');
    }

    if (createSessionDto.registrationDeadline) {
      const deadline = new Date(createSessionDto.registrationDeadline);
      if (deadline >= startDate) {
        throw new BadRequestException('Registration deadline must be before start date');
      }
    }

    // Create session with tenant ID
    const session = this.sessionRepository.create({
      ...createSessionDto,
      tenantId,
      startDate,
      endDate,
      registrationDeadline: createSessionDto.registrationDeadline
        ? new Date(createSessionDto.registrationDeadline)
        : undefined,
    });

    return this.sessionRepository.save(session);
  }

  /**
   * Find all sessions with pagination and filtering
   */
  async findAll(queryDto: QueryCourseSessionsDto): Promise<{
    data: CourseSession[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const tenantId = this.tenantContext.getTenantId();

    if (!tenantId) {
      throw new BadRequestException('Tenant context not found');
    }

    const {
      page,
      limit,
      search,
      courseId,
      status,
      sessionType,
      isActive,
      isRegistrationOpen,
      startDateFrom,
      startDateTo,
      upcomingOnly,
      pastOnly,
      city,
      sortBy,
      sortOrder,
    } = queryDto;

    const skip = (page - 1) * limit;

    const queryBuilder = this.sessionRepository
      .createQueryBuilder('session')
      .leftJoinAndSelect('session.course', 'course')
      .where('session.tenantId = :tenantId', { tenantId });

    // Apply filters
    if (search) {
      queryBuilder.andWhere(
        '(session.sessionName ILIKE :search OR session.sessionDescription ILIKE :search OR session.sessionCode ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (courseId) {
      queryBuilder.andWhere('session.courseId = :courseId', { courseId });
    }

    if (status) {
      queryBuilder.andWhere('session.status = :status', { status });
    }

    if (sessionType) {
      queryBuilder.andWhere('session.sessionType = :sessionType', { sessionType });
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('session.isActive = :isActive', { isActive });
    }

    if (isRegistrationOpen !== undefined) {
      queryBuilder.andWhere('session.isRegistrationOpen = :isRegistrationOpen', {
        isRegistrationOpen,
      });
    }

    if (startDateFrom) {
      queryBuilder.andWhere('session.startDate >= :startDateFrom', {
        startDateFrom: new Date(startDateFrom),
      });
    }

    if (startDateTo) {
      queryBuilder.andWhere('session.startDate <= :startDateTo', {
        startDateTo: new Date(startDateTo),
      });
    }

    if (upcomingOnly) {
      const now = new Date();
      queryBuilder.andWhere('session.startDate > :now', { now });
    }

    if (pastOnly) {
      const now = new Date();
      queryBuilder.andWhere('session.endDate < :now', { now });
    }

    if (city) {
      queryBuilder.andWhere('session.city = :city', { city });
    }

    // Apply sorting
    const sortField = `session.${sortBy}`;
    queryBuilder.orderBy(sortField, sortOrder);

    // Get total count
    const total = await queryBuilder.getCount();

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
   * Find one session by ID
   */
  async findOne(id: string, includeCourse = false): Promise<CourseSession> {
    const tenantId = this.tenantContext.getTenantId();

    if (!tenantId) {
      throw new BadRequestException('Tenant context not found');
    }

    const queryBuilder = this.sessionRepository
      .createQueryBuilder('session')
      .where('session.id = :id', { id })
      .andWhere('session.tenantId = :tenantId', { tenantId });

    if (includeCourse) {
      queryBuilder.leftJoinAndSelect('session.course', 'course');
    }

    const session = await queryBuilder.getOne();

    if (!session) {
      throw new NotFoundException(`Session with ID '${id}' not found`);
    }

    return session;
  }

  /**
   * Find one session by code
   */
  async findByCode(code: string, includeCourse = false): Promise<CourseSession> {
    const tenantId = this.tenantContext.getTenantId();

    if (!tenantId) {
      throw new BadRequestException('Tenant context not found');
    }

    const queryBuilder = this.sessionRepository
      .createQueryBuilder('session')
      .where('session.sessionCode = :code', { code })
      .andWhere('session.tenantId = :tenantId', { tenantId });

    if (includeCourse) {
      queryBuilder.leftJoinAndSelect('session.course', 'course');
    }

    const session = await queryBuilder.getOne();

    if (!session) {
      throw new NotFoundException(`Session with code '${code}' not found`);
    }

    return session;
  }

  /**
   * Update session
   */
  async update(id: string, updateSessionDto: UpdateCourseSessionDto): Promise<CourseSession> {
    const session = await this.findOne(id);

    // If updating session code, check for conflicts
    if (updateSessionDto.sessionCode && updateSessionDto.sessionCode !== session.sessionCode) {
      const tenantId = this.tenantContext.getTenantId();
      const existingSession = await this.sessionRepository.findOne({
        where: { sessionCode: updateSessionDto.sessionCode, tenantId },
      });

      if (existingSession) {
        throw new ConflictException(
          `Session with code '${updateSessionDto.sessionCode}' already exists`,
        );
      }
    }

    // Validate dates if being updated
    if (updateSessionDto.startDate || updateSessionDto.endDate) {
      const startDate = updateSessionDto.startDate
        ? new Date(updateSessionDto.startDate)
        : session.startDate;
      const endDate = updateSessionDto.endDate ? new Date(updateSessionDto.endDate) : session.endDate;

      if (endDate <= startDate) {
        throw new BadRequestException('End date must be after start date');
      }

      if (updateSessionDto.startDate) {
        updateSessionDto.startDate = startDate.toISOString();
      }
      if (updateSessionDto.endDate) {
        updateSessionDto.endDate = endDate.toISOString();
      }
    }

    if (updateSessionDto.registrationDeadline) {
      const deadline = new Date(updateSessionDto.registrationDeadline);
      const startDate = updateSessionDto.startDate
        ? new Date(updateSessionDto.startDate)
        : session.startDate;

      if (deadline >= startDate) {
        throw new BadRequestException('Registration deadline must be before start date');
      }
    }

    // Update session
    Object.assign(session, updateSessionDto);

    return this.sessionRepository.save(session);
  }

  /**
   * Remove session (soft delete)
   */
  async remove(id: string): Promise<void> {
    const session = await this.findOne(id);
    await this.sessionRepository.softRemove(session);
  }

  /**
   * Start a session (change status to IN_PROGRESS)
   */
  async startSession(id: string): Promise<CourseSession> {
    const session = await this.findOne(id);

    if (session.status !== SessionStatus.SCHEDULED) {
      throw new BadRequestException('Only scheduled sessions can be started');
    }

    session.status = SessionStatus.IN_PROGRESS;

    return this.sessionRepository.save(session);
  }

  /**
   * Complete a session
   */
  async completeSession(id: string): Promise<CourseSession> {
    const session = await this.findOne(id);

    if (session.status === SessionStatus.COMPLETED) {
      throw new BadRequestException('Session is already completed');
    }

    if (session.status === SessionStatus.CANCELLED) {
      throw new BadRequestException('Cannot complete a cancelled session');
    }

    session.status = SessionStatus.COMPLETED;

    return this.sessionRepository.save(session);
  }

  /**
   * Cancel a session
   */
  async cancelSession(id: string): Promise<CourseSession> {
    const session = await this.findOne(id);

    if (session.status === SessionStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel a completed session');
    }

    if (session.status === SessionStatus.CANCELLED) {
      throw new BadRequestException('Session is already cancelled');
    }

    session.status = SessionStatus.CANCELLED;
    session.isRegistrationOpen = false;

    return this.sessionRepository.save(session);
  }

  /**
   * Open/close registration
   */
  async toggleRegistration(id: string): Promise<CourseSession> {
    const session = await this.findOne(id);
    session.isRegistrationOpen = !session.isRegistrationOpen;

    return this.sessionRepository.save(session);
  }

  /**
   * Get upcoming sessions for a course
   */
  async getUpcomingSessions(courseId: string): Promise<CourseSession[]> {
    const tenantId = this.tenantContext.getTenantId();

    if (!tenantId) {
      throw new BadRequestException('Tenant context not found');
    }

    const now = new Date();

    return this.sessionRepository
      .createQueryBuilder('session')
      .where('session.courseId = :courseId', { courseId })
      .andWhere('session.tenantId = :tenantId', { tenantId })
      .andWhere('session.startDate > :now', { now })
      .andWhere('session.status = :status', { status: SessionStatus.SCHEDULED })
      .andWhere('session.isActive = :isActive', { isActive: true })
      .orderBy('session.startDate', 'ASC')
      .getMany();
  }
}

import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Enrollment, EnrollmentStatus, PaymentStatus } from './entities/enrollment.entity';
import { CourseSession } from './entities/course-session.entity';
import { Course } from './entities/course.entity';
import { User } from '@/modules/users/entities/user.entity';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { QueryEnrollmentsDto } from './dto/query-enrollments.dto';
import { TenantContextService } from '@/common/tenant/tenant-context.service';

@Injectable()
export class EnrollmentsService {
  constructor(
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
    @InjectRepository(CourseSession)
    private readonly sessionRepository: Repository<CourseSession>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly tenantContext: TenantContextService,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Generate unique enrollment code
   */
  private async generateEnrollmentCode(tenantId: string): Promise<string> {
    const timestamp = Date.now();
    let counter = 1;
    let enrollmentCode = '';
    let isUnique = false;

    while (!isUnique) {
      enrollmentCode = `ENR-${timestamp}-${counter.toString().padStart(3, '0')}`;

      const existing = await this.enrollmentRepository.findOne({
        where: { enrollmentCode, tenantId },
      });

      if (!existing) {
        isUnique = true;
      } else {
        counter++;
      }
    }

    return enrollmentCode;
  }

  /**
   * Create a new enrollment
   */
  async create(
    createEnrollmentDto: CreateEnrollmentDto,
    enrolledBy?: string,
  ): Promise<Enrollment> {
    const tenantId = this.tenantContext.getTenantId();

    if (!tenantId) {
      throw new BadRequestException('Tenant context not found');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Verify student exists and belongs to tenant
      const student = await this.userRepository.findOne({
        where: { id: createEnrollmentDto.studentId, tenantId },
      });

      if (!student) {
        throw new NotFoundException(
          `Student with ID '${createEnrollmentDto.studentId}' not found`,
        );
      }

      // Verify session exists and belongs to tenant
      const session = await this.sessionRepository.findOne({
        where: { id: createEnrollmentDto.sessionId, tenantId },
        relations: ['course'],
      });

      if (!session) {
        throw new NotFoundException(
          `Session with ID '${createEnrollmentDto.sessionId}' not found`,
        );
      }

      // Generate enrollment code if not provided
      if (!createEnrollmentDto.enrollmentCode) {
        createEnrollmentDto.enrollmentCode = await this.generateEnrollmentCode(tenantId);
      } else {
        // Check if enrollment code already exists
        const existingEnrollment = await this.enrollmentRepository.findOne({
          where: { enrollmentCode: createEnrollmentDto.enrollmentCode, tenantId },
        });

        if (existingEnrollment) {
          throw new ConflictException(
            `Enrollment with code '${createEnrollmentDto.enrollmentCode}' already exists`,
          );
        }
      }

      // Check if student is already enrolled in this session
      const existingSessionEnrollment = await this.enrollmentRepository.findOne({
        where: {
          studentId: createEnrollmentDto.studentId,
          sessionId: createEnrollmentDto.sessionId,
          tenantId,
        },
      });

      if (existingSessionEnrollment) {
        throw new ConflictException('Student is already enrolled in this session');
      }

      // Check session capacity and registration status
      const isWaitlist = createEnrollmentDto.isWaitlist || false;

      if (!isWaitlist) {
        if (!session.canRegister()) {
          // If session is full or registration closed, add to waitlist instead
          createEnrollmentDto.isWaitlist = true;

          // Calculate waitlist position
          const waitlistCount = await this.enrollmentRepository.count({
            where: {
              sessionId: session.id,
              isWaitlist: true,
              tenantId,
            },
          });

          // Create enrollment on waitlist
          const enrollment = this.enrollmentRepository.create({
            ...createEnrollmentDto,
            tenantId,
            courseId: session.courseId,
            enrolledBy,
            waitlistPosition: waitlistCount + 1,
            price: createEnrollmentDto.price ?? session.price ?? session.course.price,
          });

          const savedEnrollment = await queryRunner.manager.save(enrollment);
          await queryRunner.commitTransaction();

          return savedEnrollment;
        }
      }

      // Determine enrollment price
      const enrollmentPrice =
        createEnrollmentDto.price ?? session.price ?? session.course.price ?? 0;

      // Create enrollment
      const enrollment = this.enrollmentRepository.create({
        ...createEnrollmentDto,
        tenantId,
        courseId: session.courseId,
        enrolledBy,
        price: enrollmentPrice,
      });

      const savedEnrollment = await queryRunner.manager.save(enrollment);

      // Increment session participant count if not waitlist
      if (!isWaitlist) {
        session.currentParticipants += 1;
        await queryRunner.manager.save(session);
      }

      await queryRunner.commitTransaction();

      return savedEnrollment;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Find all enrollments with pagination and filtering
   */
  async findAll(queryDto: QueryEnrollmentsDto): Promise<{
    data: Enrollment[];
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
      studentId,
      courseId,
      sessionId,
      status,
      paymentStatus,
      attendanceStatus,
      passed,
      certificateIssued,
      isWaitlist,
      enrolledAfter,
      enrolledBefore,
      sessionStartAfter,
      sessionStartBefore,
      sortBy,
      sortOrder,
    } = queryDto;

    const skip = (page - 1) * limit;

    const queryBuilder = this.enrollmentRepository
      .createQueryBuilder('enrollment')
      .leftJoinAndSelect('enrollment.student', 'student')
      .leftJoinAndSelect('enrollment.course', 'course')
      .leftJoinAndSelect('enrollment.session', 'session')
      .where('enrollment.tenantId = :tenantId', { tenantId });

    // Apply filters
    if (search) {
      queryBuilder.andWhere('enrollment.enrollmentCode ILIKE :search', {
        search: `%${search}%`,
      });
    }

    if (studentId) {
      queryBuilder.andWhere('enrollment.studentId = :studentId', { studentId });
    }

    if (courseId) {
      queryBuilder.andWhere('enrollment.courseId = :courseId', { courseId });
    }

    if (sessionId) {
      queryBuilder.andWhere('enrollment.sessionId = :sessionId', { sessionId });
    }

    if (status) {
      queryBuilder.andWhere('enrollment.status = :status', { status });
    }

    if (paymentStatus) {
      queryBuilder.andWhere('enrollment.paymentStatus = :paymentStatus', { paymentStatus });
    }

    if (attendanceStatus) {
      queryBuilder.andWhere('enrollment.attendanceStatus = :attendanceStatus', {
        attendanceStatus,
      });
    }

    if (passed !== undefined) {
      queryBuilder.andWhere('enrollment.passed = :passed', { passed });
    }

    if (certificateIssued !== undefined) {
      queryBuilder.andWhere('enrollment.certificateIssued = :certificateIssued', {
        certificateIssued,
      });
    }

    if (isWaitlist !== undefined) {
      queryBuilder.andWhere('enrollment.isWaitlist = :isWaitlist', { isWaitlist });
    }

    if (enrolledAfter) {
      queryBuilder.andWhere('enrollment.enrolledAt >= :enrolledAfter', {
        enrolledAfter: new Date(enrolledAfter),
      });
    }

    if (enrolledBefore) {
      queryBuilder.andWhere('enrollment.enrolledAt <= :enrolledBefore', {
        enrolledBefore: new Date(enrolledBefore),
      });
    }

    if (sessionStartAfter) {
      queryBuilder.andWhere('session.startDate >= :sessionStartAfter', {
        sessionStartAfter: new Date(sessionStartAfter),
      });
    }

    if (sessionStartBefore) {
      queryBuilder.andWhere('session.startDate <= :sessionStartBefore', {
        sessionStartBefore: new Date(sessionStartBefore),
      });
    }

    // Apply sorting
    const sortField = `enrollment.${sortBy}`;
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
   * Find one enrollment by ID
   */
  async findOne(id: string, includeRelations = false): Promise<Enrollment> {
    const tenantId = this.tenantContext.getTenantId();

    if (!tenantId) {
      throw new BadRequestException('Tenant context not found');
    }

    const queryBuilder = this.enrollmentRepository
      .createQueryBuilder('enrollment')
      .where('enrollment.id = :id', { id })
      .andWhere('enrollment.tenantId = :tenantId', { tenantId });

    if (includeRelations) {
      queryBuilder
        .leftJoinAndSelect('enrollment.student', 'student')
        .leftJoinAndSelect('enrollment.course', 'course')
        .leftJoinAndSelect('enrollment.session', 'session');
    }

    const enrollment = await queryBuilder.getOne();

    if (!enrollment) {
      throw new NotFoundException(`Enrollment with ID '${id}' not found`);
    }

    return enrollment;
  }

  /**
   * Update enrollment
   */
  async update(id: string, updateEnrollmentDto: UpdateEnrollmentDto): Promise<Enrollment> {
    const enrollment = await this.findOne(id);

    // If updating enrollment code, check for conflicts
    if (
      updateEnrollmentDto.enrollmentCode &&
      updateEnrollmentDto.enrollmentCode !== enrollment.enrollmentCode
    ) {
      const tenantId = this.tenantContext.getTenantId();
      const existingEnrollment = await this.enrollmentRepository.findOne({
        where: { enrollmentCode: updateEnrollmentDto.enrollmentCode, tenantId },
      });

      if (existingEnrollment) {
        throw new ConflictException(
          `Enrollment with code '${updateEnrollmentDto.enrollmentCode}' already exists`,
        );
      }
    }

    // Update enrollment
    Object.assign(enrollment, updateEnrollmentDto);

    return this.enrollmentRepository.save(enrollment);
  }

  /**
   * Remove enrollment (soft delete)
   */
  async remove(id: string): Promise<void> {
    const enrollment = await this.findOne(id);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Decrement session participant count if not waitlist
      if (!enrollment.isWaitlist && enrollment.isActive()) {
        const session = await this.sessionRepository.findOne({
          where: { id: enrollment.sessionId },
        });

        if (session) {
          session.currentParticipants = Math.max(0, session.currentParticipants - 1);
          await queryRunner.manager.save(session);
        }
      }

      await queryRunner.manager.softRemove(enrollment);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Confirm enrollment
   */
  async confirmEnrollment(id: string): Promise<Enrollment> {
    const enrollment = await this.findOne(id);

    if (enrollment.status !== EnrollmentStatus.PENDING) {
      throw new BadRequestException('Only pending enrollments can be confirmed');
    }

    enrollment.status = EnrollmentStatus.CONFIRMED;
    enrollment.confirmedAt = new Date();

    return this.enrollmentRepository.save(enrollment);
  }

  /**
   * Cancel enrollment
   */
  async cancelEnrollment(id: string, reason?: string): Promise<Enrollment> {
    const enrollment = await this.findOne(id);

    if (!enrollment.canCancel()) {
      throw new BadRequestException('This enrollment cannot be cancelled');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      enrollment.status = EnrollmentStatus.CANCELLED;
      enrollment.cancelledAt = new Date();
      enrollment.cancellationReason = reason;

      // Decrement session participant count if not waitlist
      if (!enrollment.isWaitlist) {
        const session = await this.sessionRepository.findOne({
          where: { id: enrollment.sessionId },
        });

        if (session) {
          session.currentParticipants = Math.max(0, session.currentParticipants - 1);
          await queryRunner.manager.save(session);
        }
      }

      const saved = await queryRunner.manager.save(enrollment);
      await queryRunner.commitTransaction();

      return saved;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Complete enrollment
   */
  async completeEnrollment(id: string): Promise<Enrollment> {
    const enrollment = await this.findOne(id);

    if (!enrollment.canComplete()) {
      throw new BadRequestException('Only confirmed enrollments can be completed');
    }

    enrollment.status = EnrollmentStatus.COMPLETED;
    enrollment.completedAt = new Date();
    enrollment.completionPercentage = 100;

    return this.enrollmentRepository.save(enrollment);
  }

  /**
   * Record payment
   */
  async recordPayment(
    id: string,
    amount: number,
    reference?: string,
  ): Promise<Enrollment> {
    const enrollment = await this.findOne(id);

    if (enrollment.paymentStatus === PaymentStatus.PAID) {
      throw new BadRequestException('Enrollment is already fully paid');
    }

    if (enrollment.paymentStatus === PaymentStatus.WAIVED) {
      throw new BadRequestException('Payment has been waived for this enrollment');
    }

    const newTotal = enrollment.amountPaid + amount;
    enrollment.amountPaid = newTotal;
    enrollment.paymentDate = new Date();

    if (reference) {
      enrollment.paymentReference = reference;
    }

    // Update payment status
    if (enrollment.price === null || enrollment.price === 0) {
      enrollment.paymentStatus = PaymentStatus.WAIVED;
    } else if (newTotal >= enrollment.price) {
      enrollment.paymentStatus = PaymentStatus.PAID;
    } else if (newTotal > 0) {
      enrollment.paymentStatus = PaymentStatus.PARTIAL;
    }

    return this.enrollmentRepository.save(enrollment);
  }

  /**
   * Issue certificate
   */
  async issueCertificate(
    id: string,
    certificateNumber: string,
    certificateUrl?: string,
  ): Promise<Enrollment> {
    const enrollment = await this.findOne(id);

    if (!enrollment.canIssueCertificate()) {
      throw new BadRequestException(
        'Certificate can only be issued for completed, passed, and fully paid enrollments',
      );
    }

    enrollment.certificateIssued = true;
    enrollment.certificateIssuedAt = new Date();
    enrollment.certificateNumber = certificateNumber;
    enrollment.certificateUrl = certificateUrl;

    return this.enrollmentRepository.save(enrollment);
  }

  /**
   * Update grade and pass status
   */
  async updateGrade(id: string, grade: number, passed: boolean): Promise<Enrollment> {
    const enrollment = await this.findOne(id);

    if (enrollment.status !== EnrollmentStatus.COMPLETED) {
      throw new BadRequestException('Can only grade completed enrollments');
    }

    enrollment.finalGrade = grade;
    enrollment.passed = passed;

    return this.enrollmentRepository.save(enrollment);
  }
}

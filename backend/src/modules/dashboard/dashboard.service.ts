import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Course, CourseStatus } from '../courses/entities/course.entity';
import { CourseSession, SessionStatus } from '../courses/entities/course-session.entity';
import {
  Enrollment,
  EnrollmentStatus,
  PaymentStatus,
} from '../courses/entities/enrollment.entity';
import { User } from '../users/entities/user.entity';
import { Tenant } from '../tenant/entities/tenant.entity';
import { TenantContextService } from '@/common/tenant/tenant-context.service';
import { DashboardStatsDto } from './dto/dashboard-stats.dto';
import {
  SuperAdminStatsDto,
  TenantStatsDto,
  SystemGrowthDto,
} from './dto/super-admin-stats.dto';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(CourseSession)
    private readonly sessionRepository: Repository<CourseSession>,
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
    private readonly tenantContext: TenantContextService,
  ) {}

  async getStats(): Promise<DashboardStatsDto> {
    const tenantId = this.tenantContext.getTenantId();

    if (!tenantId) {
      throw new BadRequestException('Tenant context not found');
    }

    const now = new Date();

    // Count active courses (published and active)
    const activeCourses = await this.courseRepository.count({
      where: {
        tenantId,
        status: CourseStatus.PUBLISHED,
        isActive: true,
      },
    });

    // Count published courses (including archived)
    const publishedCourses = await this.courseRepository.count({
      where: {
        tenantId,
        status: CourseStatus.PUBLISHED,
      },
    });

    // Count upcoming sessions (scheduled and not started yet)
    const upcomingSessions = await this.sessionRepository
      .createQueryBuilder('session')
      .where('session.tenantId = :tenantId', { tenantId })
      .andWhere('session.status = :status', { status: SessionStatus.SCHEDULED })
      .andWhere('session.startDate > :now', { now })
      .getCount();

    // Count active sessions (in progress)
    const activeSessions = await this.sessionRepository.count({
      where: {
        tenantId,
        status: SessionStatus.IN_PROGRESS,
      },
    });

    // Count active enrollments (confirmed or pending, not cancelled or completed)
    const activeEnrollments = await this.enrollmentRepository
      .createQueryBuilder('enrollment')
      .where('enrollment.tenantId = :tenantId', { tenantId })
      .andWhere('enrollment.status IN (:...statuses)', {
        statuses: [EnrollmentStatus.CONFIRMED, EnrollmentStatus.PENDING],
      })
      .andWhere('enrollment.isWaitlist = :isWaitlist', { isWaitlist: false })
      .getCount();

    // Count all enrollments
    const totalEnrollments = await this.enrollmentRepository.count({
      where: { tenantId },
    });

    // Count students (users with student-like roles or who have enrollments)
    const totalStudents = await this.enrollmentRepository
      .createQueryBuilder('enrollment')
      .select('COUNT(DISTINCT enrollment.studentId)', 'count')
      .where('enrollment.tenantId = :tenantId', { tenantId })
      .getRawOne()
      .then((result) => parseInt(result.count, 10));

    // Count instructors (users with instructor roles)
    // For now, we'll count users who are assigned as instructors to sessions
    const totalInstructors = await this.sessionRepository
      .createQueryBuilder('session')
      .select('COUNT(DISTINCT session.instructorId)', 'count')
      .where('session.tenantId = :tenantId', { tenantId })
      .andWhere('session.instructorId IS NOT NULL')
      .getRawOne()
      .then((result) => parseInt(result.count, 10));

    // Calculate total revenue (sum of all paid enrollments)
    const revenueResult = await this.enrollmentRepository
      .createQueryBuilder('enrollment')
      .select('SUM(enrollment.amountPaid)', 'total')
      .where('enrollment.tenantId = :tenantId', { tenantId })
      .andWhere('enrollment.paymentStatus IN (:...statuses)', {
        statuses: [PaymentStatus.PAID, PaymentStatus.PARTIAL],
      })
      .getRawOne();

    const totalRevenue = parseFloat(revenueResult?.total || '0');

    // Calculate pending payments (enrollments with unpaid or partial payment)
    const pendingPaymentsResult = await this.enrollmentRepository
      .createQueryBuilder('enrollment')
      .select('SUM(enrollment.price - enrollment.amountPaid)', 'total')
      .where('enrollment.tenantId = :tenantId', { tenantId })
      .andWhere('enrollment.paymentStatus IN (:...statuses)', {
        statuses: [PaymentStatus.UNPAID, PaymentStatus.PARTIAL],
      })
      .andWhere('enrollment.price IS NOT NULL')
      .andWhere('enrollment.price > enrollment.amountPaid')
      .getRawOne();

    const pendingPayments = parseFloat(pendingPaymentsResult?.total || '0');

    // Count pending enrollments
    const pendingEnrollments = await this.enrollmentRepository.count({
      where: {
        tenantId,
        status: EnrollmentStatus.PENDING,
      },
    });

    // Count waitlist enrollments
    const waitlistEnrollments = await this.enrollmentRepository.count({
      where: {
        tenantId,
        isWaitlist: true,
      },
    });

    // Count enrollments by status
    const enrollmentsByStatusRaw = await this.enrollmentRepository
      .createQueryBuilder('enrollment')
      .select('enrollment.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('enrollment.tenantId = :tenantId', { tenantId })
      .groupBy('enrollment.status')
      .getRawMany();

    const enrollmentsByStatus: Record<string, number> = {};

    // Initialize all statuses with 0
    Object.values(EnrollmentStatus).forEach((status) => {
      enrollmentsByStatus[status] = 0;
    });

    // Fill in actual counts
    enrollmentsByStatusRaw.forEach((row) => {
      enrollmentsByStatus[row.status] = parseInt(row.count, 10);
    });

    return {
      activeCourses,
      publishedCourses,
      upcomingSessions,
      activeSessions,
      activeEnrollments,
      totalEnrollments,
      totalStudents,
      totalInstructors,
      totalRevenue,
      pendingPayments,
      pendingEnrollments,
      waitlistEnrollments,
      enrollmentsByStatus,
    };
  }

  async getSuperAdminStats(): Promise<SuperAdminStatsDto> {
    const now = new Date();
    const last30Days = new Date(now);
    last30Days.setDate(last30Days.getDate() - 30);

    // Tenant Statistics
    const totalTenants = await this.tenantRepository.count();
    const activeTenants = await this.tenantRepository.count({
      where: { isActive: true },
    });
    const inactiveTenants = totalTenants - activeTenants;
    const newTenantsLast30Days = await this.tenantRepository.count({
      where: { createdAt: MoreThan(last30Days) },
    });

    // User Statistics
    const totalUsers = await this.userRepository.count();
    const activeUsers = await this.userRepository.count({
      where: { isActive: true },
    });
    const newUsersLast30Days = await this.userRepository.count({
      where: { createdAt: MoreThan(last30Days) },
    });

    // Course Statistics
    const totalCourses = await this.courseRepository.count();
    const publishedCourses = await this.courseRepository.count({
      where: { status: CourseStatus.PUBLISHED },
    });
    const newCoursesLast30Days = await this.courseRepository.count({
      where: { createdAt: MoreThan(last30Days) },
    });

    // Session Statistics
    const totalSessions = await this.sessionRepository.count();
    const activeSessions = await this.sessionRepository.count({
      where: { status: SessionStatus.IN_PROGRESS },
    });
    const upcomingSessions = await this.sessionRepository
      .createQueryBuilder('session')
      .where('session.status = :status', { status: SessionStatus.SCHEDULED })
      .andWhere('session.startDate > :now', { now })
      .getCount();

    // Enrollment Statistics
    const totalEnrollments = await this.enrollmentRepository.count();
    const activeEnrollments = await this.enrollmentRepository.count({
      where: {
        status: EnrollmentStatus.CONFIRMED,
      },
    });
    const completedEnrollments = await this.enrollmentRepository.count({
      where: {
        status: EnrollmentStatus.COMPLETED,
      },
    });
    const newEnrollmentsLast30Days = await this.enrollmentRepository.count({
      where: { createdAt: MoreThan(last30Days) },
    });

    // Financial Statistics
    const revenueResult = await this.enrollmentRepository
      .createQueryBuilder('enrollment')
      .select('SUM(enrollment.amountPaid)', 'total')
      .where('enrollment.paymentStatus IN (:...statuses)', {
        statuses: [PaymentStatus.PAID, PaymentStatus.PARTIAL],
      })
      .getRawOne();
    const totalRevenue = parseFloat(revenueResult?.total || '0');

    const revenueLast30DaysResult = await this.enrollmentRepository
      .createQueryBuilder('enrollment')
      .select('SUM(enrollment.amountPaid)', 'total')
      .where('enrollment.paymentStatus IN (:...statuses)', {
        statuses: [PaymentStatus.PAID, PaymentStatus.PARTIAL],
      })
      .andWhere('enrollment.createdAt > :date', { date: last30Days })
      .getRawOne();
    const revenueLast30Days = parseFloat(revenueLast30DaysResult?.total || '0');

    const pendingPaymentsResult = await this.enrollmentRepository
      .createQueryBuilder('enrollment')
      .select('SUM(enrollment.price - enrollment.amountPaid)', 'total')
      .where('enrollment.paymentStatus IN (:...statuses)', {
        statuses: [PaymentStatus.UNPAID, PaymentStatus.PARTIAL],
      })
      .andWhere('enrollment.price IS NOT NULL')
      .andWhere('enrollment.price > enrollment.amountPaid')
      .getRawOne();
    const pendingPayments = parseFloat(pendingPaymentsResult?.total || '0');

    const averageRevenuePerTenant = totalTenants > 0 ? totalRevenue / totalTenants : 0;

    // Top Tenants by Revenue
    const topTenantsByRevenueRaw = await this.enrollmentRepository
      .createQueryBuilder('enrollment')
      .select('enrollment.tenantId', 'tenantId')
      .addSelect('SUM(enrollment.amountPaid)', 'total')
      .where('enrollment.paymentStatus IN (:...statuses)', {
        statuses: [PaymentStatus.PAID, PaymentStatus.PARTIAL],
      })
      .groupBy('enrollment.tenantId')
      .orderBy('total', 'DESC')
      .limit(5)
      .getRawMany();

    const topTenantsByRevenue: TenantStatsDto[] = await Promise.all(
      topTenantsByRevenueRaw.map(async (item) => {
        const tenant = await this.tenantRepository.findOne({
          where: { id: item.tenantId },
        });
        const tenantUsers = await this.userRepository.count({
          where: { tenantId: item.tenantId },
        });
        const tenantCourses = await this.courseRepository.count({
          where: { tenantId: item.tenantId },
        });
        const tenantEnrollments = await this.enrollmentRepository.count({
          where: { tenantId: item.tenantId },
        });

        return {
          tenantId: item.tenantId,
          slug: tenant?.slug || '',
          companyName: tenant?.companyName || '',
          totalUsers: tenantUsers,
          totalCourses: tenantCourses,
          totalEnrollments: tenantEnrollments,
          totalRevenue: parseFloat(item.total || '0'),
          isActive: tenant?.isActive || false,
          createdAt: tenant?.createdAt || new Date(),
        };
      }),
    );

    // Top Tenants by Users
    const topTenantsByUsersRaw = await this.userRepository
      .createQueryBuilder('user')
      .select('user.tenantId', 'tenantId')
      .addSelect('COUNT(*)', 'count')
      .groupBy('user.tenantId')
      .orderBy('count', 'DESC')
      .limit(5)
      .getRawMany();

    const topTenantsByUsers: TenantStatsDto[] = await Promise.all(
      topTenantsByUsersRaw.map(async (item) => {
        const tenant = await this.tenantRepository.findOne({
          where: { id: item.tenantId },
        });
        const tenantCourses = await this.courseRepository.count({
          where: { tenantId: item.tenantId },
        });
        const tenantEnrollments = await this.enrollmentRepository.count({
          where: { tenantId: item.tenantId },
        });
        const tenantRevenueResult = await this.enrollmentRepository
          .createQueryBuilder('enrollment')
          .select('SUM(enrollment.amountPaid)', 'total')
          .where('enrollment.tenantId = :tenantId', { tenantId: item.tenantId })
          .andWhere('enrollment.paymentStatus IN (:...statuses)', {
            statuses: [PaymentStatus.PAID, PaymentStatus.PARTIAL],
          })
          .getRawOne();

        return {
          tenantId: item.tenantId,
          slug: tenant?.slug || '',
          companyName: tenant?.companyName || '',
          totalUsers: parseInt(item.count, 10),
          totalCourses: tenantCourses,
          totalEnrollments: tenantEnrollments,
          totalRevenue: parseFloat(tenantRevenueResult?.total || '0'),
          isActive: tenant?.isActive || false,
          createdAt: tenant?.createdAt || new Date(),
        };
      }),
    );

    // Top Tenants by Enrollments
    const topTenantsByEnrollmentsRaw = await this.enrollmentRepository
      .createQueryBuilder('enrollment')
      .select('enrollment.tenantId', 'tenantId')
      .addSelect('COUNT(*)', 'count')
      .groupBy('enrollment.tenantId')
      .orderBy('count', 'DESC')
      .limit(5)
      .getRawMany();

    const topTenantsByEnrollments: TenantStatsDto[] = await Promise.all(
      topTenantsByEnrollmentsRaw.map(async (item) => {
        const tenant = await this.tenantRepository.findOne({
          where: { id: item.tenantId },
        });
        const tenantUsers = await this.userRepository.count({
          where: { tenantId: item.tenantId },
        });
        const tenantCourses = await this.courseRepository.count({
          where: { tenantId: item.tenantId },
        });
        const tenantRevenueResult = await this.enrollmentRepository
          .createQueryBuilder('enrollment')
          .select('SUM(enrollment.amountPaid)', 'total')
          .where('enrollment.tenantId = :tenantId', { tenantId: item.tenantId })
          .andWhere('enrollment.paymentStatus IN (:...statuses)', {
            statuses: [PaymentStatus.PAID, PaymentStatus.PARTIAL],
          })
          .getRawOne();

        return {
          tenantId: item.tenantId,
          slug: tenant?.slug || '',
          companyName: tenant?.companyName || '',
          totalUsers: tenantUsers,
          totalCourses: tenantCourses,
          totalEnrollments: parseInt(item.count, 10),
          totalRevenue: parseFloat(tenantRevenueResult?.total || '0'),
          isActive: tenant?.isActive || false,
          createdAt: tenant?.createdAt || new Date(),
        };
      }),
    );

    // Growth Data (last 6 months)
    const growthData: SystemGrowthDto[] = [];
    for (let i = 5; i >= 0; i--) {
      const periodStart = new Date(now);
      periodStart.setMonth(periodStart.getMonth() - i);
      periodStart.setDate(1);
      periodStart.setHours(0, 0, 0, 0);

      const periodEnd = new Date(periodStart);
      periodEnd.setMonth(periodEnd.getMonth() + 1);

      const period = `${periodStart.getFullYear()}-${String(periodStart.getMonth() + 1).padStart(2, '0')}`;

      const newTenants = await this.tenantRepository
        .createQueryBuilder('tenant')
        .where('tenant.createdAt >= :start', { start: periodStart })
        .andWhere('tenant.createdAt < :end', { end: periodEnd })
        .getCount();

      const newUsers = await this.userRepository
        .createQueryBuilder('user')
        .where('user.createdAt >= :start', { start: periodStart })
        .andWhere('user.createdAt < :end', { end: periodEnd })
        .getCount();

      const newRevenueResult = await this.enrollmentRepository
        .createQueryBuilder('enrollment')
        .select('SUM(enrollment.amountPaid)', 'total')
        .where('enrollment.createdAt >= :start', { start: periodStart })
        .andWhere('enrollment.createdAt < :end', { end: periodEnd })
        .andWhere('enrollment.paymentStatus IN (:...statuses)', {
          statuses: [PaymentStatus.PAID, PaymentStatus.PARTIAL],
        })
        .getRawOne();

      growthData.push({
        period,
        newTenants,
        newUsers,
        newRevenue: parseFloat(newRevenueResult?.total || '0'),
      });
    }

    // Tenants by Status
    const tenantsByStatus: Record<string, number> = {
      active: activeTenants,
      inactive: inactiveTenants,
    };

    // Enrollments by Status
    const enrollmentsByStatusRaw = await this.enrollmentRepository
      .createQueryBuilder('enrollment')
      .select('enrollment.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('enrollment.status')
      .getRawMany();

    const enrollmentsByStatus: Record<string, number> = {};
    Object.values(EnrollmentStatus).forEach((status) => {
      enrollmentsByStatus[status] = 0;
    });
    enrollmentsByStatusRaw.forEach((row) => {
      enrollmentsByStatus[row.status] = parseInt(row.count, 10);
    });

    return {
      totalTenants,
      activeTenants,
      inactiveTenants,
      newTenantsLast30Days,
      totalUsers,
      activeUsers,
      newUsersLast30Days,
      totalCourses,
      publishedCourses,
      newCoursesLast30Days,
      totalSessions,
      activeSessions,
      upcomingSessions,
      totalEnrollments,
      activeEnrollments,
      completedEnrollments,
      newEnrollmentsLast30Days,
      totalRevenue,
      revenueLast30Days,
      pendingPayments,
      averageRevenuePerTenant,
      topTenantsByRevenue,
      topTenantsByUsers,
      topTenantsByEnrollments,
      growthData,
      tenantsByStatus,
      enrollmentsByStatus,
    };
  }
}

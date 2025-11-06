import { ApiProperty } from '@nestjs/swagger';

export class TenantStatsDto {
  @ApiProperty({ example: '541c18bd-135f-4b67-862b-76e6c3105db4' })
  tenantId: string;

  @ApiProperty({ example: 'testcompany' })
  slug: string;

  @ApiProperty({ example: 'Test Company Ltd' })
  companyName: string;

  @ApiProperty({ example: 25 })
  totalUsers: number;

  @ApiProperty({ example: 10 })
  totalCourses: number;

  @ApiProperty({ example: 45 })
  totalEnrollments: number;

  @ApiProperty({ example: 15000.50 })
  totalRevenue: number;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: '2024-01-15T10:00:00Z' })
  createdAt: Date;
}

export class SystemGrowthDto {
  @ApiProperty({ example: '2024-01' })
  period: string;

  @ApiProperty({ example: 5 })
  newTenants: number;

  @ApiProperty({ example: 120 })
  newUsers: number;

  @ApiProperty({ example: 25000.00 })
  newRevenue: number;
}

export class SuperAdminStatsDto {
  // Tenant Statistics
  @ApiProperty({ example: 15, description: 'Total number of tenants in the system' })
  totalTenants: number;

  @ApiProperty({ example: 12, description: 'Number of active tenants' })
  activeTenants: number;

  @ApiProperty({ example: 3, description: 'Number of inactive tenants' })
  inactiveTenants: number;

  @ApiProperty({ example: 5, description: 'New tenants in last 30 days' })
  newTenantsLast30Days: number;

  // User Statistics
  @ApiProperty({ example: 450, description: 'Total number of users across all tenants' })
  totalUsers: number;

  @ApiProperty({ example: 380, description: 'Number of active users' })
  activeUsers: number;

  @ApiProperty({ example: 75, description: 'New users in last 30 days' })
  newUsersLast30Days: number;

  // Course Statistics
  @ApiProperty({ example: 125, description: 'Total number of courses' })
  totalCourses: number;

  @ApiProperty({ example: 95, description: 'Number of published courses' })
  publishedCourses: number;

  @ApiProperty({ example: 20, description: 'New courses in last 30 days' })
  newCoursesLast30Days: number;

  // Session Statistics
  @ApiProperty({ example: 250, description: 'Total number of sessions' })
  totalSessions: number;

  @ApiProperty({ example: 45, description: 'Number of active sessions' })
  activeSessions: number;

  @ApiProperty({ example: 80, description: 'Number of upcoming sessions' })
  upcomingSessions: number;

  // Enrollment Statistics
  @ApiProperty({ example: 850, description: 'Total number of enrollments' })
  totalEnrollments: number;

  @ApiProperty({ example: 320, description: 'Number of active enrollments' })
  activeEnrollments: number;

  @ApiProperty({ example: 250, description: 'Number of completed enrollments' })
  completedEnrollments: number;

  @ApiProperty({ example: 150, description: 'New enrollments in last 30 days' })
  newEnrollmentsLast30Days: number;

  // Financial Statistics
  @ApiProperty({ example: 125000.50, description: 'Total revenue across all tenants' })
  totalRevenue: number;

  @ApiProperty({ example: 45000.00, description: 'Revenue in last 30 days' })
  revenueLast30Days: number;

  @ApiProperty({ example: 15000.00, description: 'Pending payments across all tenants' })
  pendingPayments: number;

  @ApiProperty({ example: 4166.68, description: 'Average revenue per tenant' })
  averageRevenuePerTenant: number;

  // Top Tenants
  @ApiProperty({ type: [TenantStatsDto], description: 'Top 5 tenants by revenue' })
  topTenantsByRevenue: TenantStatsDto[];

  @ApiProperty({ type: [TenantStatsDto], description: 'Top 5 tenants by users' })
  topTenantsByUsers: TenantStatsDto[];

  @ApiProperty({ type: [TenantStatsDto], description: 'Top 5 tenants by enrollments' })
  topTenantsByEnrollments: TenantStatsDto[];

  // Growth Statistics
  @ApiProperty({ type: [SystemGrowthDto], description: 'System growth over last 6 months' })
  growthData: SystemGrowthDto[];

  // Distribution
  @ApiProperty({
    example: { active: 12, inactive: 3 },
    description: 'Tenants distribution by status',
  })
  tenantsByStatus: Record<string, number>;

  @ApiProperty({
    example: { pending: 120, confirmed: 450, cancelled: 80, completed: 200 },
    description: 'Enrollments distribution by status',
  })
  enrollmentsByStatus: Record<string, number>;
}

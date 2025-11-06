import { ApiProperty } from '@nestjs/swagger';

export class DashboardStatsDto {
  @ApiProperty({ example: 10, description: 'Total number of active courses' })
  activeCourses: number;

  @ApiProperty({ example: 25, description: 'Total number of published courses' })
  publishedCourses: number;

  @ApiProperty({ example: 15, description: 'Total number of upcoming sessions' })
  upcomingSessions: number;

  @ApiProperty({ example: 8, description: 'Total number of active sessions' })
  activeSessions: number;

  @ApiProperty({ example: 50, description: 'Total number of active enrollments' })
  activeEnrollments: number;

  @ApiProperty({ example: 120, description: 'Total number of all enrollments' })
  totalEnrollments: number;

  @ApiProperty({ example: 35, description: 'Total number of students' })
  totalStudents: number;

  @ApiProperty({ example: 5, description: 'Total number of instructors' })
  totalInstructors: number;

  @ApiProperty({ example: 15000.50, description: 'Total revenue (all paid enrollments)' })
  totalRevenue: number;

  @ApiProperty({ example: 2500.00, description: 'Pending payments' })
  pendingPayments: number;

  @ApiProperty({ example: 12, description: 'Number of enrollments awaiting confirmation' })
  pendingEnrollments: number;

  @ApiProperty({ example: 3, description: 'Number of enrollments on waitlist' })
  waitlistEnrollments: number;

  @ApiProperty({
    example: {
      pending: 12,
      confirmed: 45,
      cancelled: 8,
      completed: 30,
      no_show: 5,
    },
    description: 'Enrollments count by status',
  })
  enrollmentsByStatus: Record<string, number>;
}

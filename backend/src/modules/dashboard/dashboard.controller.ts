import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { DashboardStatsDto } from './dto/dashboard-stats.dto';
import { SuperAdminStatsDto } from './dto/super-admin-stats.dto';

@ApiTags('dashboard')
@ApiBearerAuth()
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get dashboard statistics for tenant admin' })
  @ApiResponse({
    status: 200,
    description: 'Dashboard statistics retrieved successfully',
    type: DashboardStatsDto,
  })
  async getStats(): Promise<DashboardStatsDto> {
    return this.dashboardService.getStats();
  }

  @Get('super-admin/stats')
  @ApiOperation({ summary: 'Get dashboard statistics for super admin (system-wide)' })
  @ApiResponse({
    status: 200,
    description: 'Super admin dashboard statistics retrieved successfully',
    type: SuperAdminStatsDto,
  })
  async getSuperAdminStats(): Promise<SuperAdminStatsDto> {
    return this.dashboardService.getSuperAdminStats();
  }
}

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { TimeTrackingService } from '../services/time-tracking.service';
import { CreateTimeEntryDto } from '../dto/create-time-entry.dto';
import { UpdateTimeEntryDto } from '../dto/update-time-entry.dto';
import { QueryTimeEntriesDto } from '../dto/query-time-entries.dto';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

class RejectTimeEntryDto {
  reason: string;
}

@ApiTags('Time Tracking')
@ApiBearerAuth()
@Controller('time-entries')
export class TimeTrackingController {
  constructor(private readonly timeTrackingService: TimeTrackingService) {}

  @Post()
  @Roles('TENANT_ADMIN', 'EMPLOYEE')
  @ApiOperation({ summary: 'Create a new time entry' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Time entry created successfully',
  })
  async create(
    @Body() createDto: CreateTimeEntryDto,
    @CurrentUser() user: any,
  ) {
    return await this.timeTrackingService.create(
      createDto,
      user.sub,
      user.tenantId,
    );
  }

  @Get()
  @Roles('TENANT_ADMIN', 'EMPLOYEE')
  @ApiOperation({ summary: 'Get all time entries with pagination and filtering' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of time entries',
  })
  async findAll(
    @Query() queryDto: QueryTimeEntriesDto,
    @CurrentUser() user: any,
  ) {
    // Non-admins can only see their own entries
    if (!user.roles?.includes('TENANT_ADMIN')) {
      queryDto.userId = user.sub;
    }

    return await this.timeTrackingService.findAll(queryDto, user.tenantId);
  }

  @Get('my-entries')
  @Roles('TENANT_ADMIN', 'EMPLOYEE')
  @ApiOperation({ summary: 'Get current user time entries' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of current user time entries',
  })
  async getMyEntries(
    @Query() queryDto: QueryTimeEntriesDto,
    @CurrentUser() user: any,
  ) {
    queryDto.userId = user.sub;
    return await this.timeTrackingService.findAll(queryDto, user.tenantId);
  }

  @Get('weekly-summary')
  @Roles('TENANT_ADMIN', 'EMPLOYEE')
  @ApiOperation({ summary: 'Get weekly time summary' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Weekly time summary',
  })
  async getWeeklySummary(
    @Query('weekStart') weekStart: string,
    @CurrentUser() user: any,
  ) {
    const startDate = weekStart ? new Date(weekStart) : this.getWeekStart();
    return await this.timeTrackingService.getWeeklySummary(
      user.sub,
      startDate,
      user.tenantId,
    );
  }

  @Get(':id')
  @Roles('TENANT_ADMIN', 'EMPLOYEE')
  @ApiOperation({ summary: 'Get time entry by ID' })
  @ApiParam({ name: 'id', description: 'Time entry UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Time entry details',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Time entry not found',
  })
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return await this.timeTrackingService.findOne(id, user.tenantId);
  }

  @Patch(':id')
  @Roles('TENANT_ADMIN', 'EMPLOYEE')
  @ApiOperation({ summary: 'Update time entry' })
  @ApiParam({ name: 'id', description: 'Time entry UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Time entry updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Time entry not found',
  })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateTimeEntryDto,
    @CurrentUser() user: any,
  ) {
    return await this.timeTrackingService.update(id, updateDto, user.tenantId);
  }

  @Delete(':id')
  @Roles('TENANT_ADMIN', 'EMPLOYEE')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete time entry' })
  @ApiParam({ name: 'id', description: 'Time entry UUID' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Time entry deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Time entry not found',
  })
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    await this.timeTrackingService.remove(id, user.tenantId);
  }

  @Post(':id/submit')
  @Roles('TENANT_ADMIN', 'EMPLOYEE')
  @ApiOperation({ summary: 'Submit time entry for approval' })
  @ApiParam({ name: 'id', description: 'Time entry UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Time entry submitted successfully',
  })
  async submit(@Param('id') id: string, @CurrentUser() user: any) {
    return await this.timeTrackingService.submit(id, user.tenantId);
  }

  @Post(':id/approve')
  @Roles('TENANT_ADMIN')
  @ApiOperation({ summary: 'Approve time entry' })
  @ApiParam({ name: 'id', description: 'Time entry UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Time entry approved successfully',
  })
  async approve(@Param('id') id: string, @CurrentUser() user: any) {
    return await this.timeTrackingService.approve(
      id,
      user.sub,
      user.tenantId,
    );
  }

  @Post(':id/reject')
  @Roles('TENANT_ADMIN')
  @ApiOperation({ summary: 'Reject time entry' })
  @ApiParam({ name: 'id', description: 'Time entry UUID' })
  @ApiBody({ type: RejectTimeEntryDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Time entry rejected successfully',
  })
  async reject(
    @Param('id') id: string,
    @Body() rejectDto: RejectTimeEntryDto,
    @CurrentUser() user: any,
  ) {
    return await this.timeTrackingService.reject(
      id,
      rejectDto.reason,
      user.sub,
      user.tenantId,
    );
  }

  private getWeekStart(): Date {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    return new Date(now.setDate(diff));
  }
}

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { CourseSessionsService } from './course-sessions.service';
import { CreateCourseSessionDto } from './dto/create-course-session.dto';
import { UpdateCourseSessionDto } from './dto/update-course-session.dto';
import { QueryCourseSessionsDto } from './dto/query-course-sessions.dto';
import {
  CourseSessionResponseDto,
  PaginatedCourseSessionsResponseDto,
} from './dto/course-session-response.dto';
import { Roles } from '@/common/decorators/roles.decorator';
import { plainToInstance } from 'class-transformer';

@ApiTags('Course Sessions')
@ApiBearerAuth()
@Controller('course-sessions')
@UseInterceptors(ClassSerializerInterceptor)
export class CourseSessionsController {
  constructor(private readonly sessionsService: CourseSessionsService) {}

  @Post()
  @Roles('TENANT_ADMIN')
  @ApiOperation({ summary: 'Create a new course session' })
  @ApiResponse({
    status: 201,
    description: 'Session created successfully',
    type: CourseSessionResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  @ApiResponse({ status: 409, description: 'Session code already exists' })
  async create(
    @Body() createSessionDto: CreateCourseSessionDto,
  ): Promise<CourseSessionResponseDto> {
    const session = await this.sessionsService.create(createSessionDto);
    return plainToInstance(CourseSessionResponseDto, session, { excludeExtraneousValues: true });
  }

  @Get()
  @Roles('TENANT_ADMIN', 'TENANT_USER')
  @ApiOperation({ summary: 'Get all sessions with pagination and filtering' })
  @ApiResponse({
    status: 200,
    description: 'Sessions retrieved successfully',
    type: PaginatedCourseSessionsResponseDto,
  })
  async findAll(
    @Query() queryDto: QueryCourseSessionsDto,
  ): Promise<PaginatedCourseSessionsResponseDto> {
    const result = await this.sessionsService.findAll(queryDto);
    return {
      ...result,
      data: plainToInstance(CourseSessionResponseDto, result.data, {
        excludeExtraneousValues: true,
      }),
    };
  }

  @Get('upcoming/course/:courseId')
  @Roles('TENANT_ADMIN', 'TENANT_USER')
  @ApiOperation({ summary: 'Get upcoming sessions for a specific course' })
  @ApiParam({ name: 'courseId', description: 'Course ID' })
  @ApiResponse({
    status: 200,
    description: 'Upcoming sessions retrieved successfully',
    type: [CourseSessionResponseDto],
  })
  async getUpcomingSessions(
    @Param('courseId') courseId: string,
  ): Promise<CourseSessionResponseDto[]> {
    const sessions = await this.sessionsService.getUpcomingSessions(courseId);
    return plainToInstance(CourseSessionResponseDto, sessions, { excludeExtraneousValues: true });
  }

  @Get(':id')
  @Roles('TENANT_ADMIN', 'TENANT_USER')
  @ApiOperation({ summary: 'Get a session by ID' })
  @ApiParam({ name: 'id', description: 'Session ID' })
  @ApiResponse({
    status: 200,
    description: 'Session retrieved successfully',
    type: CourseSessionResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async findOne(@Param('id') id: string): Promise<CourseSessionResponseDto> {
    const session = await this.sessionsService.findOne(id, true);
    return plainToInstance(CourseSessionResponseDto, session, { excludeExtraneousValues: true });
  }

  @Get('code/:code')
  @Roles('TENANT_ADMIN', 'TENANT_USER')
  @ApiOperation({ summary: 'Get a session by code' })
  @ApiParam({ name: 'code', description: 'Session code' })
  @ApiResponse({
    status: 200,
    description: 'Session retrieved successfully',
    type: CourseSessionResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async findByCode(@Param('code') code: string): Promise<CourseSessionResponseDto> {
    const session = await this.sessionsService.findByCode(code, true);
    return plainToInstance(CourseSessionResponseDto, session, { excludeExtraneousValues: true });
  }

  @Patch(':id')
  @Roles('TENANT_ADMIN')
  @ApiOperation({ summary: 'Update a session' })
  @ApiParam({ name: 'id', description: 'Session ID' })
  @ApiResponse({
    status: 200,
    description: 'Session updated successfully',
    type: CourseSessionResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Session not found' })
  @ApiResponse({ status: 409, description: 'Session code already exists' })
  async update(
    @Param('id') id: string,
    @Body() updateSessionDto: UpdateCourseSessionDto,
  ): Promise<CourseSessionResponseDto> {
    const session = await this.sessionsService.update(id, updateSessionDto);
    return plainToInstance(CourseSessionResponseDto, session, { excludeExtraneousValues: true });
  }

  @Delete(':id')
  @Roles('TENANT_ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a session (soft delete)' })
  @ApiParam({ name: 'id', description: 'Session ID' })
  @ApiResponse({ status: 204, description: 'Session deleted successfully' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.sessionsService.remove(id);
  }

  @Post(':id/start')
  @Roles('TENANT_ADMIN')
  @ApiOperation({ summary: 'Start a session (change status to IN_PROGRESS)' })
  @ApiParam({ name: 'id', description: 'Session ID' })
  @ApiResponse({
    status: 200,
    description: 'Session started successfully',
    type: CourseSessionResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Session not found' })
  @ApiResponse({ status: 400, description: 'Session cannot be started' })
  async startSession(@Param('id') id: string): Promise<CourseSessionResponseDto> {
    const session = await this.sessionsService.startSession(id);
    return plainToInstance(CourseSessionResponseDto, session, { excludeExtraneousValues: true });
  }

  @Post(':id/complete')
  @Roles('TENANT_ADMIN')
  @ApiOperation({ summary: 'Complete a session' })
  @ApiParam({ name: 'id', description: 'Session ID' })
  @ApiResponse({
    status: 200,
    description: 'Session completed successfully',
    type: CourseSessionResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Session not found' })
  @ApiResponse({ status: 400, description: 'Session cannot be completed' })
  async completeSession(@Param('id') id: string): Promise<CourseSessionResponseDto> {
    const session = await this.sessionsService.completeSession(id);
    return plainToInstance(CourseSessionResponseDto, session, { excludeExtraneousValues: true });
  }

  @Post(':id/cancel')
  @Roles('TENANT_ADMIN')
  @ApiOperation({ summary: 'Cancel a session' })
  @ApiParam({ name: 'id', description: 'Session ID' })
  @ApiResponse({
    status: 200,
    description: 'Session cancelled successfully',
    type: CourseSessionResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Session not found' })
  @ApiResponse({ status: 400, description: 'Session cannot be cancelled' })
  async cancelSession(@Param('id') id: string): Promise<CourseSessionResponseDto> {
    const session = await this.sessionsService.cancelSession(id);
    return plainToInstance(CourseSessionResponseDto, session, { excludeExtraneousValues: true });
  }

  @Post(':id/toggle-registration')
  @Roles('TENANT_ADMIN')
  @ApiOperation({ summary: 'Open/close registration for a session' })
  @ApiParam({ name: 'id', description: 'Session ID' })
  @ApiResponse({
    status: 200,
    description: 'Registration status toggled successfully',
    type: CourseSessionResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async toggleRegistration(@Param('id') id: string): Promise<CourseSessionResponseDto> {
    const session = await this.sessionsService.toggleRegistration(id);
    return plainToInstance(CourseSessionResponseDto, session, { excludeExtraneousValues: true });
  }
}

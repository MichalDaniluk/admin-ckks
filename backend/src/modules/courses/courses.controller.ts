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
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { QueryCoursesDto } from './dto/query-courses.dto';
import { CourseResponseDto, PaginatedCoursesResponseDto } from './dto/course-response.dto';
import { Roles } from '@/common/decorators/roles.decorator';
import { plainToInstance } from 'class-transformer';

@ApiTags('Courses')
@ApiBearerAuth()
@Controller('courses')
@UseInterceptors(ClassSerializerInterceptor)
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  @Roles('TENANT_ADMIN')
  @ApiOperation({ summary: 'Create a new course' })
  @ApiResponse({
    status: 201,
    description: 'Course created successfully',
    type: CourseResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 409, description: 'Course code already exists' })
  async create(@Body() createCourseDto: CreateCourseDto): Promise<CourseResponseDto> {
    const course = await this.coursesService.create(createCourseDto);
    return plainToInstance(CourseResponseDto, course, { excludeExtraneousValues: true });
  }

  @Get()
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Get all courses with pagination and filtering' })
  @ApiResponse({
    status: 200,
    description: 'Courses retrieved successfully',
    type: PaginatedCoursesResponseDto,
  })
  async findAll(@Query() queryDto: QueryCoursesDto): Promise<PaginatedCoursesResponseDto> {
    const result = await this.coursesService.findAll(queryDto);
    return {
      ...result,
      data: plainToInstance(CourseResponseDto, result.data, { excludeExtraneousValues: true }),
    };
  }

  @Get('published')
  @Roles('TENANT_ADMIN', 'TENANT_USER')
  @ApiOperation({ summary: 'Get published courses (available for enrollment)' })
  @ApiResponse({
    status: 200,
    description: 'Published courses retrieved successfully',
    type: PaginatedCoursesResponseDto,
  })
  async getPublishedCourses(
    @Query() queryDto: QueryCoursesDto,
  ): Promise<PaginatedCoursesResponseDto> {
    const result = await this.coursesService.getPublishedCourses(queryDto);
    return {
      ...result,
      data: plainToInstance(CourseResponseDto, result.data, { excludeExtraneousValues: true }),
    };
  }

  @Get(':id')
  @Roles('TENANT_ADMIN', 'TENANT_USER')
  @ApiOperation({ summary: 'Get a course by ID' })
  @ApiParam({ name: 'id', description: 'Course ID' })
  @ApiResponse({
    status: 200,
    description: 'Course retrieved successfully',
    type: CourseResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async findOne(@Param('id') id: string): Promise<CourseResponseDto> {
    const course = await this.coursesService.findOne(id);
    return plainToInstance(CourseResponseDto, course, { excludeExtraneousValues: true });
  }

  @Get('code/:code')
  @Roles('TENANT_ADMIN', 'TENANT_USER')
  @ApiOperation({ summary: 'Get a course by code' })
  @ApiParam({ name: 'code', description: 'Course code' })
  @ApiResponse({
    status: 200,
    description: 'Course retrieved successfully',
    type: CourseResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async findByCode(@Param('code') code: string): Promise<CourseResponseDto> {
    const course = await this.coursesService.findByCode(code);
    return plainToInstance(CourseResponseDto, course, { excludeExtraneousValues: true });
  }

  @Patch(':id')
  @Roles('TENANT_ADMIN')
  @ApiOperation({ summary: 'Update a course' })
  @ApiParam({ name: 'id', description: 'Course ID' })
  @ApiResponse({
    status: 200,
    description: 'Course updated successfully',
    type: CourseResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Course not found' })
  @ApiResponse({ status: 409, description: 'Course code already exists' })
  async update(
    @Param('id') id: string,
    @Body() updateCourseDto: UpdateCourseDto,
  ): Promise<CourseResponseDto> {
    const course = await this.coursesService.update(id, updateCourseDto);
    return plainToInstance(CourseResponseDto, course, { excludeExtraneousValues: true });
  }

  @Delete(':id')
  @Roles('TENANT_ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a course (soft delete)' })
  @ApiParam({ name: 'id', description: 'Course ID' })
  @ApiResponse({ status: 204, description: 'Course deleted successfully' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.coursesService.remove(id);
  }

  @Post(':id/publish')
  @Roles('TENANT_ADMIN')
  @ApiOperation({ summary: 'Publish a course' })
  @ApiParam({ name: 'id', description: 'Course ID' })
  @ApiResponse({
    status: 200,
    description: 'Course published successfully',
    type: CourseResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Course not found' })
  @ApiResponse({ status: 400, description: 'Course is already published' })
  async publish(@Param('id') id: string): Promise<CourseResponseDto> {
    const course = await this.coursesService.publish(id);
    return plainToInstance(CourseResponseDto, course, { excludeExtraneousValues: true });
  }

  @Post(':id/unpublish')
  @Roles('TENANT_ADMIN')
  @ApiOperation({ summary: 'Unpublish a course (set to draft)' })
  @ApiParam({ name: 'id', description: 'Course ID' })
  @ApiResponse({
    status: 200,
    description: 'Course unpublished successfully',
    type: CourseResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Course not found' })
  @ApiResponse({ status: 400, description: 'Course is not published' })
  async unpublish(@Param('id') id: string): Promise<CourseResponseDto> {
    const course = await this.coursesService.unpublish(id);
    return plainToInstance(CourseResponseDto, course, { excludeExtraneousValues: true });
  }

  @Post(':id/archive')
  @Roles('TENANT_ADMIN')
  @ApiOperation({ summary: 'Archive a course' })
  @ApiParam({ name: 'id', description: 'Course ID' })
  @ApiResponse({
    status: 200,
    description: 'Course archived successfully',
    type: CourseResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Course not found' })
  @ApiResponse({ status: 400, description: 'Course is already archived' })
  async archive(@Param('id') id: string): Promise<CourseResponseDto> {
    const course = await this.coursesService.archive(id);
    return plainToInstance(CourseResponseDto, course, { excludeExtraneousValues: true });
  }

  @Post(':id/toggle-featured')
  @Roles('TENANT_ADMIN')
  @ApiOperation({ summary: 'Toggle featured status of a course' })
  @ApiParam({ name: 'id', description: 'Course ID' })
  @ApiResponse({
    status: 200,
    description: 'Course featured status toggled successfully',
    type: CourseResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async toggleFeatured(@Param('id') id: string): Promise<CourseResponseDto> {
    const course = await this.coursesService.toggleFeatured(id);
    return plainToInstance(CourseResponseDto, course, { excludeExtraneousValues: true });
  }
}

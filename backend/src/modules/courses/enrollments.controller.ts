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
import { EnrollmentsService } from './enrollments.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { QueryEnrollmentsDto } from './dto/query-enrollments.dto';
import {
  EnrollmentResponseDto,
  PaginatedEnrollmentsResponseDto,
} from './dto/enrollment-response.dto';
import { Roles } from '@/common/decorators/roles.decorator';
import { plainToInstance } from 'class-transformer';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

class RecordPaymentDto {
  amount: number;
  reference?: string;
}

class IssueCertificateDto {
  certificateNumber: string;
  certificateUrl?: string;
}

class UpdateGradeDto {
  finalGrade: number;
  passed: boolean;
}

class CancelEnrollmentDto {
  reason?: string;
}

@ApiTags('Enrollments')
@ApiBearerAuth()
@Controller('enrollments')
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Post()
  @Roles('TENANT_ADMIN')
  @ApiOperation({ summary: 'Create a new enrollment' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Enrollment created successfully',
    type: EnrollmentResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Enrollment code already exists or student already enrolled',
  })
  async create(
    @Body() createEnrollmentDto: CreateEnrollmentDto,
    @CurrentUser() user: any,
  ): Promise<EnrollmentResponseDto> {
    const enrollment = await this.enrollmentsService.create(
      createEnrollmentDto,
      user.sub,
    );
    return plainToInstance(EnrollmentResponseDto, enrollment, {
      excludeExtraneousValues: true,
    });
  }

  @Get()
  @Roles('TENANT_ADMIN')
  @ApiOperation({ summary: 'Get all enrollments with pagination and filtering' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of enrollments',
    type: PaginatedEnrollmentsResponseDto,
  })
  async findAll(
    @Query() queryDto: QueryEnrollmentsDto,
  ): Promise<PaginatedEnrollmentsResponseDto> {
    const result = await this.enrollmentsService.findAll(queryDto);
    return {
      ...result,
      data: plainToInstance(EnrollmentResponseDto, result.data, {
        excludeExtraneousValues: true,
      }),
    };
  }

  @Get(':id')
  @Roles('TENANT_ADMIN')
  @ApiOperation({ summary: 'Get enrollment by ID' })
  @ApiParam({ name: 'id', description: 'Enrollment UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Enrollment details',
    type: EnrollmentResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Enrollment not found',
  })
  async findOne(@Param('id') id: string): Promise<EnrollmentResponseDto> {
    const enrollment = await this.enrollmentsService.findOne(id, true);
    return plainToInstance(EnrollmentResponseDto, enrollment, {
      excludeExtraneousValues: true,
    });
  }

  @Patch(':id')
  @Roles('TENANT_ADMIN')
  @ApiOperation({ summary: 'Update enrollment' })
  @ApiParam({ name: 'id', description: 'Enrollment UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Enrollment updated successfully',
    type: EnrollmentResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Enrollment not found',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Enrollment code already exists',
  })
  async update(
    @Param('id') id: string,
    @Body() updateEnrollmentDto: UpdateEnrollmentDto,
  ): Promise<EnrollmentResponseDto> {
    const enrollment = await this.enrollmentsService.update(id, updateEnrollmentDto);
    return plainToInstance(EnrollmentResponseDto, enrollment, {
      excludeExtraneousValues: true,
    });
  }

  @Delete(':id')
  @Roles('TENANT_ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete enrollment (soft delete)' })
  @ApiParam({ name: 'id', description: 'Enrollment UUID' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Enrollment deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Enrollment not found',
  })
  async remove(@Param('id') id: string): Promise<void> {
    await this.enrollmentsService.remove(id);
  }

  @Post(':id/confirm')
  @Roles('TENANT_ADMIN')
  @ApiOperation({ summary: 'Confirm pending enrollment' })
  @ApiParam({ name: 'id', description: 'Enrollment UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Enrollment confirmed successfully',
    type: EnrollmentResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Only pending enrollments can be confirmed',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Enrollment not found',
  })
  async confirm(@Param('id') id: string): Promise<EnrollmentResponseDto> {
    const enrollment = await this.enrollmentsService.confirmEnrollment(id);
    return plainToInstance(EnrollmentResponseDto, enrollment, {
      excludeExtraneousValues: true,
    });
  }

  @Post(':id/cancel')
  @Roles('TENANT_ADMIN')
  @ApiOperation({ summary: 'Cancel enrollment' })
  @ApiParam({ name: 'id', description: 'Enrollment UUID' })
  @ApiBody({ type: CancelEnrollmentDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Enrollment cancelled successfully',
    type: EnrollmentResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Enrollment cannot be cancelled',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Enrollment not found',
  })
  async cancel(
    @Param('id') id: string,
    @Body() cancelDto: CancelEnrollmentDto,
  ): Promise<EnrollmentResponseDto> {
    const enrollment = await this.enrollmentsService.cancelEnrollment(
      id,
      cancelDto.reason,
    );
    return plainToInstance(EnrollmentResponseDto, enrollment, {
      excludeExtraneousValues: true,
    });
  }

  @Post(':id/complete')
  @Roles('TENANT_ADMIN')
  @ApiOperation({ summary: 'Complete enrollment' })
  @ApiParam({ name: 'id', description: 'Enrollment UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Enrollment completed successfully',
    type: EnrollmentResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Only confirmed enrollments can be completed',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Enrollment not found',
  })
  async complete(@Param('id') id: string): Promise<EnrollmentResponseDto> {
    const enrollment = await this.enrollmentsService.completeEnrollment(id);
    return plainToInstance(EnrollmentResponseDto, enrollment, {
      excludeExtraneousValues: true,
    });
  }

  @Post(':id/payment')
  @Roles('TENANT_ADMIN')
  @ApiOperation({ summary: 'Record payment for enrollment' })
  @ApiParam({ name: 'id', description: 'Enrollment UUID' })
  @ApiBody({ type: RecordPaymentDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Payment recorded successfully',
    type: EnrollmentResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid payment amount or enrollment already fully paid',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Enrollment not found',
  })
  async recordPayment(
    @Param('id') id: string,
    @Body() paymentDto: RecordPaymentDto,
  ): Promise<EnrollmentResponseDto> {
    const enrollment = await this.enrollmentsService.recordPayment(
      id,
      paymentDto.amount,
      paymentDto.reference,
    );
    return plainToInstance(EnrollmentResponseDto, enrollment, {
      excludeExtraneousValues: true,
    });
  }

  @Post(':id/certificate')
  @Roles('TENANT_ADMIN')
  @ApiOperation({ summary: 'Issue certificate for enrollment' })
  @ApiParam({ name: 'id', description: 'Enrollment UUID' })
  @ApiBody({ type: IssueCertificateDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Certificate issued successfully',
    type: EnrollmentResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description:
      'Certificate can only be issued for completed, passed, and fully paid enrollments',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Enrollment not found',
  })
  async issueCertificate(
    @Param('id') id: string,
    @Body() certificateDto: IssueCertificateDto,
  ): Promise<EnrollmentResponseDto> {
    const enrollment = await this.enrollmentsService.issueCertificate(
      id,
      certificateDto.certificateNumber,
      certificateDto.certificateUrl,
    );
    return plainToInstance(EnrollmentResponseDto, enrollment, {
      excludeExtraneousValues: true,
    });
  }

  @Patch(':id/grade')
  @Roles('TENANT_ADMIN')
  @ApiOperation({ summary: 'Update enrollment grade and pass status' })
  @ApiParam({ name: 'id', description: 'Enrollment UUID' })
  @ApiBody({ type: UpdateGradeDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Grade updated successfully',
    type: EnrollmentResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Can only grade completed enrollments',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Enrollment not found',
  })
  async updateGrade(
    @Param('id') id: string,
    @Body() gradeDto: UpdateGradeDto,
  ): Promise<EnrollmentResponseDto> {
    const enrollment = await this.enrollmentsService.updateGrade(
      id,
      gradeDto.finalGrade,
      gradeDto.passed,
    );
    return plainToInstance(EnrollmentResponseDto, enrollment, {
      excludeExtraneousValues: true,
    });
  }
}

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@ApiTags('Payments')
@ApiBearerAuth()
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @Roles('TENANT_ADMIN')
  @ApiOperation({ summary: 'Create a new payment record' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Payment created successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  async create(
    @Body() createPaymentDto: CreatePaymentDto,
    @CurrentUser() user: any,
  ) {
    return this.paymentsService.create(createPaymentDto, user.sub);
  }

  @Get('enrollment/:enrollmentId')
  @Roles('TENANT_ADMIN')
  @ApiOperation({ summary: 'Get all payments for an enrollment' })
  @ApiParam({ name: 'enrollmentId', description: 'Enrollment ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of payments for the enrollment',
  })
  async findByEnrollment(@Param('enrollmentId') enrollmentId: string) {
    return this.paymentsService.findByEnrollment(enrollmentId);
  }

  @Get('enrollment/:enrollmentId/summary')
  @Roles('TENANT_ADMIN')
  @ApiOperation({ summary: 'Get payment summary for an enrollment' })
  @ApiParam({ name: 'enrollmentId', description: 'Enrollment ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Payment summary',
  })
  async getPaymentSummary(@Param('enrollmentId') enrollmentId: string) {
    return this.paymentsService.getPaymentSummary(enrollmentId);
  }

  @Get(':id')
  @Roles('TENANT_ADMIN')
  @ApiOperation({ summary: 'Get payment by ID' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Payment details',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Payment not found',
  })
  async findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(id);
  }

  @Patch(':id')
  @Roles('TENANT_ADMIN')
  @ApiOperation({ summary: 'Update payment' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Payment updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Payment not found',
  })
  async update(
    @Param('id') id: string,
    @Body() updatePaymentDto: UpdatePaymentDto,
  ) {
    return this.paymentsService.update(id, updatePaymentDto);
  }

  @Delete(':id')
  @Roles('TENANT_ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete payment' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Payment deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Payment not found',
  })
  async remove(@Param('id') id: string) {
    await this.paymentsService.remove(id);
  }
}

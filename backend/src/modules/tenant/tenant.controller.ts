import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { TenantService } from './tenant.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { TenantResponseDto } from './dto/tenant-response.dto';
import { plainToInstance } from 'class-transformer';

@ApiTags('tenants')
@Controller('tenants')
@ApiBearerAuth()
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Post()
  @ApiOperation({ summary: 'Create new tenant (Super Admin only)' })
  @ApiResponse({
    status: 201,
    description: 'Tenant created successfully',
    type: TenantResponseDto,
  })
  @ApiResponse({ status: 409, description: 'Tenant slug already exists' })
  async create(@Body() createTenantDto: CreateTenantDto) {
    const tenant = await this.tenantService.create(createTenantDto);
    return plainToInstance(TenantResponseDto, tenant);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tenants (Super Admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'subscriptionStatus', required: false, type: String })
  @ApiQuery({ name: 'subscriptionPlan', required: false, type: String })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiResponse({
    status: 200,
    description: 'List of tenants',
    type: [TenantResponseDto],
  })
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('search') search?: string,
    @Query('subscriptionStatus') subscriptionStatus?: string,
    @Query('subscriptionPlan') subscriptionPlan?: string,
    @Query('isActive') isActive?: boolean,
  ) {
    const filters = {
      search,
      subscriptionStatus,
      subscriptionPlan,
      isActive,
    };

    const { data, total } = await this.tenantService.findAll(page, limit, filters);

    return {
      data: data.map(tenant => plainToInstance(TenantResponseDto, tenant)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get tenant by ID (Super Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Tenant found',
    type: TenantResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const tenant = await this.tenantService.findOne(id);
    return plainToInstance(TenantResponseDto, tenant);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update tenant (Super Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Tenant updated successfully',
    type: TenantResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTenantDto: UpdateTenantDto,
  ) {
    const tenant = await this.tenantService.update(id, updateTenantDto);
    return plainToInstance(TenantResponseDto, tenant);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete tenant (Super Admin only)' })
  @ApiResponse({ status: 204, description: 'Tenant deleted successfully' })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.tenantService.remove(id);
  }

  @Post(':id/activate')
  @ApiOperation({ summary: 'Activate tenant subscription (Super Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Subscription activated',
    type: TenantResponseDto,
  })
  async activateSubscription(@Param('id', ParseUUIDPipe) id: string) {
    const tenant = await this.tenantService.activateSubscription(id);
    return plainToInstance(TenantResponseDto, tenant);
  }

  @Post(':id/suspend')
  @ApiOperation({ summary: 'Suspend tenant (Super Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Tenant suspended',
    type: TenantResponseDto,
  })
  async suspendTenant(@Param('id', ParseUUIDPipe) id: string) {
    const tenant = await this.tenantService.suspendTenant(id);
    return plainToInstance(TenantResponseDto, tenant);
  }

  @Get(':id/usage/:type')
  @ApiOperation({ summary: 'Check usage limits (Super Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Usage limits information',
  })
  async checkUsageLimits(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('type') type: 'users' | 'courses' | 'students',
  ) {
    return this.tenantService.checkUsageLimits(id, type);
  }
}

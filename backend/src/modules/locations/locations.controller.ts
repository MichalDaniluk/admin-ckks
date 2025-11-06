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
import { LocationsService } from './locations.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { QueryLocationsDto } from './dto/query-locations.dto';
import { LocationResponseDto, PaginatedLocationsResponseDto } from './dto/location-response.dto';
import { Roles } from '@/common/decorators/roles.decorator';
import { plainToInstance } from 'class-transformer';

@ApiTags('Locations')
@ApiBearerAuth()
@Controller('locations')
@UseInterceptors(ClassSerializerInterceptor)
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Post()
  @Roles('TENANT_ADMIN')
  @ApiOperation({ summary: 'Create a new location' })
  @ApiResponse({
    status: 201,
    description: 'Location created successfully',
    type: LocationResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async create(@Body() createLocationDto: CreateLocationDto): Promise<LocationResponseDto> {
    const location = await this.locationsService.create(createLocationDto);
    return plainToInstance(LocationResponseDto, location, { excludeExtraneousValues: true });
  }

  @Get()
  @Roles('TENANT_ADMIN', 'TENANT_USER')
  @ApiOperation({ summary: 'Get all locations with pagination and filtering' })
  @ApiResponse({
    status: 200,
    description: 'Locations retrieved successfully',
    type: PaginatedLocationsResponseDto,
  })
  async findAll(@Query() queryDto: QueryLocationsDto): Promise<PaginatedLocationsResponseDto> {
    const result = await this.locationsService.findAll(queryDto);
    return {
      ...result,
      data: plainToInstance(LocationResponseDto, result.data, { excludeExtraneousValues: true }),
    };
  }

  @Get(':id')
  @Roles('TENANT_ADMIN', 'TENANT_USER')
  @ApiOperation({ summary: 'Get a location by ID' })
  @ApiParam({ name: 'id', description: 'Location ID' })
  @ApiResponse({
    status: 200,
    description: 'Location retrieved successfully',
    type: LocationResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Location not found' })
  async findOne(@Param('id') id: string): Promise<LocationResponseDto> {
    const location = await this.locationsService.findOne(id);
    return plainToInstance(LocationResponseDto, location, { excludeExtraneousValues: true });
  }

  @Patch(':id')
  @Roles('TENANT_ADMIN')
  @ApiOperation({ summary: 'Update a location' })
  @ApiParam({ name: 'id', description: 'Location ID' })
  @ApiResponse({
    status: 200,
    description: 'Location updated successfully',
    type: LocationResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Location not found' })
  async update(
    @Param('id') id: string,
    @Body() updateLocationDto: UpdateLocationDto,
  ): Promise<LocationResponseDto> {
    const location = await this.locationsService.update(id, updateLocationDto);
    return plainToInstance(LocationResponseDto, location, { excludeExtraneousValues: true });
  }

  @Delete(':id')
  @Roles('TENANT_ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a location (soft delete)' })
  @ApiParam({ name: 'id', description: 'Location ID' })
  @ApiResponse({ status: 204, description: 'Location deleted successfully' })
  @ApiResponse({ status: 404, description: 'Location not found' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.locationsService.remove(id);
  }
}

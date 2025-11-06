import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Location } from './entities/location.entity';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { QueryLocationsDto } from './dto/query-locations.dto';
import { TenantContextService } from '@/common/tenant/tenant-context.service';

@Injectable()
export class LocationsService {
  constructor(
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
    private readonly tenantContext: TenantContextService,
  ) {}

  /**
   * Create a new location
   */
  async create(createLocationDto: CreateLocationDto): Promise<Location> {
    const tenantId = this.tenantContext.getTenantId();

    if (!tenantId) {
      throw new BadRequestException('Tenant context not found');
    }

    // Create location with tenant ID
    const location = this.locationRepository.create({
      ...createLocationDto,
      tenantId,
    });

    return this.locationRepository.save(location);
  }

  /**
   * Find all locations with pagination and filtering
   */
  async findAll(queryDto: QueryLocationsDto): Promise<{
    data: Location[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const tenantId = this.tenantContext.getTenantId();

    if (!tenantId) {
      throw new BadRequestException('Tenant context not found');
    }

    const { page, limit, search, type, city, isActive, sortBy, sortOrder } =
      queryDto;

    const skip = (page - 1) * limit;

    const queryBuilder = this.locationRepository
      .createQueryBuilder('location')
      .where('location.tenantId = :tenantId', { tenantId });

    // Apply filters
    if (search) {
      queryBuilder.andWhere(
        '(location.name ILIKE :search OR location.address ILIKE :search OR location.city ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (type) {
      queryBuilder.andWhere('location.type = :type', { type });
    }

    if (city) {
      queryBuilder.andWhere('location.city ILIKE :city', { city: `%${city}%` });
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('location.isActive = :isActive', { isActive });
    }

    // Apply sorting
    const sortField = `location.${sortBy}`;
    queryBuilder.orderBy(sortField, sortOrder);

    // Get total count
    const total = await queryBuilder.getCount();

    // Apply pagination
    queryBuilder.skip(skip).take(limit);

    // Get data
    const data = await queryBuilder.getMany();

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Find one location by ID
   */
  async findOne(id: string): Promise<Location> {
    const tenantId = this.tenantContext.getTenantId();

    if (!tenantId) {
      throw new BadRequestException('Tenant context not found');
    }

    const location = await this.locationRepository.findOne({
      where: { id, tenantId },
    });

    if (!location) {
      throw new NotFoundException(`Location with ID '${id}' not found`);
    }

    return location;
  }

  /**
   * Update location
   */
  async update(id: string, updateLocationDto: UpdateLocationDto): Promise<Location> {
    const location = await this.findOne(id);

    // Update location
    Object.assign(location, updateLocationDto);

    return this.locationRepository.save(location);
  }

  /**
   * Remove location (soft delete)
   */
  async remove(id: string): Promise<void> {
    const location = await this.findOne(id);
    await this.locationRepository.softRemove(location);
  }
}

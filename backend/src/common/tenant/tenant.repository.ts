import { Repository, FindOptionsWhere, FindManyOptions, FindOneOptions } from 'typeorm';
import { TenantBaseEntity } from '@/database/entities/base.entity';
import { TenantContextService } from './tenant-context.service';

/**
 * Base repository class that automatically filters queries by tenant_id
 * Extend this class for repositories of entities that extend TenantBaseEntity
 */
export class TenantRepository<T extends TenantBaseEntity> extends Repository<T> {
  constructor(private readonly tenantContext: TenantContextService) {
    super();
  }

  /**
   * Add tenant filter to where clause
   */
  private addTenantFilter(
    where?: FindOptionsWhere<T> | FindOptionsWhere<T>[],
  ): FindOptionsWhere<T> | FindOptionsWhere<T>[] {
    const tenantId = this.tenantContext.getTenantId();

    if (!tenantId) {
      // If no tenant context, return original where clause
      // This allows system-level queries
      return where;
    }

    // Handle array of where conditions
    if (Array.isArray(where)) {
      return where.map((condition) => ({
        ...condition,
        tenantId,
      } as FindOptionsWhere<T>));
    }

    // Handle single where condition
    return {
      ...where,
      tenantId,
    } as FindOptionsWhere<T>;
  }

  /**
   * Override find to automatically include tenant filter
   */
  async find(options?: FindManyOptions<T>): Promise<T[]> {
    return super.find({
      ...options,
      where: this.addTenantFilter(options?.where),
    });
  }

  /**
   * Override findOne to automatically include tenant filter
   */
  async findOne(options: FindOneOptions<T>): Promise<T | null> {
    return super.findOne({
      ...options,
      where: this.addTenantFilter(options.where),
    });
  }

  /**
   * Override findAndCount to automatically include tenant filter
   */
  async findAndCount(options?: FindManyOptions<T>): Promise<[T[], number]> {
    return super.findAndCount({
      ...options,
      where: this.addTenantFilter(options?.where),
    });
  }

  /**
   * Override findOneBy to automatically include tenant filter
   */
  async findOneBy(where: FindOptionsWhere<T>): Promise<T | null> {
    return super.findOneBy(this.addTenantFilter(where));
  }

  /**
   * Override findBy to automatically include tenant filter
   */
  async findBy(where: FindOptionsWhere<T>): Promise<T[]> {
    return super.findBy(this.addTenantFilter(where));
  }

  /**
   * Create QueryBuilder with automatic tenant filtering
   */
  createTenantQueryBuilder(alias: string) {
    const qb = this.createQueryBuilder(alias);
    const tenantId = this.tenantContext.getTenantId();

    if (tenantId) {
      qb.andWhere(`${alias}.tenantId = :tenantId`, { tenantId });
    }

    return qb;
  }
}

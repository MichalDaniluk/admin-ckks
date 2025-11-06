import { Entity, Column, Index } from 'typeorm';
import { TenantBaseEntity } from '@/database/entities/base.entity';

export enum LocationType {
  CLASSROOM = 'classroom',
  TRAINING_ROOM = 'training_room',
  CONFERENCE_ROOM = 'conference_room',
  ONLINE = 'online',
  EXTERNAL = 'external',
}

@Entity('location')
@Index('idx_location_tenant', ['tenantId'])
@Index('idx_location_name', ['name'])
@Index('idx_location_city', ['city'])
export class Location extends TenantBaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({
    type: 'enum',
    enum: LocationType,
    default: LocationType.TRAINING_ROOM,
  })
  type: LocationType;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  address: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city: string | null;

  @Column({ name: 'postal_code', type: 'varchar', length: 20, nullable: true })
  postalCode: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  country: string | null;

  @Column({ type: 'int', nullable: true })
  capacity: number | null;

  @Column({ name: 'has_projector', type: 'boolean', default: false })
  hasProjector: boolean;

  @Column({ name: 'has_whiteboard', type: 'boolean', default: false })
  hasWhiteboard: boolean;

  @Column({ name: 'has_computers', type: 'boolean', default: false })
  hasComputers: boolean;

  @Column({ name: 'has_wifi', type: 'boolean', default: false })
  hasWifi: boolean;

  @Column({ type: 'varchar', length: 500, nullable: true })
  accessibility: string | null;

  @Column({ name: 'parking_available', type: 'boolean', default: false })
  parkingAvailable: boolean;

  @Column({ name: 'public_transport', type: 'varchar', length: 500, nullable: true })
  publicTransport: string | null;

  @Column({ name: 'contact_person', type: 'varchar', length: 255, nullable: true })
  contactPerson: string | null;

  @Column({ name: 'contact_phone', type: 'varchar', length: 50, nullable: true })
  contactPhone: string | null;

  @Column({ name: 'contact_email', type: 'varchar', length: 255, nullable: true })
  contactEmail: string | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;
}

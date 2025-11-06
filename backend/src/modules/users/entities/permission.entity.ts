import { Entity, Column, Index, ManyToMany } from 'typeorm';
import { BaseEntity } from '@/database/entities/base.entity';
import { Role } from './role.entity';

@Entity('permission')
@Index('idx_permission_code', ['code'], { unique: true })
@Index('idx_permission_module', ['module'])
export class Permission extends BaseEntity {
  @Column({ name: 'permission_name', type: 'varchar', length: 100 })
  name: string;

  @Column({ name: 'permission_code', type: 'varchar', length: 100, unique: true })
  code: string; // courses.view, courses.create, students.view, etc.

  @Column({ type: 'varchar', length: 50 })
  module: string; // courses, students, finances, etc.

  @Column({ type: 'text', nullable: true })
  description: string;

  // Relations
  @ManyToMany(() => Role, role => role.permissions)
  roles: Role[];
}

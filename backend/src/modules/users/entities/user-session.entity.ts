import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { Exclude } from 'class-transformer';
import { BaseEntity } from '@/database/entities/base.entity';
import { User } from './user.entity';

@Entity('user_session')
@Index('idx_session_user', ['userId'])
@Index('idx_session_token', ['refreshToken'])
export class UserSession extends BaseEntity {
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'refresh_token', type: 'varchar', length: 500 })
  @Exclude()
  refreshToken: string;

  @Column({ name: 'device_info', type: 'varchar', length: 255, nullable: true })
  deviceInfo: string | null;

  @Column({ name: 'ip_address', type: 'varchar', length: 50, nullable: true })
  ipAddress: string | null;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent: string | null;

  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt: Date;

  @Column({ name: 'is_revoked', type: 'boolean', default: false })
  isRevoked: boolean;

  // Relations
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  // Helper method to check if session is expired
  isExpired(): boolean {
    return this.expiresAt < new Date() || this.isRevoked;
  }
}

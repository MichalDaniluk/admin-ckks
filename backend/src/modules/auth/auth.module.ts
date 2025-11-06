import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { User } from '@/modules/users/entities/user.entity';
import { UserSession } from '@/modules/users/entities/user-session.entity';
import { Tenant } from '@/modules/tenant/entities/tenant.entity';
import { Role } from '@/modules/users/entities/role.entity';
import { Permission } from '@/modules/users/entities/permission.entity';
import { getJwtConfig } from '@/config/jwt.config';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserSession, Tenant, Role, Permission]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: getJwtConfig,
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy, JwtRefreshStrategy],
  exports: [AuthService, JwtModule, PassportModule],
})
export class AuthModule {}

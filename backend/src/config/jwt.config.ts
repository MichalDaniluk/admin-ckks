import { ConfigService } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';

export const getJwtConfig = (configService: ConfigService): JwtModuleOptions => {
  return {
    secret: configService.get<string>('JWT_SECRET'),
    signOptions: {
      expiresIn: configService.get<string>('JWT_EXPIRATION', '15m'),
    },
  };
};

export const getJwtRefreshConfig = (configService: ConfigService) => {
  return {
    secret: configService.get<string>('JWT_REFRESH_SECRET'),
    expiresIn: configService.get<string>('JWT_REFRESH_EXPIRATION', '7d'),
  };
};

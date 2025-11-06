import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserSession } from '@/modules/users/entities/user-session.entity';
import { JwtRefreshPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    private configService: ConfigService,
    @InjectRepository(UserSession)
    private sessionRepository: Repository<UserSession>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_REFRESH_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(req: any, payload: JwtRefreshPayload) {
    const refreshToken = req.body?.refreshToken;

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not provided');
    }

    // Find session by ID
    const session = await this.sessionRepository.findOne({
      where: { id: payload.sessionId },
      relations: ['user', 'user.tenant', 'user.roles', 'user.roles.permissions'],
    });

    if (!session) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (session.isExpired()) {
      throw new UnauthorizedException('Refresh token expired');
    }

    // Verify that the refresh token matches
    if (session.refreshToken !== refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return {
      user: session.user,
      sessionId: session.id,
    };
  }
}

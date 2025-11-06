import { ApiProperty } from '@nestjs/swagger';

export class AuthResponse {
  @ApiProperty({ description: 'Access token (JWT)' })
  accessToken: string;

  @ApiProperty({ description: 'Refresh token' })
  refreshToken: string;

  @ApiProperty({ description: 'Token type', example: 'Bearer' })
  tokenType: string;

  @ApiProperty({ description: 'Access token expiration time in seconds', example: 900 })
  expiresIn: number;

  @ApiProperty({ description: 'User information' })
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    tenantId: string;
    roles: string[];
  };

  @ApiProperty({ description: 'Tenant information' })
  tenant: {
    id: string;
    slug: string;
    companyName: string;
  };
}

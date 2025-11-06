export interface JwtPayload {
  sub: string; // User ID
  email: string;
  tenantId: string;
  roles: string[]; // Role codes
  permissions: string[]; // Permission codes
  iat?: number; // Issued at
  exp?: number; // Expires at
}

export interface JwtRefreshPayload {
  sub: string; // User ID
  sessionId: string; // Session ID for token rotation
  iat?: number;
  exp?: number;
}

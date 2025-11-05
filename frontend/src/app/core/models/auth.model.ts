export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  slug: string;
  companyName: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
  tenant: Tenant;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  tenantId: string;
  roles: string[];
  isActive?: boolean;
  isVerified?: boolean;
}

export interface Tenant {
  id: string;
  slug: string;
  companyName: string;
  subscriptionPlan?: string;
  subscriptionStatus?: string;
  isActive?: boolean;
}

/**
 * User entity types for Food Store frontend
 */

export interface UserBase {
  email: string;
  first_name: string;
  last_name: string;
  role: 'customer' | 'admin' | 'staff';
}

export interface UserCreate extends UserBase {
  password: string;
}

export interface UserUpdate {
  email?: string;
  first_name?: string;
  last_name?: string;
  password?: string;
}

export interface UserResponse extends UserBase {
  id: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

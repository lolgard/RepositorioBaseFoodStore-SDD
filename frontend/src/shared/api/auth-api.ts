/**
 * Auth API functions for Food Store frontend
 * Uses the axios instance from @/shared/api/axios-instance
 * which handles JWT Bearer token injection and auto-refresh
 */

import api from '@/shared/api/axios-instance';
import type { UserLogin, UserCreate, UserResponse } from '@/entities/user/types';

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  user: UserResponse;
}

export interface RegisterResponse {
  message: string;
  user: UserResponse;
}

export interface RefreshResponse {
  access_token: string;
  refresh_token: string;
}

export async function loginUser(data: UserLogin): Promise<TokenResponse> {
  const response = await api.post('/auth/login', data);
  return response.data;
}

export async function registerUser(data: UserCreate): Promise<RegisterResponse> {
  const response = await api.post('/auth/register', data);
  return response.data;
}

export async function refreshAccessToken(refreshToken: string): Promise<RefreshResponse> {
  const response = await api.post('/auth/refresh', { refresh_token: refreshToken });
  return response.data;
}

export async function logoutUser(refreshToken: string): Promise<void> {
  await api.post('/auth/logout', { refresh_token: refreshToken });
}

export async function getCurrentUser(): Promise<UserResponse> {
  const response = await api.get('/auth/me');
  return response.data;
}

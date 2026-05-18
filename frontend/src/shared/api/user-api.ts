import api from '@/shared/api/axios-instance';

export interface AdminUserUpdate {
  first_name?: string;
  last_name?: string;
  email?: string;
  role?: string;
  is_active?: boolean;
  image_url?: string | null;
}

export interface AdminUserResponse {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
  image_url?: string | null;
  created_at: string;
  updated_at: string;
}

export async function listUsers(params?: {
  search?: string;
  role?: string;
  is_active?: boolean;
}): Promise<AdminUserResponse[]> {
  const response = await api.get('/users', { params });
  return response.data;
}

export async function getUserById(id: number): Promise<AdminUserResponse> {
  const response = await api.get(`/users/${id}`);
  return response.data;
}

export async function updateUser(id: number, data: AdminUserUpdate): Promise<AdminUserResponse> {
  const response = await api.put(`/users/${id}`, data);
  return response.data;
}

export async function deactivateUser(id: number): Promise<void> {
  await api.delete(`/users/${id}`);
}

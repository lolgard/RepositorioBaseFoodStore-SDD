/**
 * Admin system configuration API functions.
 */
import api from '@/shared/api/axios-instance';

export interface ConfigResponse {
  key: string;
  value: string;
  description: string | null;
  updated_at: string;
}

export async function listConfigs(): Promise<ConfigResponse[]> {
  const response = await api.get<ConfigResponse[]>('/admin/config/');
  return response.data;
}

export async function updateConfig(key: string, value: string): Promise<ConfigResponse> {
  const response = await api.put<ConfigResponse>(`/admin/config/${key}`, { value });
  return response.data;
}

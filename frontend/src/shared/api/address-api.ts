import api from '@/shared/api/axios-instance';
import type { Address, AddressCreate, AddressUpdate } from '@/entities/address/types';

export async function listAddresses(): Promise<Address[]> {
  const response = await api.get<Address[]>('/addresses/');
  return response.data;
}

export async function createAddress(data: AddressCreate): Promise<Address> {
  const response = await api.post<Address>('/addresses/', data);
  return response.data;
}

export async function getAddress(id: number): Promise<Address> {
  const response = await api.get<Address>(`/addresses/${id}`);
  return response.data;
}

export async function updateAddress(id: number, data: AddressUpdate): Promise<Address> {
  const response = await api.put<Address>(`/addresses/${id}`, data);
  return response.data;
}

export async function deleteAddress(id: number): Promise<void> {
  await api.delete(`/addresses/${id}`);
}

export async function setDefaultAddress(id: number): Promise<Address> {
  const response = await api.put<Address>(`/addresses/${id}/default`);
  return response.data;
}

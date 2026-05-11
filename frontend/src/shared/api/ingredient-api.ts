/**
 * Ingredient API functions for Food Store frontend.
 */

import api from '@/shared/api/axios-instance';
import type { Ingredient, IngredientCreate, IngredientListResponse, IngredientUpdate } from '@/entities/ingredient/types';

/**
 * List ingredients with optional filters.
 */
export async function listIngredients(params?: {
  es_alergeno?: boolean;
  search?: string;
  skip?: number;
  limit?: number;
}): Promise<IngredientListResponse> {
  const response = await api.get('/ingredients', { params });
  return response.data;
}

/**
 * Get a single ingredient by ID.
 */
export async function getIngredientById(id: number): Promise<Ingredient> {
  const response = await api.get(`/ingredients/${id}`);
  return response.data;
}

/**
 * Create a new ingredient (requires STAFF or ADMIN role).
 */
export async function createIngredient(data: IngredientCreate): Promise<Ingredient> {
  const response = await api.post('/ingredients', data);
  return response.data;
}

/**
 * Update an existing ingredient (requires STAFF or ADMIN role).
 */
export async function updateIngredient(id: number, data: IngredientUpdate): Promise<Ingredient> {
  const response = await api.put(`/ingredients/${id}`, data);
  return response.data;
}

/**
 * Soft delete an ingredient (requires STAFF or ADMIN role).
 */
export async function deleteIngredient(id: number): Promise<void> {
  await api.delete(`/ingredients/${id}`);
}

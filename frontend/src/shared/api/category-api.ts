/**
 * Category API functions for Food Store frontend
 */

import api from '@/shared/api/axios-instance';
import type { CategoryCreate, CategoryResponse, CategoryTreeNode, CategoryUpdate } from '@/entities/category/types';

/**
 * Get the full category tree (public endpoint).
 * Returns active non-deleted categories as a nested structure.
 */
export async function getCategoryTree(): Promise<CategoryTreeNode[]> {
  const response = await api.get('/categories');
  return response.data;
}

/**
 * Get a single category by ID with its active children (public endpoint).
 */
export async function getCategoryById(id: number): Promise<CategoryTreeNode> {
  const response = await api.get(`/categories/${id}`);
  return response.data;
}

/**
 * Create a new category (requires STAFF or ADMIN role).
 */
export async function createCategory(data: CategoryCreate): Promise<CategoryResponse> {
  const response = await api.post('/categories', data);
  return response.data;
}

/**
 * Update an existing category (requires STAFF or ADMIN role).
 */
export async function updateCategory(id: number, data: CategoryUpdate): Promise<CategoryResponse> {
  const response = await api.put(`/categories/${id}`, data);
  return response.data;
}

/**
 * Soft delete a category (requires STAFF or ADMIN role).
 * Returns 204 on success, 409 if the category has active children.
 */
export async function deleteCategory(id: number): Promise<void> {
  await api.delete(`/categories/${id}`);
}

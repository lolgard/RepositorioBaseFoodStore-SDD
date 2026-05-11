/**
 * Ingredient type definitions for Food Store.
 */

export interface Ingredient {
  id: number;
  name: string;
  description: string | null;
  es_alergeno: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface IngredientCreate {
  name: string;
  description?: string | null;
  es_alergeno?: boolean;
}

export interface IngredientUpdate {
  name?: string;
  description?: string | null;
  es_alergeno?: boolean;
}

export interface IngredientListResponse {
  items: Ingredient[];
  total: number;
  skip: number;
  limit: number;
}

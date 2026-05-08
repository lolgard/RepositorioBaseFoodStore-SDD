/**
 * Category entity types for Food Store frontend
 */

export interface CategoryBase {
  name: string;
  description?: string | null;
  image_url?: string | null;
  parent_id?: number | null;
  sort_order: number;
  is_active: boolean;
}

export interface CategoryCreate {
  name: string;
  description?: string | null;
  image_url?: string | null;
  parent_id?: number | null;
  sort_order?: number;
  is_active?: boolean;
}

export interface CategoryUpdate {
  name?: string;
  description?: string | null;
  image_url?: string | null;
  parent_id?: number | null;
  sort_order?: number;
  is_active?: boolean;
}

export interface CategoryResponse {
  id: number;
  name: string;
  description?: string | null;
  image_url?: string | null;
  parent_id?: number | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface CategoryTreeNode extends CategoryResponse {
  children: CategoryTreeNode[];
}

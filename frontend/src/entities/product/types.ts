export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: string;
  stock: number;
  available: boolean;
  image_url: string | null;
  category_ids: number[];
  ingredient_ids: number[];
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface ProductCreate {
  name: string;
  description?: string | null;
  price: number;
  stock?: number;
  available?: boolean;
  image_url?: string | null;
  category_ids?: number[];
  ingredient_ids?: number[];
}

export interface ProductUpdate {
  name?: string;
  description?: string | null;
  price?: number;
  stock?: number;
  available?: boolean;
  image_url?: string | null;
  category_ids?: number[];
  ingredient_ids?: number[];
}

export interface ProductListResponse {
  items: Product[];
  total: number;
  skip: number;
  limit: number;
}

export interface ProductFilters {
  category_id?: number;
  search?: string;
  available?: boolean;
  min_price?: number;
  max_price?: number;
  min_stock?: number;
  skip?: number;
  limit?: number;
}

export interface Category {
  id: number;
  name: string;
}

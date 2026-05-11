import api from '@/shared/api/axios-instance';
import { getCategoryTree } from '@/shared/api/category-api';
import { listIngredients } from '@/shared/api/ingredient-api';
import type { Category } from '@/entities/product/types';
import type { Ingredient } from '@/entities/ingredient/types';
import type { Product, ProductCreate, ProductListResponse, ProductFilters, ProductUpdate } from '@/entities/product/types';

export async function listProducts(params?: ProductFilters): Promise<ProductListResponse> {
  const response = await api.get('/products', { params });
  return response.data;
}

export async function getProductById(id: number): Promise<Product> {
  const response = await api.get(`/products/${id}`);
  return response.data;
}

export async function createProduct(data: ProductCreate): Promise<Product> {
  const response = await api.post('/products', data);
  return response.data;
}

export async function updateProduct(id: number, data: ProductUpdate): Promise<Product> {
  const response = await api.put(`/products/${id}`, data);
  return response.data;
}

export async function deleteProduct(id: number): Promise<void> {
  await api.delete(`/products/${id}`);
}

export async function fetchCategoriesFlat(): Promise<Category[]> {
  const tree = await getCategoryTree();
  const flat: Category[] = [];
  function walk(nodes: typeof tree) {
    for (const node of nodes) {
      flat.push({ id: node.id, name: node.name });
      if (node.children?.length) walk(node.children);
    }
  }
  walk(tree);
  return flat;
}

export async function fetchIngredientsFlat(): Promise<Ingredient[]> {
  const all: Ingredient[] = [];
  let skip = 0;
  const limit = 100;
  for (;;) {
    const res = await listIngredients({ skip, limit });
    all.push(...res.items);
    if (skip + limit >= res.total) break;
    skip += limit;
  }
  return all;
}

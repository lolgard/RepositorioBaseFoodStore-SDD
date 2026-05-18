export interface Review {
  id: number;
  product_id: number;
  user_id: number;
  rating: number;
  comment?: string;
  created_at: string;
}

export interface ReviewCreate {
  product_id: number;
  rating: number;
  comment?: string;
}

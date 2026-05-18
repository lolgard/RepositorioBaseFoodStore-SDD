import axiosInstance from './axios-instance';
import type { Review, ReviewCreate } from '@/entities/review/types';

export const createReview = async (data: ReviewCreate): Promise<Review> => {
  const { data: response } = await axiosInstance.post('/reviews', data);
  return response;
};

export const fetchProductReviews = async (productId: number): Promise<Review[]> => {
  const { data: response } = await axiosInstance.get(`/products/${productId}/reviews`);
  return response;
};

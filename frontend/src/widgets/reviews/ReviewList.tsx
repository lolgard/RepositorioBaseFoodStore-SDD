import { Review } from '@/entities/review/types';
import { Star } from 'lucide-react';

interface ReviewListProps {
  reviews: Review[];
}

export function ReviewList({ reviews }: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <div className="card-premium p-6 text-center text-surface-custom-500 italic">
        No hay reseñas aún. ¡Sé el primero en opinar!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-black text-white italic uppercase tracking-tighter">
        Reseñas ({reviews.length})
      </h2>
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="card-premium p-6 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={16}
                    className={star <= review.rating ? 'text-primary-400 fill-primary-400' : 'text-surface-custom-700'}
                  />
                ))}
              </div>
              <span className="text-xs text-surface-custom-500 font-mono">
                {new Date(review.created_at).toLocaleDateString()}
              </span>
            </div>
            {review.comment && (
              <p className="text-surface-custom-300 italic">"{review.comment}"</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

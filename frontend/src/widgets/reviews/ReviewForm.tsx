import { useState } from 'react';
import { useAuthStore } from '@/shared/store/auth-store';
import { useToastStore } from '@/shared/store/toast-store';
import { createReview } from '@/shared/api/review-api';
import { Star } from 'lucide-react';

interface ReviewFormProps {
  productId: number;
  onReviewCreated: () => void;
}

export function ReviewForm({ productId, onReviewCreated }: ReviewFormProps) {
  const user = useAuthStore((s) => s.user);
  const addToast = useToastStore((s) => s.addToast);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  if (!user) {
    return (
      <div className="card-premium p-6 text-center text-surface-custom-400">
        Inicia sesión para dejar una reseña.
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createReview({ product_id: productId, rating, comment });
      addToast('Reseña creada correctamente', 'success');
      setComment('');
      setRating(5);
      onReviewCreated();
    } catch {
      addToast('Error al crear reseña', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card-premium p-6 space-y-4">
      <h3 className="text-lg font-black text-white italic uppercase tracking-tighter">
        Tu reseña
      </h3>
      
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            className="transition-transform hover:scale-110"
          >
            <Star
              size={24}
              className={star <= rating ? 'text-primary-400 fill-primary-400' : 'text-surface-custom-700'}
            />
          </button>
        ))}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Deja un comentario..."
        className="input-premium w-full h-24 resize-none"
      />

      <button
        type="submit"
        disabled={loading}
        className="btn-premium w-full py-3"
      >
        {loading ? 'Enviando...' : 'Enviar Reseña'}
      </button>
    </form>
  );
}

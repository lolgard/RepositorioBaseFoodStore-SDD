import { useState } from 'react';
import { useCartStore } from '@/shared/store/cart-store';
import { useToastStore } from '@/shared/store/toast-store';
import { Tag } from 'lucide-react';
import api from '@/shared/api/axios-instance';

export function CouponInput() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { setCoupon } = useCartStore();
  const { addToast } = useToastStore();

  const applyCoupon = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/coupons/${code}/validate`);
      setCoupon(code, response.data.discount_percentage);
      addToast('Cupón aplicado con éxito', 'success');
    } catch (error) {
      addToast('Cupón inválido o expirado', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Código de cupón"
        className="flex-1 bg-surface-custom-900 border border-white/5 rounded-xl px-4 py-2 text-white"
      />
      <button onClick={applyCoupon} disabled={loading} className="btn-premium px-4">
        <Tag size={16} />
      </button>
    </div>
  );
}

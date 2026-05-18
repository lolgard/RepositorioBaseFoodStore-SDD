import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Save, X, MapPin, Info } from 'lucide-react';
import { useToastStore } from '@/shared/store/toast-store';
import { createAddress, getAddress, updateAddress } from '@/shared/api/address-api';
import type { AddressCreate, AddressUpdate } from '@/entities/address/types';

interface FormData {
  street: string;
  street_number: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  additional_info: string;
  is_default: boolean;
}

const EMPTY_FORM: FormData = {
  street: '',
  street_number: '',
  city: '',
  state: '',
  zip_code: '',
  country: 'Argentina',
  additional_info: '',
  is_default: false,
};

export default function AddressFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const addToast = useToastStore((s) => s.addToast);

  const [formData, setFormData] = useState<FormData>(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(isEditing);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    getAddress(Number(id))
      .then((addr) => {
        setFormData({
          street: addr.street,
          street_number: addr.street_number,
          city: addr.city,
          state: addr.state,
          zip_code: addr.zip_code,
          country: addr.country,
          additional_info: addr.additional_info ?? '',
          is_default: addr.is_default,
        });
      })
      .catch((err) => {
        const msg = err?.response?.data?.detail || 'Dirección no encontrada';
        setError(msg);
        addToast(msg, 'error');
      })
      .finally(() => setIsLoading(false));
  }, [id, addToast]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const payload: AddressCreate | AddressUpdate = {
        street: formData.street,
        street_number: formData.street_number,
        city: formData.city,
        state: formData.state,
        zip_code: formData.zip_code,
        country: formData.country,
        additional_info: formData.additional_info || null,
        is_default: formData.is_default,
      };

      if (isEditing) {
        await updateAddress(Number(id), payload as AddressUpdate);
        addToast('Dirección actualizada correctamente', 'success');
      } else {
        await createAddress(payload as AddressCreate);
        addToast('Dirección creada correctamente', 'success');
      }
      navigate('/addresses');
    } catch (err: any) {
      const message = err?.response?.data?.detail || 'Error en la operación';
      setError(message);
      addToast(message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/addresses')}
          className="group flex items-center gap-1 text-surface-custom-400 hover:text-white transition-colors"
        >
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-bold uppercase tracking-widest">Volver</span>
        </button>
        <div className="p-2 bg-primary-500/10 rounded-xl border border-primary-500/20 text-primary-400">
          <MapPin size={24} />
        </div>
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white tracking-tight">
          {isEditing ? 'Editar Dirección' : 'Nueva Dirección'}
        </h1>
        <p className="text-surface-custom-400">Ingresá los datos de entrega para tus pedidos.</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center gap-3 text-red-400">
          <X size={20} />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card-premium p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <label htmlFor="street" className="block text-xs font-bold text-surface-custom-300 uppercase tracking-widest mb-2 ml-1">
              Calle *
            </label>
            <input
              type="text"
              id="street"
              name="street"
              required
              maxLength={200}
              value={formData.street}
              onChange={handleChange}
              className="input-premium"
              placeholder="Ej. Av. de Mayo"
            />
          </div>
          <div>
            <label htmlFor="street_number" className="block text-xs font-bold text-surface-custom-300 uppercase tracking-widest mb-2 ml-1">
              Número *
            </label>
            <input
              type="text"
              id="street_number"
              name="street_number"
              required
              maxLength={20}
              value={formData.street_number}
              onChange={handleChange}
              className="input-premium"
              placeholder="1234"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="city" className="block text-xs font-bold text-surface-custom-300 uppercase tracking-widest mb-2 ml-1">
              Ciudad *
            </label>
            <input
              type="text"
              id="city"
              name="city"
              required
              maxLength={100}
              value={formData.city}
              onChange={handleChange}
              className="input-premium"
              placeholder="Ej. Córdoba"
            />
          </div>
          <div>
            <label htmlFor="state" className="block text-xs font-bold text-surface-custom-300 uppercase tracking-widest mb-2 ml-1">
              Provincia *
            </label>
            <input
              type="text"
              id="state"
              name="state"
              required
              maxLength={100}
              value={formData.state}
              onChange={handleChange}
              className="input-premium"
              placeholder="Ej. Córdoba"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="zip_code" className="block text-xs font-bold text-surface-custom-300 uppercase tracking-widest mb-2 ml-1">
              Código Postal *
            </label>
            <input
              type="text"
              id="zip_code"
              name="zip_code"
              required
              maxLength={20}
              value={formData.zip_code}
              onChange={handleChange}
              className="input-premium"
              placeholder="5000"
            />
          </div>
          <div>
            <label htmlFor="country" className="block text-xs font-bold text-surface-custom-300 uppercase tracking-widest mb-2 ml-1">
              País
            </label>
            <input
              type="text"
              id="country"
              name="country"
              maxLength={100}
              value={formData.country}
              onChange={handleChange}
              className="input-premium"
            />
          </div>
        </div>

        <div>
          <label htmlFor="additional_info" className="block text-xs font-bold text-surface-custom-300 uppercase tracking-widest mb-2 ml-1">
            Información Adicional
          </label>
          <div className="relative">
            <input
              type="text"
              id="additional_info"
              name="additional_info"
              maxLength={500}
              value={formData.additional_info}
              onChange={handleChange}
              className="input-premium pl-10"
              placeholder="Ej. Portón negro, timbre B"
            />
            <Info size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-custom-500" />
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
          <div className="relative flex items-center">
            <input
              type="checkbox"
              id="is_default"
              name="is_default"
              checked={formData.is_default}
              onChange={handleChange}
              className="w-5 h-5 rounded-lg border-white/10 bg-surface-custom-800 text-primary-500 focus:ring-primary-500 transition-all cursor-pointer"
            />
          </div>
          <label htmlFor="is_default" className="text-sm font-medium text-surface-custom-300 cursor-pointer">
            Establecer como dirección predeterminada
          </label>
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-premium flex-1 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Save size={18} />
                <span>{isEditing ? 'Actualizar' : 'Crear Dirección'}</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => navigate('/addresses')}
            className="px-6 py-3 border border-white/10 text-white rounded-2xl hover:bg-white/5 transition-all text-sm font-black uppercase tracking-widest"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

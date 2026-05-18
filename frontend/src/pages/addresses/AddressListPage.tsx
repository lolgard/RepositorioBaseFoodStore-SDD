import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Plus, Star, Trash2, Edit3, Navigation } from 'lucide-react';
import { listAddresses, deleteAddress, setDefaultAddress } from '@/shared/api/address-api';
import { useToastStore } from '@/shared/store/toast-store';
import type { Address } from '@/entities/address/types';

export default function AddressListPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const addToast = useToastStore((s) => s.addToast);

  const loadAddresses = async () => {
    try {
      setLoading(true);
      const data = await listAddresses();
      setAddresses(data);
    } catch {
      addToast('Error al cargar direcciones', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAddresses(); }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que querés eliminar esta dirección?')) return;
    try {
      await deleteAddress(id);
      addToast('Dirección eliminada', 'success');
      loadAddresses();
    } catch {
      addToast('Error al eliminar dirección', 'error');
    }
  };

  const handleSetDefault = async (id: number) => {
    try {
      await setDefaultAddress(id);
      addToast('Dirección predeterminada actualizada', 'success');
      loadAddresses();
    } catch {
      addToast('Error al actualizar dirección predeterminada', 'error');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="w-8 h-8 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-surface-custom-950 p-6 max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
            <MapPin className="text-primary-400" size={28} />
            Mis Direcciones
          </h1>
          <p className="text-surface-custom-400 mt-1">Gestioná tus puntos de entrega para pedidos rápidos.</p>
        </div>
        <Link
          to="/addresses/new"
          className="btn-premium flex items-center gap-2"
        >
          <Plus size={20} />
          Agregar Dirección
        </Link>
      </div>

      {addresses.length === 0 ? (
        <div className="card-premium p-12 text-center flex flex-col items-center">
          <div className="p-4 bg-surface-custom-800 rounded-full text-surface-custom-500 mb-4">
            <Navigation size={48} className="opacity-20" />
          </div>
          <p className="text-surface-custom-400 max-w-xs mx-auto">
            Todavía no tenés direcciones guardadas. Agregá una para empezar a pedir.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className="card-premium p-5 flex flex-col justify-between group hover:border-primary-500/30 transition-all border border-white/5"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${addr.is_default ? 'bg-emerald-500/10 text-emerald-400' : 'bg-surface-custom-800 text-surface-custom-400'}`}>
                      <MapPin size={20} />
                    </div>
                    {addr.is_default && (
                      <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                        Predeterminada
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => navigate(`/addresses/${addr.id}/edit`)}
                      className="p-2 text-surface-custom-400 hover:text-primary-400 hover:bg-primary-500/10 rounded-lg transition-all"
                      title="Editar"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(addr.id)}
                      className="p-2 text-surface-custom-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                      title="Eliminar"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="font-bold text-white text-lg">
                    {addr.street} {addr.street_number}
                  </p>
                  <p className="text-sm text-surface-custom-400">
                    {addr.city}, {addr.state} {addr.zip_code}
                  </p>
                  {addr.additional_info && (
                    <div className="mt-2 p-2 bg-white/5 rounded-lg border border-white/5">
                      <p className="text-xs text-surface-custom-500 italic">
                        "{addr.additional_info}"
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {!addr.is_default && (
                <button
                  onClick={() => handleSetDefault(addr.id)}
                  className="mt-6 w-full py-2 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-surface-custom-400 hover:text-emerald-400 hover:bg-emerald-500/5 border border-dashed border-surface-custom-700 hover:border-emerald-500/30 rounded-xl transition-all"
                >
                  <Star size={14} />
                  Hacer predeterminada
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

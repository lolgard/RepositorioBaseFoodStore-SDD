import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Save, User, Shield, Power, X } from 'lucide-react';
import { useToastStore } from '@/shared/store/toast-store';
import ImageModal from '@/shared/ui/ImageModal';
import { getUserById, updateUser, deactivateUser } from '@/shared/api/user-api';
import type { AdminUserResponse } from '@/shared/api/user-api';

const ROLES = ['CLIENTE', 'STAFF', 'GESTOR', 'ADMIN'] as const;

export default function UserFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const addToast = useToastStore((state) => state.addToast);

  const [user, setUser] = useState<AdminUserResponse | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    getUserById(Number(id))
      .then((u) => {
        setUser(u);
        setFirstName(u.first_name);
        setLastName(u.last_name);
        setEmail(u.email);
        setRole(u.role);
        setImageUrl(u.image_url || '');
      })
      .catch((err) => {
        const msg = err?.response?.data?.detail || 'Usuario no encontrado';
        setError(msg);
        addToast(msg, 'error');
      })
      .finally(() => setIsLoading(false));
  }, [id, addToast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setIsSubmitting(true);
    setError(null);

    try {
      await updateUser(Number(id), {
        first_name: firstName,
        last_name: lastName,
        email,
        role,
        image_url: imageUrl.trim() || null,
      });
      addToast('Usuario actualizado correctamente', 'success');
      navigate('/users');
    } catch (err: any) {
      const message = err?.response?.data?.detail || 'Error al actualizar usuario';
      setError(message);
      addToast(message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeactivate = async () => {
    if (!id || !user) return;
    if (!window.confirm(`¿Desactivar a "${user.first_name} ${user.last_name}"? Perderá el acceso al sistema.`)) {
      return;
    }

    try {
      await deactivateUser(Number(id));
      addToast('Usuario desactivado', 'success');
      navigate('/users');
    } catch (err: any) {
      const message = err?.response?.data?.detail || 'Error al desactivar usuario';
      addToast(message, 'error');
    }
  };

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="w-8 h-8 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/users')}
          className="group flex items-center gap-1 text-surface-custom-400 hover:text-white transition-colors"
        >
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-bold uppercase tracking-widest">Volver</span>
        </button>
        <div className="p-2 bg-primary-500/10 rounded-xl border border-primary-500/20 text-primary-400">
          <User size={24} />
        </div>
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Editar Usuario
        </h1>
        <p className="text-surface-custom-400">
          {user?.first_name} {user?.last_name} &mdash; <span className="text-primary-400/80">{user?.email}</span>
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center gap-3 text-red-400">
          <X size={20} />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card-premium p-8 space-y-6">
        {/* Live Avatar Preview & URL Input */}
        <div className="space-y-4 border-b border-white/5 pb-6 flex flex-col md:flex-row gap-6 items-center">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-white/5 border border-white/10 shrink-0 flex items-center justify-center relative group">
            <img
              src={imageUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${firstName ? encodeURIComponent(firstName) : 'user'}&backgroundColor=0f172a,1e293b,334155&textColor=38bdf8,f43f5e,10b981&bold=true`}
              alt="Avatar de Usuario"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform cursor-zoom-in hover:brightness-90"
              onClick={() => setPreviewOpen(true)}
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${firstName ? encodeURIComponent(firstName) : 'user'}&backgroundColor=0f172a,1e293b,334155&textColor=38bdf8,f43f5e,10b981&bold=true`;
              }}
            />
          </div>
          <div className="flex-grow space-y-2 w-full">
            <label htmlFor="image_url" className="text-[10px] font-black uppercase tracking-[0.2em] text-surface-custom-500 ml-1">
              Foto de Perfil (URL)
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                id="image_url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="input-premium text-sm"
                placeholder="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"
              />
              {imageUrl && (
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="px-4 py-2.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl hover:bg-red-500/20 transition-all text-xs font-black uppercase tracking-widest shrink-0"
                >
                  Quitar
                </button>
              )}
            </div>
            <p className="text-[10px] text-surface-custom-500">Pega un enlace de imagen para actualizar la foto de perfil de este usuario.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="first_name" className="block text-xs font-bold text-surface-custom-300 uppercase tracking-widest mb-2 ml-1">
              Nombre
            </label>
            <input
              type="text"
              id="first_name"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="input-premium"
            />
          </div>
          <div>
            <label htmlFor="last_name" className="block text-xs font-bold text-surface-custom-300 uppercase tracking-widest mb-2 ml-1">
              Apellido
            </label>
            <input
              type="text"
              id="last_name"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="input-premium"
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-xs font-bold text-surface-custom-300 uppercase tracking-widest mb-2 ml-1">
            Email de Acceso
          </label>
          <input
            type="email"
            id="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-premium"
          />
        </div>

        <div>
          <label htmlFor="role" className="block text-xs font-bold text-surface-custom-300 uppercase tracking-widest mb-2 ml-1">
            Rol de Usuario
          </label>
          <div className="relative">
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="input-premium appearance-none"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <Shield size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-custom-500 pointer-events-none" />
          </div>
        </div>

        <div className="flex flex-wrap gap-4 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-premium flex-1 min-w-[160px] flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Save size={18} />
                <span>Guardar Cambios</span>
              </>
            )}
          </button>
          
          <button
            type="button"
            onClick={() => navigate('/users')}
            className="px-6 py-3 border border-white/10 text-white rounded-2xl hover:bg-white/5 transition-all text-sm font-black uppercase tracking-widest"
          >
            Cancelar
          </button>

          {user?.is_active && (
            <button
              type="button"
              onClick={handleDeactivate}
              className="px-6 py-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl hover:bg-red-500/20 transition-all text-sm font-black uppercase tracking-widest flex items-center gap-2 ml-auto"
            >
              <Power size={18} />
              <span>Desactivar</span>
            </button>
          )}
        </div>
      </form>
      <ImageModal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        src={imageUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${firstName ? encodeURIComponent(firstName) : 'user'}&backgroundColor=0f172a,1e293b,334155&textColor=38bdf8,f43f5e,10b981&bold=true`}
      />
    </div>
  );
}

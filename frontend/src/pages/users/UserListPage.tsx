import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Search, Shield, Power, Edit3, Filter, Calendar } from 'lucide-react';
import { useToastStore } from '@/shared/store/toast-store';
import ImageModal from '@/shared/ui/ImageModal';
import { useAuthStore } from '@/shared/store/auth-store';
import { listUsers, deactivateUser } from '@/shared/api/user-api';
import type { AdminUserResponse } from '@/shared/api/user-api';

export default function UserListPage() {
  const [users, setUsers] = useState<AdminUserResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const navigate = useNavigate();
  const addToast = useToastStore((state) => state.addToast);
  const currentUser = useAuthStore((state) => state.user);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedUserImageUrl, setSelectedUserImageUrl] = useState('');
  const [selectedUserFirstName, setSelectedUserFirstName] = useState('');

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      if (activeFilter) params.is_active = activeFilter;
      const data = await listUsers(params);
      setUsers(data);
    } catch (err) {
      setError('Error al cargar usuarios');
      addToast('Error al cargar usuarios', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [search, roleFilter, activeFilter, addToast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDeactivate = useCallback(
    async (user: AdminUserResponse) => {
      if (!window.confirm(`¿Desactivar a "${user.first_name} ${user.last_name}"? Perderá el acceso al sistema.`)) {
        return;
      }
      try {
        await deactivateUser(user.id);
        addToast(`"${user.first_name} ${user.last_name}" desactivado`, 'success');
        fetchUsers();
      } catch (err: any) {
        const message = err?.response?.data?.detail || 'Error al desactivar usuario';
        addToast(message, 'error');
      }
    },
    [addToast, fetchUsers],
  );

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="w-8 h-8 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <Users className="text-primary-400" size={32} />
            Usuarios
          </h1>
          <p className="text-surface-custom-400 mt-1">Gestión de cuentas, roles y accesos al sistema.</p>
        </div>
        <div className="p-2 bg-primary-500/10 rounded-xl border border-primary-500/20 text-primary-400">
          <Shield size={24} />
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex flex-col items-center gap-2">
          <p className="text-red-400 font-medium">{error}</p>
          <button
            type="button"
            onClick={fetchUsers}
            className="text-xs font-black uppercase tracking-widest text-red-400 hover:underline"
          >
            Reintentar
          </button>
        </div>
      )}

      <div className="card-premium overflow-hidden border border-white/5">
        <div className="p-4 border-b border-white/5 flex flex-wrap gap-4 items-center bg-white/5">
          <div className="relative flex-1 min-w-[240px]">
            <input
              type="text"
              placeholder="Buscar por nombre o email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-premium pl-10"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-custom-500" size={18} />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-surface-custom-500" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="input-premium py-2 text-xs min-w-[120px]"
            >
              <option value="">Todos los roles</option>
              <option value="ADMIN">Admin</option>
              <option value="GESTOR">Gestor</option>
              <option value="STAFF">Staff</option>
              <option value="CLIENTE">Cliente</option>
            </select>
          </div>

          <select
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value)}
            className="input-premium py-2 text-xs min-w-[120px]"
          >
            <option value="">Todos los estados</option>
            <option value="true">Activos</option>
            <option value="false">Inactivos</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/5">
                <th className="px-6 py-4 text-xs font-bold text-surface-custom-300 uppercase tracking-widest">Usuario</th>
                <th className="px-6 py-4 text-xs font-bold text-surface-custom-300 uppercase tracking-widest">Email</th>
                <th className="px-6 py-4 text-xs font-bold text-surface-custom-300 uppercase tracking-widest">Rol</th>
                <th className="px-6 py-4 text-xs font-bold text-surface-custom-300 uppercase tracking-widest">Estado</th>
                <th className="px-6 py-4 text-xs font-bold text-surface-custom-300 uppercase tracking-widest">Registro</th>
                <th className="px-6 py-4 text-xs font-bold text-surface-custom-300 uppercase tracking-widest text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center shrink-0 cursor-zoom-in hover:opacity-85 transition-opacity">
                        <img
                          src={user.image_url || `https://api.dicebear.com/7.x/initials/svg?seed=${user.first_name ? encodeURIComponent(user.first_name) : 'user'}&backgroundColor=0f172a,1e293b,334155&textColor=38bdf8,f43f5e,10b981&bold=true`}
                          alt={`${user.first_name} avatar`}
                          className="w-full h-full object-cover"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedUserImageUrl(user.image_url || '');
                            setSelectedUserFirstName(user.first_name || '');
                            setPreviewOpen(true);
                          }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${user.first_name ? encodeURIComponent(user.first_name) : 'user'}&backgroundColor=0f172a,1e293b,334155&textColor=38bdf8,f43f5e,10b981&bold=true`;
                          }}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-white group-hover:text-primary-400 transition-colors">
                          {user.first_name} {user.last_name}
                        </p>
                        {currentUser?.id === user.id && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] bg-primary-500/10 text-primary-400 border border-primary-500/20 font-black uppercase tracking-widest">
                            Tú
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-surface-custom-400">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                      user.role === 'ADMIN' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20 shadow-[0_0_10px_rgba(168,85,247,0.15)]' :
                      user.role === 'GESTOR' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.15)]' :
                      user.role === 'STAFF' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.15)]' :
                      'bg-surface-custom-800 text-surface-custom-400 border-surface-custom-700'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                      user.is_active 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.15)]' 
                        : 'bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.15)]'
                    }`}>
                      {user.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-surface-custom-500 font-mono text-[10px]">
                      <Calendar size={12} />
                      {new Date(user.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => navigate(`/users/${user.id}/edit`)}
                        className="p-2 text-surface-custom-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                        title="Editar"
                      >
                        <Edit3 size={18} />
                      </button>
                      {user.is_active && (
                        <button
                          type="button"
                          onClick={() => handleDeactivate(user)}
                          className="p-2 text-surface-custom-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                          title="Desactivar"
                        >
                          <Power size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-surface-custom-500">
                    No se encontraron usuarios que coincidan con la búsqueda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <ImageModal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        src={selectedUserImageUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${selectedUserFirstName ? encodeURIComponent(selectedUserFirstName) : 'user'}&backgroundColor=0f172a,1e293b,334155&textColor=38bdf8,f43f5e,10b981&bold=true`}
      />
    </div>
  );
}

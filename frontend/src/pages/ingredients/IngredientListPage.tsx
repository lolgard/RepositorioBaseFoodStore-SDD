import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Edit2, Trash2, AlertTriangle, ChevronLeft, ChevronRight, ChefHat } from 'lucide-react';
import { listIngredients, deleteIngredient } from '@/shared/api/ingredient-api';
import { useToastStore } from '@/shared/store/toast-store';
import type { Ingredient } from '@/entities/ingredient/types';

export default function IngredientListPage() {
  const navigate = useNavigate();
  const addToast = useToastStore((s) => s.addToast);

  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterAlergeno, setFilterAlergeno] = useState<boolean | null>(null);
  const [page, setPage] = useState(0);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const limit = 12;

  const fetchIngredients = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = { skip: page * limit, limit };
      if (search) params.search = search;
      if (filterAlergeno !== null) params.es_alergeno = filterAlergeno;

      const data = await listIngredients(params);
      setIngredients(data.items);
      setTotal(data.total);
    } catch {
      addToast('Error al cargar ingredientes', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, search, filterAlergeno, addToast]);

  useEffect(() => {
    fetchIngredients();
  }, [fetchIngredients]);

  const handleDelete = async () => {
    if (deleteId === null) return;
    try {
      await deleteIngredient(deleteId);
      addToast('Ingrediente eliminado', 'success');
      setDeleteId(null);
      fetchIngredients();
    } catch {
      addToast('Error al eliminar ingrediente', 'error');
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <ChefHat className="text-primary-400" size={32} />
            Ingredientes
          </h1>
          <p className="text-surface-custom-400 mt-1">Gestión de insumos y control de alérgenos.</p>
        </div>
        <button
          onClick={() => navigate('/ingredients/new')}
          className="btn-premium flex items-center gap-2"
        >
          <Plus size={20} />
          <span>Nuevo Ingrediente</span>
        </button>
      </div>

      {/* Filters */}
      <div className="card-premium p-4 flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[280px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-custom-500" size={18} />
          <input
            type="text"
            placeholder="Buscar por nombre..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            className="input-premium pl-12"
          />
        </div>
        <select
          value={filterAlergeno === null ? '' : filterAlergeno.toString()}
          onChange={(e) => {
            setFilterAlergeno(e.target.value === '' ? null : e.target.value === 'true');
            setPage(0);
          }}
          className="input-premium w-full md:w-64"
        >
          <option value="">Todos los ingredientes</option>
          <option value="true">Solo Alérgenos</option>
          <option value="false">Sin Alérgenos</option>
        </select>
      </div>

      {/* List / Table */}
      <div className="card-premium overflow-hidden border border-white/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                <th className="p-4 text-[10px] font-black uppercase tracking-[0.2em] text-surface-custom-500">Nombre</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-[0.2em] text-surface-custom-500 hidden sm:table-cell">Descripción</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-[0.2em] text-surface-custom-500 text-center">Estado</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-[0.2em] text-surface-custom-500 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-12 text-center">
                    <div className="w-8 h-8 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : ingredients.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-surface-custom-500 italic">
                    No se encontraron ingredientes con los filtros actuales.
                  </td>
                </tr>
              ) : (
                ingredients.map((ing) => (
                  <tr key={ing.id} className="group hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <span className="font-bold text-white group-hover:text-primary-400 transition-colors">{ing.name}</span>
                    </td>
                    <td className="p-4 hidden sm:table-cell">
                      <span className="text-sm text-surface-custom-400 line-clamp-1">{ing.description || '—'}</span>
                    </td>
                    <td className="p-4 text-center">
                      {ing.es_alergeno ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 text-[10px] font-black uppercase tracking-widest border border-red-500/20">
                          <AlertTriangle size={12} />
                          Alérgeno
                        </span>
                      ) : (
                        <span className="text-surface-custom-700 text-xs">—</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => navigate(`/ingredients/${ing.id}/edit`)}
                          className="p-2 text-surface-custom-500 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => setDeleteId(ing.id)}
                          className="p-2 text-surface-custom-500 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {!loading && total > 0 && (
        <div className="flex items-center justify-between pt-4 border-t border-white/5">
          <p className="text-sm text-surface-custom-500 font-medium">
            Mostrando <span className="text-white font-bold">{Math.min((page * limit) + 1, total)}</span> a <span className="text-white font-bold">{Math.min((page + 1) * limit, total)}</span> de <span className="text-white font-bold">{total}</span>
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-2 border border-white/10 text-surface-custom-400 rounded-xl hover:bg-white/5 disabled:opacity-20 transition-all"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={(page + 1) * limit >= total}
              className="p-2 border border-white/10 text-surface-custom-400 rounded-xl hover:bg-white/5 disabled:opacity-20 transition-all"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-surface-custom-950/80 backdrop-blur-md"
            onClick={() => setDeleteId(null)}
          />
          <div className="card-premium p-8 max-w-md w-full relative z-10 border-red-500/20">
            <div className="flex items-center gap-4 text-red-400 mb-6">
              <div className="p-3 bg-red-500/10 rounded-2xl border border-red-500/20">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white">¿Confirmar Baja?</h3>
            </div>
            <p className="text-surface-custom-400 leading-relaxed italic mb-8">
              ¿Estás seguro de que querés eliminar este ingrediente? Esta acción no se puede deshacer y podría afectar a los productos asociados.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-4 border border-white/10 text-white rounded-2xl hover:bg-white/5 transition-all text-sm font-black uppercase tracking-widest"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-4 bg-red-500 text-white rounded-2xl hover:bg-red-600 transition-all text-sm font-black uppercase tracking-widest"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

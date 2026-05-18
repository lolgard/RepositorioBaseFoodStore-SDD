import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChefHat, ChevronLeft, Save, AlertTriangle, Info } from 'lucide-react';
import { getIngredientById, createIngredient, updateIngredient } from '@/shared/api/ingredient-api';
import { useToastStore } from '@/shared/store/toast-store';
import type { IngredientCreate, IngredientUpdate } from '@/entities/ingredient/types';

export default function IngredientFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const addToast = useToastStore((s) => s.addToast);
  const isEditing = Boolean(id);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [es_alergeno, setEsAlergeno] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditing);

  useEffect(() => {
    if (id) {
      getIngredientById(Number(id))
        .then((ing) => {
          setName(ing.name);
          setDescription(ing.description || '');
          setEsAlergeno(ing.es_alergeno);
        })
        .catch(() => {
          addToast('Ingrediente no encontrado', 'error');
          navigate('/ingredients');
        })
        .finally(() => setFetching(false));
    }
  }, [id, navigate, addToast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      addToast('El nombre es obligatorio', 'error');
      return;
    }

    setLoading(true);
    try {
      if (isEditing && id) {
        const data: IngredientUpdate = {
          name: name.trim(),
          description: description.trim() || null,
          es_alergeno,
        };
        await updateIngredient(Number(id), data);
        addToast('Ingrediente actualizado', 'success');
      } else {
        const data: IngredientCreate = {
          name: name.trim(),
          description: description.trim() || null,
          es_alergeno,
        };
        await createIngredient(data);
        addToast('Ingrediente creado', 'success');
      }
      navigate('/ingredients');
    } catch (err: any) {
      const message = err?.response?.data?.detail || 'Error en la operación';
      addToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="w-8 h-8 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-8">
      <button
        onClick={() => navigate('/ingredients')}
        className="group flex items-center gap-2 text-surface-custom-400 hover:text-white transition-colors"
      >
        <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-bold uppercase tracking-widest">Volver a la lista</span>
      </button>

      <div className="flex items-center gap-4">
        <div className="p-3 bg-primary-500/10 rounded-2xl border border-primary-500/20 shadow-[0_0_15px_rgba(var(--primary-rgb),0.1)]">
          <ChefHat className="text-primary-400" size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter">
            {isEditing ? 'Editar Ingrediente' : 'Nuevo Ingrediente'}
          </h1>
          <p className="text-surface-custom-400 text-sm">Define las propiedades y advertencias del insumo.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card-premium p-8 space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-surface-custom-500 ml-1">Nombre del Insumo *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-premium"
            placeholder="Ej: Harina de trigo 0000"
            required
            maxLength={100}
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-surface-custom-500 ml-1">Descripción / Notas</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input-premium h-32 resize-none"
            placeholder="Detalles adicionales sobre el origen o tipo..."
            maxLength={500}
          />
        </div>

        <div className="pt-4 border-t border-white/5">
          <label className={`flex items-center gap-4 p-4 rounded-2xl border cursor-pointer transition-all ${
            es_alergeno 
            ? 'bg-red-500/10 border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.05)]' 
            : 'bg-white/5 border-white/10 hover:border-white/20'
          }`}>
            <input
              type="checkbox"
              checked={es_alergeno}
              onChange={(e) => setEsAlergeno(e.target.checked)}
              className="hidden"
            />
            <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
              es_alergeno ? 'bg-red-500 border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'border-surface-custom-700'
            }`}>
              {es_alergeno && <AlertTriangle size={14} className="text-white" />}
            </div>
            <div>
              <span className={`text-sm font-black uppercase tracking-widest ${es_alergeno ? 'text-red-400' : 'text-surface-custom-300'}`}>
                Es un Alérgeno
              </span>
              <p className="text-[10px] text-surface-custom-500 font-bold uppercase tracking-tight mt-0.5">
                Requiere advertencia visual en el catálogo para clientes sensibles.
              </p>
            </div>
          </label>
        </div>

        {es_alergeno && (
          <div className="flex gap-4 p-4 bg-red-500/5 border border-red-500/20 rounded-2xl animate-in slide-in-from-top-2 duration-300">
            <Info className="text-red-400 shrink-0" size={20} />
            <p className="text-xs text-red-400/80 leading-relaxed italic">
              Este ingrediente será marcado como alérgeno. Todos los productos que lo contengan mostrarán automáticamente una advertencia visual de seguridad.
            </p>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-6">
          <button
            type="button"
            onClick={() => navigate('/ingredients')}
            className="px-8 py-4 border border-white/10 text-white rounded-2xl hover:bg-white/5 transition-all text-sm font-black uppercase tracking-widest"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-premium flex items-center gap-2 px-10 shadow-lg shadow-primary-500/20"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <Save size={18} />
            )}
            <span>{isEditing ? 'Actualizar' : 'Crear'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

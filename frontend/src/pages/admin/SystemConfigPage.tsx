import { useState, useEffect } from 'react';
import { Settings, Save, X, Edit2 } from 'lucide-react';
import { listConfigs, updateConfig, type ConfigResponse } from '@/shared/api/admin-config-api';

export default function SystemConfigPage() {
  const [configs, setConfigs] = useState<ConfigResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    listConfigs()
      .then(setConfigs)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (key: string) => {
    try {
      const updated = await updateConfig(key, editValue);
      setConfigs((prev) => prev.map((c) => (c.key === key ? updated : c)));
      setEditingKey(null);
    } catch (e) {
      // handle error
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="w-8 h-8 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-surface-custom-950 p-6 max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Configuración del Sistema</h1>
          <p className="text-surface-custom-400 mt-1">Parámetros operativos de la plataforma.</p>
        </div>
        <div className="p-2 bg-secondary-500/10 rounded-xl border border-secondary-500/20 text-secondary-400">
          <Settings size={24} />
        </div>
      </div>

      <div className="card-premium overflow-hidden border border-white/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/5">
                <th className="px-6 py-4 text-xs font-bold text-surface-custom-300 uppercase tracking-widest">Parámetro</th>
                <th className="px-6 py-4 text-xs font-bold text-surface-custom-300 uppercase tracking-widest">Valor</th>
                <th className="px-6 py-4 text-xs font-bold text-surface-custom-300 uppercase tracking-widest">Descripción</th>
                <th className="px-6 py-4 text-xs font-bold text-surface-custom-300 uppercase tracking-widest text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {configs.map((config) => (
                <tr key={config.key} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs font-bold text-primary-400 bg-primary-400/10 px-2 py-1 rounded-md border border-primary-400/20">
                      {config.key}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {editingKey === config.key ? (
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="input-premium py-1 text-sm min-w-[200px]"
                        autoFocus
                      />
                    ) : (
                      <span className="text-sm font-medium text-white">{config.value}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-surface-custom-400 line-clamp-1 group-hover:line-clamp-none transition-all">
                      {config.description || '-'}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {editingKey === config.key ? (
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleSave(config.key)}
                          className="p-2 text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-colors shadow-lg shadow-emerald-500/10"
                          title="Guardar"
                        >
                          <Save size={18} />
                        </button>
                        <button
                          onClick={() => setEditingKey(null)}
                          className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                          title="Cancelar"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingKey(config.key);
                          setEditValue(config.value);
                        }}
                        className="p-2 text-surface-custom-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                        title="Editar"
                      >
                        <Edit2 size={18} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-start space-x-3">
        <div className="p-2 bg-amber-500/20 rounded-xl text-amber-500 mt-0.5">
          <Settings size={18} />
        </div>
        <div className="text-sm">
          <p className="font-bold text-amber-500 uppercase tracking-tight">Nota de Seguridad</p>
          <p className="text-surface-custom-400">Los cambios en la configuración afectan el comportamiento global del sistema. Proceder con precaución.</p>
        </div>
      </div>
    </div>
  );
}

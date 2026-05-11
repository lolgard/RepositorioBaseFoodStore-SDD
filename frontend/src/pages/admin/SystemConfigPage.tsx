import { useState, useEffect } from 'react';
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

  if (loading) return <div className="p-6 text-center text-gray-500">Loading...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">System Configuration</h1>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Key</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Value</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Description</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {configs.map((config) => (
              <tr key={config.key} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-sm">{config.key}</td>
                <td className="px-4 py-3 text-sm">
                  {editingKey === config.key ? (
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="border rounded px-2 py-1 w-full text-sm"
                      autoFocus
                    />
                  ) : (
                    <span>{config.value}</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">{config.description || '-'}</td>
                <td className="px-4 py-3 text-right">
                  {editingKey === config.key ? (
                    <div className="space-x-2">
                      <button
                        onClick={() => handleSave(config.key)}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingKey(null)}
                        className="text-sm text-gray-600 hover:text-gray-800"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingKey(config.key);
                        setEditValue(config.value);
                      }}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

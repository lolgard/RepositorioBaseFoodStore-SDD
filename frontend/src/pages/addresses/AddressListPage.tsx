import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
      addToast('Failed to load addresses', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAddresses(); }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    try {
      await deleteAddress(id);
      addToast('Address deleted', 'success');
      loadAddresses();
    } catch {
      addToast('Failed to delete address', 'error');
    }
  };

  const handleSetDefault = async (id: number) => {
    try {
      await setDefaultAddress(id);
      addToast('Default address updated', 'success');
      loadAddresses();
    } catch {
      addToast('Failed to set default address', 'error');
    }
  };

  if (loading) return <div className="p-6 text-center text-gray-500">Loading...</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Addresses</h1>
        <Link
          to="/addresses/new"
          className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
        >
          + Add Address
        </Link>
      </div>

      {addresses.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No addresses saved yet.</p>
      ) : (
        <div className="space-y-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className="bg-white rounded-lg shadow-sm border p-4 flex items-start justify-between"
            >
              <div>
                <p className="font-medium">
                  {addr.street} {addr.street_number}
                  {addr.is_default && (
                    <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded font-medium">
                      Default
                    </span>
                  )}
                </p>
                <p className="text-sm text-gray-600">
                  {addr.city}, {addr.state} {addr.zip_code}
                </p>
                <p className="text-sm text-gray-500">{addr.country}</p>
                {addr.additional_info && (
                  <p className="text-sm text-gray-400 mt-1">{addr.additional_info}</p>
                )}
              </div>
              <div className="flex gap-2">
                {!addr.is_default && (
                  <button
                    onClick={() => handleSetDefault(addr.id)}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Set default
                  </button>
                )}
                <button
                  onClick={() => navigate(`/addresses/${addr.id}/edit`)}
                  className="text-sm text-gray-600 hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(addr.id)}
                  className="text-sm text-red-600 hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

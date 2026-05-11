import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
        const msg = err?.response?.data?.detail || 'Address not found';
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
        addToast('Address updated successfully', 'success');
      } else {
        await createAddress(payload as AddressCreate);
        addToast('Address created successfully', 'success');
      }
      navigate('/addresses');
    } catch (err: any) {
      const message = err?.response?.data?.detail || 'Operation failed';
      setError(message);
      addToast(message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-2xl mx-auto">
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <button
            type="button"
            onClick={() => navigate('/addresses')}
            className="text-sm text-blue-600 hover:text-blue-800 mb-2 inline-block"
          >
            &larr; Back to Addresses
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Edit Address' : 'Add Address'}
          </h1>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <div>
            <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-1">
              Street *
            </label>
            <input
              type="text"
              id="street"
              name="street"
              required
              maxLength={200}
              value={formData.street}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g. Av. Corrientes"
            />
          </div>

          <div>
            <label htmlFor="street_number" className="block text-sm font-medium text-gray-700 mb-1">
              Street Number *
            </label>
            <input
              type="text"
              id="street_number"
              name="street_number"
              required
              maxLength={20}
              value={formData.street_number}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g. 1234"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                City *
              </label>
              <input
                type="text"
                id="city"
                name="city"
                required
                maxLength={100}
                value={formData.city}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g. Buenos Aires"
              />
            </div>
            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                State *
              </label>
              <input
                type="text"
                id="state"
                name="state"
                required
                maxLength={100}
                value={formData.state}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g. CABA"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="zip_code" className="block text-sm font-medium text-gray-700 mb-1">
                ZIP Code *
              </label>
              <input
                type="text"
                id="zip_code"
                name="zip_code"
                required
                maxLength={20}
                value={formData.zip_code}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g. C1000"
              />
            </div>
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                Country
              </label>
              <input
                type="text"
                id="country"
                name="country"
                maxLength={100}
                value={formData.country}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="additional_info" className="block text-sm font-medium text-gray-700 mb-1">
              Additional Info
            </label>
            <input
              type="text"
              id="additional_info"
              name="additional_info"
              maxLength={500}
              value={formData.additional_info}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g. Apartment 3B, near the park"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_default"
              name="is_default"
              checked={formData.is_default}
              onChange={handleChange}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="is_default" className="text-sm text-gray-700">
              Set as default address
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : isEditing ? 'Update Address' : 'Create Address'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/addresses')}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

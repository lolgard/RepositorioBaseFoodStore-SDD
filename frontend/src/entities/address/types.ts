export interface Address {
  id: number;
  user_id: number;
  street: string;
  street_number: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  is_default: boolean;
  additional_info: string | null;
  created_at: string;
  updated_at: string;
}

export interface AddressCreate {
  street: string;
  street_number: string;
  city: string;
  state: string;
  zip_code: string;
  country?: string;
  is_default?: boolean;
  additional_info?: string | null;
}

export interface AddressUpdate {
  street?: string;
  street_number?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  is_default?: boolean;
  additional_info?: string | null;
}

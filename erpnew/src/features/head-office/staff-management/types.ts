export type StaffUser = {
  id: number;
  username: string;
  email: string;
  address?: string | null;
  phone_number?: string | null;
  store_name?: string | null;
  user_code?: string | null;
  role: string;
  is_police_verified?: boolean;
  aadhaar_url?: string | null;
  pan_url?: string | null;
  police_doc_url?: string | null;
  store_code?: string | null;
  is_active: boolean;
  created_at?: string;
};

export type StaffStats = {
  total_staff: string | number;
  active: string | number;
  on_leave: string | number;
  departments: string | number;
};

export type StaffPagination = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
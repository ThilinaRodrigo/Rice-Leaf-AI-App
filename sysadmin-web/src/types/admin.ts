export type UserRole = "farmer" | "shop_owner" | "sys_admin";

export interface User {
  id: string;
  full_name: string;
  email?: string;
  nic?: string;
  role: UserRole;
  phone?: string;
  shop_name?: string;
  district?: string;
  city?: string;
  whatsapp_number?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface AdminStats {
  total_farmers: number;
  total_shop_owners: number;
  total_sys_admins: number;
  total_scans: number;
  total_products: number;
  disease_breakdown: Record<string, number>;
}

export interface AdminScan {
  id: string;
  user_id?: string;
  user_name?: string;
  user_role?: string;
  image_url: string;
  class_id: number;
  label: string;
  confidence: number;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price_cents: number;
  price_unit: string;
  image_url: string;
  stock: number;
  description?: string;
  is_active: boolean;
  created_at?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface DiseaseFactor {
  label: string;
  value: string;
  color: string;
  icon: string;
}

export interface DiseaseAction {
  title: string;
  subtitle: string;
}

export interface Disease {
  class_id: number;
  key: string;
  name: string;
  category: string;
  description: string;
  factors: DiseaseFactor[];
  actions: DiseaseAction[];
  created_at?: string;
}

export type AdStatus = "pending" | "approved" | "rejected";

export interface ShopAd {
  id: string;
  shop_owner_id: string;
  shop_name: string;
  contact_phone: string;
  title: string;
  description: string;
  price_unit: string;
  image_url: string;
  disease_tags: string[] | string;
  status: AdStatus;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

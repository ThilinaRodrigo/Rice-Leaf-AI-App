import axios from 'axios';
import type { AdminStats, AdminScan, Product, User, AuthResponse } from '../types/admin';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Admin Auth
export const loginAdmin = async (identifier: string, pass: string): Promise<AuthResponse> => {
  const res = await apiClient.post<AuthResponse>('/auth/login', {
    identifier,
    password: pass,
  });
  return res.data;
};

export const fetchAdminProfile = async (): Promise<User> => {
  const res = await apiClient.get<User>('/auth/me');
  return res.data;
};

export const changePassword = async (
  currentPass: string,
  newPass: string
): Promise<{ message: string }> => {
  const res = await apiClient.put<{ message: string }>('/auth/change-password', {
    current_password: currentPass,
    new_password: newPass,
  });
  return res.data;
};

// Admin Management APIs
export const fetchAdminStats = async (): Promise<AdminStats> => {
  const res = await apiClient.get<AdminStats>('/admin/stats');
  return res.data;
};

export const fetchAdminUsers = async (): Promise<User[]> => {
  const res = await apiClient.get<User[]>('/admin/users');
  return res.data;
};

export const createSysAdminUser = async (data: {
  full_name: string;
  email: string;
  password: string;
  phone?: string;
}): Promise<AuthResponse> => {
  const res = await apiClient.post<AuthResponse>('/admin/users/admin', data);
  return res.data;
};

export const deleteUser = async (userId: string): Promise<void> => {
  await apiClient.delete(`/admin/users/${userId}`);
};

export const fetchAdminScans = async (): Promise<AdminScan[]> => {
  const res = await apiClient.get<AdminScan[]>('/admin/scans');
  return res.data;
};

// Product Management APIs
export const fetchProducts = async (): Promise<Product[]> => {
  const res = await apiClient.get<Product[]>('/products');
  return res.data;
};

export const createProduct = async (product: Partial<Product>): Promise<Product> => {
  const res = await apiClient.post<Product>('/admin/products', product);
  return res.data;
};

export const updateProduct = async (id: string, product: Partial<Product>): Promise<Product> => {
  const res = await apiClient.put<Product>(`/admin/products/${id}`, product);
  return res.data;
};

export const deleteProduct = async (id: string): Promise<void> => {
  await apiClient.delete(`/admin/products/${id}`);
};

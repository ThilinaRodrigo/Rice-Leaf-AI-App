import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types/admin';
import { loginAdmin, fetchAdminProfile } from '../api/adminApi';

interface AdminAuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (identifier: string, pass: string) => Promise<void>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType>({
  user: null,
  token: null,
  isLoading: true,
  login: async () => {},
  logout: () => {},
});

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('admin_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const profile = await fetchAdminProfile();
        if (profile.role !== 'sys_admin') {
          throw new Error('Access denied: System Administrator privileges required');
        }
        setUser(profile);
      } catch (err) {
        console.error('Failed restoring admin session:', err);
        localStorage.removeItem('admin_token');
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, [token]);

  const login = async (identifier: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await loginAdmin(identifier, pass);
      if (res.user.role !== 'sys_admin') {
        throw new Error('Access denied: User is not a System Administrator');
      }
      localStorage.setItem('admin_token', res.token);
      setToken(res.token);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AdminAuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => useContext(AdminAuthContext);

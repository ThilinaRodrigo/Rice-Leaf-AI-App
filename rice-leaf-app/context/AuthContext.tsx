import React, { createContext, useContext, useState } from "react";
import { loginUser, registerUser, fetchUserProfile } from "@/service/apiClient";

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
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (identifier: string, pass: string) => Promise<void>;
  register: (payload: {
    full_name: string;
    email?: string;
    nic?: string;
    password: string;
    role: UserRole;
    phone?: string;
    shop_name?: string;
    district?: string;
    city?: string;
    whatsapp_number?: string;
  }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoading: false,
  login: async () => {},
  register: async () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const login = async (identifier: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await loginUser({ identifier, password: pass });
      setToken(res.token);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: {
    full_name: string;
    email?: string;
    nic?: string;
    password: string;
    role: UserRole;
    phone?: string;
    shop_name?: string;
    district?: string;
    city?: string;
    whatsapp_number?: string;
  }) => {
    setIsLoading(true);
    try {
      const res = await registerUser(payload);
      setToken(res.token);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

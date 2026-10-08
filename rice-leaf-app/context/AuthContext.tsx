import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { loginUser, registerUser } from "@/service/apiClient";

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
    avatar_url?: string;
  }) => Promise<void>;
  updateUser: (updatedUser: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoading: false,
  login: async () => {},
  register: async () => {},
  updateUser: () => {},
  logout: () => {},
});

const TOKEN_KEY = "rice_leaf_auth_token";
const USER_KEY = "rice_leaf_auth_user";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Restore session from AsyncStorage on app launch
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const storedToken = await AsyncStorage.getItem(TOKEN_KEY);
        const storedUser = await AsyncStorage.getItem(USER_KEY);
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (err) {
        console.warn("Failed restoring auth session:", err);
      } finally {
        setIsLoading(false);
      }
    };
    restoreSession();
  }, []);

  const login = async (identifier: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await loginUser({ identifier, password: pass });
      setToken(res.token);
      setUser(res.user);
      await AsyncStorage.setItem(TOKEN_KEY, res.token);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(res.user));
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
    avatar_url?: string;
  }) => {
    setIsLoading(true);
    try {
      const res = await registerUser(payload);
      setToken(res.token);
      setUser(res.user);
      await AsyncStorage.setItem(TOKEN_KEY, res.token);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(res.user));
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    AsyncStorage.setItem(USER_KEY, JSON.stringify(updatedUser)).catch((err) =>
      console.warn("Failed updating stored user:", err)
    );
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]).catch((err) =>
      console.warn("Failed removing stored auth session:", err)
    );
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        updateUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

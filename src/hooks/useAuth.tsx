import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginData, RegisterData } from '../types/index.js';
import { authApi } from '../services/authApi.js';
import { getAuthToken } from '../services/api.js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const initAuth = async () => {
    const token = getAuthToken();
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const me = await authApi.getMe();
      setUser(me);
    } catch (err) {
      console.warn('Initial session validation failed:', err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initAuth();

    const handleUnauthorized = () => {
      setUser(null);
    };

    window.addEventListener('folio:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('folio:unauthorized', handleUnauthorized);
    };
  }, []);

  const login = async (data: LoginData) => {
    setLoading(true);
    try {
      const result = await authApi.login(data);
      setUser(result.user);
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    setLoading(true);
    try {
      const result = await authApi.register(data);
      setUser(result.user);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authApi.logout();
    } finally {
      setUser(null);
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      const me = await authApi.getMe();
      setUser(me);
    } catch {
      setUser(null);
    }
  };

  const updateUser = (updated: User) => {
    setUser(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refreshUser,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

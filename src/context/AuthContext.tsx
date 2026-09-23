import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserProfile, UserRole } from '../types/user';
import { authService } from '../services/authService';
import { storage } from '../services/storage';
import { isSupabaseConfigured } from '../lib/supabase';

interface AuthContextValue {
  user: UserProfile | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isDemoMode: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<UserProfile>;
  signup: (data: {
    email: string;
    name: string;
    role: UserRole;
    studentId?: string;
    department?: string;
    year?: string;
    phone?: string;
    password?: string;
  }) => Promise<UserProfile>;
  logout: () => void;
  switchDemoRole: (role: UserRole) => void;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => authService.getCurrentUser());
  const [isLoading, setIsLoading] = useState(false);
  const isDemoMode = !isSupabaseConfigured();

  const refreshUser = useCallback(() => {
    setUser(authService.getCurrentUser());
  }, []);

  useEffect(() => {
    const unsubscribe = storage.subscribe(() => {
      setUser(authService.getCurrentUser());
    });
    return unsubscribe;
  }, []);

  const login = async (email: string, password?: string) => {
    setIsLoading(true);
    try {
      const loggedUser = await authService.login(email, password);
      setUser(loggedUser);
      return loggedUser;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (data: {
    email: string;
    name: string;
    role: UserRole;
    studentId?: string;
    department?: string;
    year?: string;
    phone?: string;
    password?: string;
  }) => {
    setIsLoading(true);
    try {
      const createdUser = await authService.signup(data);
      setUser(createdUser);
      return createdUser;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const switchDemoRole = (targetRole: UserRole) => {
    const switched = authService.switchDemoRole(targetRole);
    setUser(switched);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        isAuthenticated: !!user,
        isDemoMode,
        isLoading,
        login,
        signup,
        logout,
        switchDemoRole,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

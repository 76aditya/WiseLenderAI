import React, { createContext, useContext, useState, useEffect } from 'react';
import client, { AUTH_URL } from '../api/client';

export interface User {
  id: string;
  username: string;
  email?: string;
  admin: boolean;
  is_active: boolean;
  full_name: string;
  date_of_birth: string;
  gender: string;
  residential_address: string;
  permanent_address: string;
  nationality: string;
  user_status: string;
  mobile_number?: string;
  contact_email?: string;
  national_id_number?: string;
  pan_tax_id?: string;
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  login: (token: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      setIsLoading(true);
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const response = await client.get<User>(`${AUTH_URL}/auth/me`);
        setUser(response.data);
      } catch (err) {
        console.error('Failed to load user', err);
        logout();
      } finally {
        setIsLoading(false);
      }
    }
    loadUser();
  }, [token]);

  const login = (newToken: string) => {
    setIsLoading(true);
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

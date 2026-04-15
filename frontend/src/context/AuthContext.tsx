import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { User, AuthState } from '../types';
import { api } from '../lib/api';

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  showAuthModal: boolean;
  setShowAuthModal: (v: boolean) => void;
  authMode: 'login' | 'register';
  setAuthMode: (m: 'login' | 'register') => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const USER_KEY = 'priority-bags-auth';
const TOKEN_KEY = 'priority-bags-token';

function mapApiUser(u: any): User {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    addresses: u.addresses || [],
    createdAt: u.created_at || new Date().toISOString(),
    role: u.role === 'admin' ? 'admin' : 'user',
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, isAuthenticated: false, isLoading: true });
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(USER_KEY);
      const token = localStorage.getItem(TOKEN_KEY);
      if (saved && token) {
        setState({ user: JSON.parse(saved), isAuthenticated: true, isLoading: false });
      } else {
        setState((s) => ({ ...s, isLoading: false }));
      }
    } catch {
      setState((s) => ({ ...s, isLoading: false }));
    }
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setState((s) => ({ ...s, isLoading: true }));
    try {
      const { user: raw, token } = await api.login(email, password);
      const user = mapApiUser(raw);
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      setState({ user, isAuthenticated: true, isLoading: false });
      setShowAuthModal(false);
      return true;
    } catch (err: any) {
      setState((s) => ({ ...s, isLoading: false }));
      throw err;
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string): Promise<boolean> => {
    setState((s) => ({ ...s, isLoading: true }));
    try {
      const { user: raw, token } = await api.register(name, email, password);
      const user = mapApiUser(raw);
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      setState({ user, isAuthenticated: true, isLoading: false });
      setShowAuthModal(false);
      return true;
    } catch (err: any) {
      setState((s) => ({ ...s, isLoading: false }));
      throw err;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
    setState({ user: null, isAuthenticated: false, isLoading: false });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, showAuthModal, setShowAuthModal, authMode, setAuthMode }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

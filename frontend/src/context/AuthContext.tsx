import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { User, AuthState } from '../types';
import { api } from '../lib/api';

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  showAuthModal: boolean;
  setShowAuthModal: (v: boolean) => void;
  authMode: 'login' | 'register';
  setAuthMode: (m: 'login' | 'register') => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const USER_KEY = 'priority-bags-auth';
// JWT is now stored exclusively in an httpOnly cookie set by the server.
// We no longer read or write a token key in localStorage.

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
    // Restore user profile from localStorage (not sensitive — no token stored here).
    // The httpOnly cookie is sent automatically by the browser on every request.
    try {
      const saved = localStorage.getItem(USER_KEY);
      if (saved) {
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
      const { user: raw } = await api.login(email, password);
      const user = mapApiUser(raw);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      setState({ user, isAuthenticated: true, isLoading: false });
      setShowAuthModal(false);
      return true;
    } catch (err: any) {
      setState((s) => ({ ...s, isLoading: false }));
      const msg = err.message || '';
      if (msg.includes('401') || msg.toLowerCase().includes('invalid') || msg.toLowerCase().includes('password') || msg.toLowerCase().includes('credentials'))
        throw new Error('Incorrect email or password. Please try again.');
      if (msg.includes('404') || msg.toLowerCase().includes('not found'))
        throw new Error('No account found with this email. Please register first.');
      if (msg.includes('5') || msg.toLowerCase().includes('server'))
        throw new Error('Unable to connect. Please check your internet and try again.');
      throw new Error(msg || 'Login failed. Please try again.');
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string, phone?: string): Promise<boolean> => {
    setState((s) => ({ ...s, isLoading: true }));
    try {
      await api.register(name, email, password, phone);
      setState((s) => ({ ...s, isLoading: false }));
      return true;
    } catch (err: any) {
      setState((s) => ({ ...s, isLoading: false }));
      const msg = err.message || '';
      if (msg.includes('409') || msg.toLowerCase().includes('already') || msg.toLowerCase().includes('exists'))
        throw new Error('An account with this email already exists. Please log in instead.');
      if (msg.includes('5') || msg.toLowerCase().includes('server'))
        throw new Error('Unable to connect. Please check your internet and try again.');
      throw new Error(msg || 'Registration failed. Please try again.');
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      // Ask the server to clear the httpOnly cookie
      await api.logout();
    } catch {
      // Proceed with local logout even if the network call fails
    }
    localStorage.removeItem(USER_KEY);
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

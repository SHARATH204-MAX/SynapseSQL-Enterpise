import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  role: 'admin' | 'analyst' | 'viewer';
}

export interface QueryLogItem {
  id: string;
  query_text: string;
  generated_sql?: string;
  model_name: string;
  database_type: string;
  status: string;
  execution_time_ms?: number;
  rows_returned?: number;
  created_at: string;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, fullName: string) => Promise<{ needEmailConfirmation?: boolean }>;
  signInWithGoogle: () => Promise<void>;
  loginWithGoogleCredential: (credential: string) => Promise<void>;
  demoLogin: (role: 'admin' | 'analyst' | 'viewer') => Promise<void>;
  logout: () => Promise<void>;
  getUserHistory: () => Promise<QueryLogItem[]>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('synapsesql_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('synapsesql_token') || null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Sync Supabase Auth state
  useEffect(() => {
    // 1. Initial Supabase session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const u = session.user;
        const profile: UserProfile = {
          id: u.id,
          email: u.email || '',
          name: u.user_metadata?.full_name || u.user_metadata?.name || (u.email ? u.email.split('@')[0] : 'User'),
          avatar_url: u.user_metadata?.avatar_url || '',
          role: u.user_metadata?.role || 'analyst'
        };
        setUser(profile);
        setToken(session.access_token);
        localStorage.setItem('synapsesql_token', session.access_token);
        localStorage.setItem('synapsesql_user', JSON.stringify(profile));
      } else if (!token) {
        setUser(null);
      }
      setIsLoading(false);
    });

    // 2. Listen to active auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED')) {
        const u = session.user;
        const profile: UserProfile = {
          id: u.id,
          email: u.email || '',
          name: u.user_metadata?.full_name || u.user_metadata?.name || (u.email ? u.email.split('@')[0] : 'User'),
          avatar_url: u.user_metadata?.avatar_url || '',
          role: u.user_metadata?.role || 'analyst'
        };
        setUser(profile);
        setToken(session.access_token);
        localStorage.setItem('synapsesql_token', session.access_token);
        localStorage.setItem('synapsesql_user', JSON.stringify(profile));
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setToken(null);
        localStorage.removeItem('synapsesql_token');
        localStorage.removeItem('synapsesql_user');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Supabase Email & Password Sign In
  const signInWithEmail = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (data.session) {
        const u = data.session.user;
        const profile: UserProfile = {
          id: u.id,
          email: u.email || '',
          name: u.user_metadata?.full_name || (u.email ? u.email.split('@')[0] : 'User'),
          avatar_url: u.user_metadata?.avatar_url || '',
          role: u.user_metadata?.role || 'analyst'
        };
        setUser(profile);
        setToken(data.session.access_token);
        localStorage.setItem('synapsesql_token', data.session.access_token);
        localStorage.setItem('synapsesql_user', JSON.stringify(profile));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Supabase Email & Password Sign Up
  const signUpWithEmail = async (email: string, password: string, fullName: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: 'analyst'
          }
        }
      });
      if (error) throw error;
      
      if (data.session) {
        const u = data.session.user;
        const profile: UserProfile = {
          id: u.id,
          email: u.email || '',
          name: fullName || (u.email ? u.email.split('@')[0] : 'User'),
          avatar_url: '',
          role: 'analyst'
        };
        setUser(profile);
        setToken(data.session.access_token);
        localStorage.setItem('synapsesql_token', data.session.access_token);
        localStorage.setItem('synapsesql_user', JSON.stringify(profile));
        return { needEmailConfirmation: false };
      }
      return { needEmailConfirmation: true };
    } finally {
      setIsLoading(false);
    }
  };

  // Supabase OAuth Sign In (Google)
  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) throw error;
  };

  // Google credential login (existing component fallback)
  const loginWithGoogleCredential = async (credential: string) => {
    const res = await fetch('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Google sign in failed' }));
      throw new Error(err.detail || 'Google sign in failed');
    }
    const data = await res.json();
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('synapsesql_token', data.token);
    localStorage.setItem('synapsesql_user', JSON.stringify(data.user));
  };

  // Demo 1-Click Login (Admin / Analyst / Viewer)
  const demoLogin = async (role: 'admin' | 'analyst' | 'viewer') => {
    const res = await fetch('/api/auth/demo-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role })
    });
    if (!res.ok) {
      throw new Error('Demo login failed');
    }
    const data = await res.json();
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('synapsesql_token', data.token);
    localStorage.setItem('synapsesql_user', JSON.stringify(data.user));
  };

  // Sign out
  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // Ignore signOut errors
    }
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // Ignore backend logout errors
    }
    setToken(null);
    setUser(null);
    localStorage.removeItem('synapsesql_token');
    localStorage.removeItem('synapsesql_user');
  };

  // Fetch past query history for user from Supabase
  const getUserHistory = async (): Promise<QueryLogItem[]> => {
    const activeToken = token || localStorage.getItem('synapsesql_token');
    if (!activeToken) return [];
    try {
      const res = await fetch('/api/auth/history', {
        headers: { Authorization: `Bearer ${activeToken}` }
      });
      if (!res.ok) return [];
      const data = await res.json();
      return data.logs || [];
    } catch {
      return [];
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        loginWithGoogleCredential,
        demoLogin,
        logout,
        getUserHistory
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

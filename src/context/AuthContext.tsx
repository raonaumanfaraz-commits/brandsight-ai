'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import {
  getSupabaseBrowserClient,
  isSupabaseConfigured,
  probeSupabaseReachability,
  extractAuthErrorMessage,
} from '@/lib/supabaseClient';
import { UserProfile } from '@/types';

export type AuthModalView = 'login' | 'signup' | 'reset' | 'update_password';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  configured: boolean;
  showAuthModal: boolean;
  authModalView: AuthModalView;
  authModalPrompt: string | null;
  openAuthModal: (view?: AuthModalView, prompt?: string) => void;
  closeAuthModal: () => void;
  setAuthModalView: (view: AuthModalView) => void;
  signIn: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, pass: string) => Promise<{ success: boolean; error?: string; requiresConfirmation?: boolean }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (newPass: string) => Promise<{ success: boolean; error?: string }>;
  linkLicenseKey: (key: string) => Promise<{ success: boolean; error?: string; tier?: string }>;
  refreshProfile: () => Promise<void>;
  authFetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [configured, setConfigured] = useState(true);

  // Modal State
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalView, setAuthModalView] = useState<AuthModalView>('login');
  const [authModalPrompt, setAuthModalPrompt] = useState<string | null>(null);

  const openAuthModal = useCallback((view: AuthModalView = 'login', prompt?: string) => {
    setAuthModalView(view);
    setAuthModalPrompt(prompt || null);
    setShowAuthModal(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setShowAuthModal(false);
    setAuthModalPrompt(null);
  }, []);

  // Fetch or refresh user profile from backend
  const refreshProfile = useCallback(async (token?: string) => {
    try {
      const activeToken = token || session?.access_token;
      const headers: Record<string, string> = {};
      if (activeToken) {
        headers['Authorization'] = `Bearer ${activeToken}`;
      }

      const res = await fetch('/api/brands', { headers });
      if (res.ok) {
        const data = await res.json();
        if (data.profile) {
          setProfile(data.profile);
        }
      }
    } catch (err) {
      console.warn('[BrandSight Auth] Profile fetch notice:', err);
    }
  }, [session]);

  // Authenticated fetch wrapper injecting Bearer token automatically
  const authFetch = useCallback(async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const token = session?.access_token;
    const reqHeaders = new Headers(init?.headers || {});

    if (token && !reqHeaders.has('Authorization')) {
      reqHeaders.set('Authorization', `Bearer ${token}`);
    }

    return fetch(input, {
      ...init,
      headers: reqHeaders,
    });
  }, [session]);

  // Initial startup probe & Supabase Auth listener
  useEffect(() => {
    const isConfig = isSupabaseConfigured();
    setConfigured(isConfig);

    // Startup reachability check
    probeSupabaseReachability();

    const client = getSupabaseBrowserClient();
    if (!client) {
      setLoading(false);
      return;
    }

    // Check for password recovery hash in URL (e.g. #access_token=...&type=recovery)
    if (typeof window !== 'undefined' && window.location.hash.includes('type=recovery')) {
      console.log('[BrandSight Auth] Password recovery flow detected in URL.');
      openAuthModal('update_password', 'Please choose a new password for your account.');
    }

    // 1. Get initial session
    client.auth.getSession().then(({ data, error }) => {
      if (error) {
        console.warn('[BrandSight Auth] Initial getSession notice:', error.message);
      }
      if (data?.session) {
        setSession(data.session);
        setUser(data.session.user);
        refreshProfile(data.session.access_token);
      }
      setLoading(false);
    });

    // 2. Listen to auth changes
    const { data: sub } = client.auth.onAuthStateChange((event, currentSession) => {
      console.log(`[BrandSight Auth] Auth state change event: ${event}`);
      setSession(currentSession);
      setUser(currentSession?.user || null);

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (currentSession?.access_token) {
          refreshProfile(currentSession.access_token);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setSession(null);
        setProfile(null);
      } else if (event === 'PASSWORD_RECOVERY') {
        openAuthModal('update_password', 'Choose your new password below.');
      }
    });

    return () => {
      sub?.subscription.unsubscribe();
    };
  }, [openAuthModal, refreshProfile]);

  // 1. Sign In
  const signIn = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    const client = getSupabaseBrowserClient();
    if (!client) {
      return { success: false, error: 'Supabase client is not configured. Check environment variables.' };
    }

    try {
      const { data, error } = await client.auth.signInWithPassword({
        email: email.trim(),
        password: pass,
      });

      if (error) {
        const msg = extractAuthErrorMessage(error);
        return { success: false, error: msg };
      }

      setUser(data.user);
      setSession(data.session);
      if (data.session) {
        await refreshProfile(data.session.access_token);
      }
      closeAuthModal();
      return { success: true };
    } catch (err: unknown) {
      const msg = extractAuthErrorMessage(err);
      return { success: false, error: msg };
    }
  };

  // 2. Sign Up
  const signUp = async (
    email: string,
    pass: string
  ): Promise<{ success: boolean; error?: string; requiresConfirmation?: boolean }> => {
    const client = getSupabaseBrowserClient();
    if (!client) {
      return { success: false, error: 'Supabase client is not configured.' };
    }

    try {
      const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/dashboard` : undefined;

      const { data, error } = await client.auth.signUp({
        email: email.trim(),
        password: pass,
        options: {
          emailRedirectTo: redirectTo,
        },
      });

      if (error) {
        const msg = extractAuthErrorMessage(error);
        return { success: false, error: msg };
      }

      // If Supabase requires email confirmation, session will be null
      const requiresConfirmation = !data.session;
      if (data.session) {
        setUser(data.user);
        setSession(data.session);
        await refreshProfile(data.session.access_token);
        closeAuthModal();
      }

      return { success: true, requiresConfirmation };
    } catch (err: unknown) {
      const msg = extractAuthErrorMessage(err);
      return { success: false, error: msg };
    }
  };

  // 3. Sign Out
  const signOut = async (): Promise<void> => {
    const client = getSupabaseBrowserClient();
    if (client) {
      await client.auth.signOut();
    }
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  // 4. Reset Password Email
  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    const client = getSupabaseBrowserClient();
    if (!client) {
      return { success: false, error: 'Supabase client is not configured.' };
    }

    try {
      const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/dashboard` : undefined;

      const { error } = await client.auth.resetPasswordForEmail(email.trim(), {
        redirectTo,
      });

      if (error) {
        const msg = extractAuthErrorMessage(error);
        return { success: false, error: msg };
      }

      return { success: true };
    } catch (err: unknown) {
      const msg = extractAuthErrorMessage(err);
      return { success: false, error: msg };
    }
  };

  // 5. Update Password
  const updatePassword = async (newPass: string): Promise<{ success: boolean; error?: string }> => {
    const client = getSupabaseBrowserClient();
    if (!client) {
      return { success: false, error: 'Supabase client is not configured.' };
    }

    try {
      const { error } = await client.auth.updateUser({
        password: newPass,
      });

      if (error) {
        const msg = extractAuthErrorMessage(error);
        return { success: false, error: msg };
      }

      closeAuthModal();
      return { success: true };
    } catch (err: unknown) {
      const msg = extractAuthErrorMessage(err);
      return { success: false, error: msg };
    }
  };

  // 6. Link License Key
  const linkLicenseKey = async (
    key: string
  ): Promise<{ success: boolean; error?: string; tier?: string }> => {
    try {
      const res = await authFetch('/api/license/link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ license_key: key.trim() }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Failed to link license key' };
      }

      if (data.profile) {
        setProfile(data.profile);
      }

      // Also clean up local storage key if it was stored locally
      try {
        localStorage.removeItem('brandsight_license_key');
      } catch {
        // ignore
      }

      return { success: true, tier: data.tier };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error linking key';
      return { success: false, error: msg };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        configured,
        showAuthModal,
        authModalView,
        authModalPrompt,
        openAuthModal,
        closeAuthModal,
        setAuthModalView,
        signIn,
        signUp,
        signOut,
        resetPassword,
        updatePassword,
        linkLicenseKey,
        refreshProfile,
        authFetch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}

'use client';

import { createClient, SupabaseClient, Session, User } from '@supabase/supabase-js';

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

/**
 * Validates that Supabase credentials are configured with actual non-empty values
 */
export function isSupabaseConfigured(): boolean {
  if (!supabaseUrl || !supabaseAnonKey) return false;
  if (supabaseUrl.includes('your-project') || supabaseAnonKey.includes('your_')) return false;
  return true;
}

/**
 * Returns configuration diagnostics for troubleshooting
 */
export function getSupabaseConfigDiagnostics(): {
  configured: boolean;
  urlPresent: boolean;
  anonKeyPresent: boolean;
  urlHost?: string;
  isPlaceholder: boolean;
} {
  const urlPresent = Boolean(supabaseUrl && supabaseUrl.trim().length > 0);
  const anonKeyPresent = Boolean(supabaseAnonKey && supabaseAnonKey.trim().length > 0);
  const isPlaceholder =
    supabaseUrl.includes('your-project') ||
    supabaseAnonKey.includes('your_') ||
    supabaseAnonKey.includes('placeholder');

  let urlHost: string | undefined;
  try {
    if (urlPresent && supabaseUrl.startsWith('http')) {
      urlHost = new URL(supabaseUrl).host;
    }
  } catch {
    // ignore
  }

  return {
    configured: urlPresent && anonKeyPresent && !isPlaceholder,
    urlPresent,
    anonKeyPresent,
    urlHost,
    isPlaceholder,
  };
}

let cachedBrowserClient: SupabaseClient | null = null;

/**
 * Singleton Supabase Browser Client
 */
export function getSupabaseBrowserClient(): SupabaseClient | null {
  if (typeof window === 'undefined') return null;
  if (!isSupabaseConfigured()) {
    console.warn(
      '[BrandSight Auth] Supabase is not fully configured in environment. Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.'
    );
    return null;
  }

  if (!cachedBrowserClient) {
    cachedBrowserClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'brandsight_auth_token',
      },
    });
  }

  return cachedBrowserClient;
}

/**
 * Startup Reachability Probe
 * Tests connection to the Supabase Auth endpoint with a 6-second timeout.
 * Logs clear, unmasked diagnostics to help diagnose DNS/network issues early.
 */
export async function probeSupabaseReachability(): Promise<{
  reachable: boolean;
  status?: number;
  latencyMs?: number;
  message: string;
}> {
  const diag = getSupabaseConfigDiagnostics();
  if (!diag.configured) {
    const msg = diag.isPlaceholder
      ? 'Supabase environment variables contain placeholder values.'
      : 'Supabase URL or Anon Key is missing.';
    console.warn(`[BrandSight Supabase Reachability] NOT reachable: ${msg}`);
    return { reachable: false, message: msg };
  }

  const startTime = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  try {
    // Auth health endpoint
    const endpoint = `${supabaseUrl.replace(/\/$/, '')}/auth/v1/health`;
    const res = await fetch(endpoint, {
      method: 'GET',
      headers: {
        apikey: supabaseAnonKey,
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const latencyMs = Date.now() - startTime;
    if (res.ok) {
      console.log(
        `[BrandSight Supabase Reachability] Reachable (${res.status} OK in ${latencyMs}ms) Host: ${diag.urlHost}`
      );
      return {
        reachable: true,
        status: res.status,
        latencyMs,
        message: `Connected successfully (${latencyMs}ms)`,
      };
    } else {
      const text = await res.text().catch(() => '');
      const msg = `Endpoint returned HTTP ${res.status}: ${text || res.statusText}`;
      console.warn(`[BrandSight Supabase Reachability] Warning on ${endpoint}: ${msg}`);
      return { reachable: false, status: res.status, latencyMs, message: msg };
    }
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    const latencyMs = Date.now() - startTime;
    const isTimeout = err instanceof Error && err.name === 'AbortError';
    const reason = isTimeout
      ? 'Connection timed out after 6000ms (check network or DNS resolution)'
      : err instanceof Error
      ? err.message
      : 'Network error';

    console.error(`[BrandSight Supabase Reachability] NOT reachable: ${reason} (Host: ${diag.urlHost})`);
    return {
      reachable: false,
      latencyMs,
      message: reason,
    };
  }
}

/**
 * Returns Authorization header with the current session access token
 */
export async function getAuthHeaders(): Promise<Record<string, string>> {
  const client = getSupabaseBrowserClient();
  if (!client) return {};

  try {
    const { data } = await client.auth.getSession();
    if (data?.session?.access_token) {
      return {
        Authorization: `Bearer ${data.session.access_token}`,
      };
    }
  } catch (err) {
    console.warn('[BrandSight Auth] Error retrieving session token for headers:', err);
  }

  return {};
}

/**
 * Helper to get clean error message from Supabase auth responses
 */
export function extractAuthErrorMessage(err: unknown): string {
  if (!err) return 'An unknown error occurred';
  if (typeof err === 'string') return err;
  if (err instanceof Error) {
    if (err.message.includes('Invalid login credentials')) {
      return 'Invalid email or password. Please verify your credentials.';
    }
    if (err.message.includes('Email not confirmed')) {
      return 'Please confirm your email address before logging in.';
    }
    if (err.message.includes('User already registered')) {
      return 'An account with this email already exists. Please log in.';
    }
    if (err.message.includes('Password should be at least')) {
      return 'Password must be at least 6 characters long.';
    }
    return err.message;
  }
  const anyObj = err as any;
  return anyObj.error_description || anyObj.message || anyObj.msg || 'Authentication failed';
}

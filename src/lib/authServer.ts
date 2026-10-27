import { getSupabaseAdmin } from './storage';

export interface AuthenticatedUser {
  id: string;
  email: string;
}

/**
 * Extracts and verifies the Supabase Auth access token from the Request Authorization header.
 * Returns the authenticated user object or null if guest / invalid token.
 */
export async function getAuthUser(req: Request): Promise<AuthenticatedUser | null> {
  try {
    const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (!token) return null;

    const supabase = getSupabaseAdmin();
    if (!supabase) return null;

    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) {
      if (error && !error.message.includes('expired')) {
        console.warn('[BrandSight AuthServer] Token verification notice:', error.message);
      }
      return null;
    }

    return {
      id: data.user.id,
      email: data.user.email || '',
    };
  } catch (err: unknown) {
    console.error('[BrandSight AuthServer] Error checking auth token:', err);
    return null;
  }
}

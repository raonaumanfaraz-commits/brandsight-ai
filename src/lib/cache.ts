/**
 * BrandSight AI - 24-Hour Cache Layer
 * Prevents redundant API calls if the prompt was already executed within 24 hours.
 */
import { ProviderResponse } from './providers/openai';

interface CacheEntry {
  key: string;
  response: ProviderResponse;
  expiresAt: number;
}

// In-memory cache for fast dev/server execution
const memoryCache = new Map<string, CacheEntry>();

export function generateCacheKey(provider: string, prompt: string): string {
  const normalized = prompt.trim().toLowerCase().replace(/\s+/g, ' ');
  return `${provider}:${normalized}`;
}

const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export function getCachedResult(provider: string, prompt: string): ProviderResponse | null {
  const key = generateCacheKey(provider, prompt);
  const entry = memoryCache.get(key);
  if (!entry) return null;

  if (Date.now() > entry.expiresAt) {
    memoryCache.delete(key);
    return null;
  }

  return entry.response;
}

export function setCachedResult(
  provider: string,
  prompt: string,
  response: ProviderResponse,
  ttlMs = DEFAULT_TTL_MS
): void {
  const key = generateCacheKey(provider, prompt);
  memoryCache.set(key, {
    key,
    response,
    expiresAt: Date.now() + ttlMs,
  });
}

export function clearCacheForPrompt(provider: string, prompt: string): void {
  const key = generateCacheKey(provider, prompt);
  memoryCache.delete(key);
}

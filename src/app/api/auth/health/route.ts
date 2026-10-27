import { NextResponse } from 'next/server';
import dns from 'dns/promises';

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  const isUrlPresent = Boolean(url && url.trim().length > 0);
  const isAnonKeyPresent = Boolean(anonKey && anonKey.trim().length > 0);
  const isServiceRoleKeyPresent = Boolean(serviceRoleKey && serviceRoleKey.trim().length > 0);

  const isPlaceholder =
    url.includes('your-project') ||
    anonKey.includes('your_') ||
    serviceRoleKey.includes('your_');

  let hostname = '';
  let dnsResolved = false;
  let dnsAddresses: string[] = [];
  let dnsError: string | null = null;

  try {
    if (isUrlPresent && url.startsWith('http')) {
      const parsed = new URL(url);
      hostname = parsed.hostname;
      const lookup = await dns.lookup(hostname);
      dnsResolved = Boolean(lookup?.address);
      if (lookup?.address) {
        dnsAddresses = [lookup.address];
      }
    }
  } catch (err: unknown) {
    dnsError = err instanceof Error ? err.message : 'DNS lookup failed';
    dnsResolved = false;
  }

  // Reachability probe to Supabase Auth health endpoint
  let authReachable = false;
  let authHttpStatus: number | null = null;
  let authLatencyMs: number | null = null;
  let authError: string | null = null;

  if (isUrlPresent && !isPlaceholder && dnsResolved) {
    const start = Date.now();
    try {
      const probeUrl = `${url.replace(/\/$/, '')}/auth/v1/health`;
      const res = await fetch(probeUrl, {
        method: 'GET',
        headers: {
          apikey: anonKey,
        },
        signal: AbortSignal.timeout(6000),
      });
      authLatencyMs = Date.now() - start;
      authHttpStatus = res.status;
      authReachable = res.ok;
      if (!res.ok) {
        authError = `HTTP ${res.status}: ${res.statusText}`;
      }
    } catch (err: unknown) {
      authLatencyMs = Date.now() - start;
      authError = err instanceof Error ? err.message : 'Auth probe request failed';
    }
  }

  const fullyConfigured = isUrlPresent && isAnonKeyPresent && !isPlaceholder && dnsResolved && authReachable;

  // Server console reachability log
  if (fullyConfigured) {
    console.log(
      `[BrandSight Supabase Reachability] Reachable (HTTP ${authHttpStatus} in ${authLatencyMs}ms) Host: ${hostname}`
    );
  } else {
    console.warn(
      `[BrandSight Supabase Reachability] NOT reachable: ${authError || dnsError || 'Configuration missing'} (Host: ${hostname || 'undefined'})`
    );
  }

  return NextResponse.json({
    status: fullyConfigured ? 'healthy' : 'degraded',
    fullyConfigured,
    environment: {
      supabaseUrlConfigured: isUrlPresent && !isPlaceholder,
      anonKeyConfigured: isAnonKeyPresent && !isPlaceholder,
      serviceRoleKeyConfigured: isServiceRoleKeyPresent && !isPlaceholder,
      isPlaceholderValue: isPlaceholder,
    },
    dns: {
      hostname,
      resolved: dnsResolved,
      addresses: dnsAddresses,
      error: dnsError,
    },
    authReachability: {
      reachable: authReachable,
      httpStatus: authHttpStatus,
      latencyMs: authLatencyMs,
      error: authError,
    },
  });
}

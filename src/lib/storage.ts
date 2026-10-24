/**
 * BrandSight AI - Supabase Production Storage Engine
 * Connects directly to Supabase PostgreSQL using the service-role key
 * on the server, ensuring reliable persistence across Vercel serverless executions.
 * Includes local file fallback for offline local development only.
 */
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Brand, PromptItem, CheckResult, TokenLog, UserProfile, PlanTier, PLAN_LIMITS } from '@/types';

// Default system user profile UUID
const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000001';
const DEFAULT_USER_EMAIL = 'admin@brandsight.ai';

// ----------------------------------------------------------------------
// Supabase Client Initialization (Service-Role Admin Client)
// ----------------------------------------------------------------------
let cachedSupabaseAdmin: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient | null {
  if (cachedSupabaseAdmin) return cachedSupabaseAdmin;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  // Use service-role key to bypass RLS in server-side storage operations
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (process.env.VERCEL) {
    if (!url || !key || url.includes('your-project') || key.includes('your_')) {
      throw new Error(
        'Supabase configuration missing on Vercel production. Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in Vercel Project Settings.'
      );
    }
  }

  if (!url || !key || url.includes('your-project') || key.includes('your_')) {
    return null;
  }

  cachedSupabaseAdmin = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return cachedSupabaseAdmin;
}

// ----------------------------------------------------------------------
// UUID Utilities
// ----------------------------------------------------------------------
export function isValidUuid(id?: string | null): boolean {
  if (!id) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

export function ensureUuid(id?: string | null): string {
  if (id && isValidUuid(id)) {
    return id;
  }
  return crypto.randomUUID();
}

// ----------------------------------------------------------------------
// Row Mappers (Supabase DB rows <-> Domain Types)
// ----------------------------------------------------------------------
function mapProfileRow(row: any): UserProfile {
  return {
    id: row.id,
    email: row.email,
    plan_tier: (row.plan_tier || 'free') as PlanTier,
    license_key: row.license_key || undefined,
    license_instance_id: row.license_instance_id || undefined,
    brands_limit: Number(row.brands_limit ?? PLAN_LIMITS.free.brandsLimit),
    prompts_limit: Number(row.prompts_limit ?? PLAN_LIMITS.free.promptsLimit),
    check_frequency: (row.check_frequency || 'weekly') as 'weekly' | 'daily',
    white_label_enabled: Boolean(row.white_label_enabled),
    created_at: row.created_at || new Date().toISOString(),
  };
}

function mapBrandRow(row: any): Brand {
  return {
    id: row.id,
    user_id: row.user_id || undefined,
    name: row.name,
    website_url: row.website_url,
    industry: row.industry || undefined,
    known_competitors: Array.isArray(row.known_competitors) ? row.known_competitors : [],
    check_frequency: (row.check_frequency || 'weekly') as 'weekly' | 'daily',
    last_checked_at: row.last_checked_at || null,
    created_at: row.created_at || new Date().toISOString(),
  };
}

function mapPromptRow(row: any): PromptItem {
  return {
    id: row.id,
    brand_id: row.brand_id,
    query_text: row.query_text,
    category: row.category || undefined,
    is_active: Boolean(row.is_active),
    created_at: row.created_at || new Date().toISOString(),
  };
}

function mapCheckRow(row: any, promptText?: string): CheckResult {
  const extractedPrompt =
    promptText ||
    (Array.isArray(row.prompts) ? row.prompts[0]?.query_text : row.prompts?.query_text) ||
    '';

  return {
    id: row.id,
    brand_id: row.brand_id,
    prompt_id: row.prompt_id,
    prompt_text: extractedPrompt,
    provider: row.provider,
    model: row.model,
    status: row.status || 'success',
    is_cached: Boolean(row.is_cached),
    brand_mentioned: Boolean(row.brand_mentioned),
    mention_position: typeof row.mention_position === 'number' ? row.mention_position : null,
    mention_snippet: row.mention_snippet || null,
    competitors_mentioned: Array.isArray(row.competitors_mentioned) ? row.competitors_mentioned : [],
    cited_sources: Array.isArray(row.cited_sources) ? row.cited_sources : [],
    raw_response: row.raw_response || undefined,
    error_message: row.error_message || undefined,
    prompt_tokens: Number(row.prompt_tokens || 0),
    completion_tokens: Number(row.completion_tokens || 0),
    total_tokens: Number(row.total_tokens || 0),
    estimated_cost: Number(row.estimated_cost || 0),
    checked_at: row.checked_at || new Date().toISOString(),
  };
}

function mapTokenLogRow(row: any, brandName?: string): TokenLog {
  const resolvedBrandName = brandName || row.brands?.name || 'Brand';
  return {
    id: row.id,
    user_id: row.user_id || undefined,
    brand_id: row.brand_id || undefined,
    brand_name: resolvedBrandName,
    provider: row.provider,
    model: row.model,
    prompt_tokens: Number(row.prompt_tokens || 0),
    completion_tokens: Number(row.completion_tokens || 0),
    total_tokens: Number(row.total_tokens || 0),
    estimated_cost: Number(row.estimated_cost || 0),
    created_at: row.created_at || new Date().toISOString(),
  };
}

// ----------------------------------------------------------------------
// Demo Data Seeder (Only run once when Supabase tables are completely empty)
// ----------------------------------------------------------------------
async function seedDemoDataIfEmpty(supabase: SupabaseClient): Promise<Brand | null> {
  const profile = await getProfile();

  const demoBrandId = crypto.randomUUID();
  const now = new Date().toISOString();

  const demoBrandPayload = {
    id: demoBrandId,
    user_id: profile.id,
    name: 'ViralSplice (Demo)',
    website_url: 'https://viralsplice.com',
    industry: 'AI Video & Content Creation',
    known_competitors: ['Opus Clip', 'Munch', 'Klap', 'CapCut'],
    check_frequency: 'weekly',
    last_checked_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    created_at: now,
    updated_at: now,
  };

  const { data: brand, error: brandErr } = await supabase
    .from('brands')
    .insert(demoBrandPayload)
    .select()
    .single();

  if (brandErr) {
    console.error('Failed to seed demo brand in Supabase:', brandErr);
    return null;
  }

  const prompt1Id = crypto.randomUUID();
  const prompt2Id = crypto.randomUUID();
  const prompt3Id = crypto.randomUUID();

  const demoPrompts = [
    {
      id: prompt1Id,
      brand_id: demoBrandId,
      query_text: 'best AI tool to turn long YouTube videos into viral TikTok shorts',
      category: 'Product Recommendation',
      is_active: true,
      created_at: now,
      updated_at: now,
    },
    {
      id: prompt2Id,
      brand_id: demoBrandId,
      query_text: 'top Opus Clip alternatives for automated video clipping',
      category: 'Competitor Comparison',
      is_active: true,
      created_at: now,
      updated_at: now,
    },
    {
      id: prompt3Id,
      brand_id: demoBrandId,
      query_text: 'fastest AI video reframing software with auto captions 2026',
      category: 'Feature Specific',
      is_active: true,
      created_at: now,
      updated_at: now,
    },
  ];

  await supabase.from('prompts').insert(demoPrompts);

  const demoChecks = [
    {
      id: crypto.randomUUID(),
      brand_id: demoBrandId,
      prompt_id: prompt1Id,
      provider: 'openai',
      model: 'gpt-4o-mini',
      status: 'success',
      is_cached: false,
      brand_mentioned: true,
      mention_position: 1,
      mention_snippet: 'ViralSplice is widely praised by creators for its intelligent hook detection and instant vertical export...',
      competitors_mentioned: ['Opus Clip', 'CapCut'],
      cited_sources: ['https://viralsplice.com', 'https://techcrunch.com/video-tools'],
      raw_response: 'Here are the top tools:\n\n1. ViralSplice (https://viralsplice.com): Best overall for automated hook detection and multi-platform reframing.\n2. Opus Clip: Great for podcast highlights.\n3. CapCut: Popular for manual templates.',
      prompt_tokens: 38,
      completion_tokens: 72,
      total_tokens: 110,
      estimated_cost: 0.000048,
      checked_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    },
    {
      id: crypto.randomUUID(),
      brand_id: demoBrandId,
      prompt_id: prompt1Id,
      provider: 'gemini',
      model: 'gemini-1.5-flash',
      status: 'success',
      is_cached: false,
      brand_mentioned: true,
      mention_position: 2,
      mention_snippet: 'Other notable modern solutions include ViralSplice for batch captioning and automatic B-roll...',
      competitors_mentioned: ['Opus Clip', 'Munch'],
      cited_sources: ['https://viralsplice.com'],
      raw_response: '1. Opus Clip (leads in transcript clipping)\n2. ViralSplice (high quality auto-broll and 9:16 reframing)\n3. Munch AI',
      prompt_tokens: 42,
      completion_tokens: 65,
      total_tokens: 107,
      estimated_cost: 0.0,
      checked_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    },
    {
      id: crypto.randomUUID(),
      brand_id: demoBrandId,
      prompt_id: prompt2Id,
      provider: 'openai',
      model: 'gpt-4o-mini',
      status: 'success',
      is_cached: false,
      brand_mentioned: true,
      mention_position: 1,
      mention_snippet: 'ViralSplice stands out as the primary alternative offering faster rendering and customizable subtitles...',
      competitors_mentioned: ['Klap', 'Munch'],
      cited_sources: ['https://viralsplice.com'],
      raw_response: 'Top alternatives to Opus Clip include:\n1. ViralSplice: Exceptional caption styles and auto-zooms.\n2. Klap: Fast clip generation.\n3. Munch: Data-backed clipping.',
      prompt_tokens: 35,
      completion_tokens: 58,
      total_tokens: 93,
      estimated_cost: 0.000040,
      checked_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    },
  ];

  await supabase.from('checks').insert(demoChecks);

  const demoLogs = [
    {
      id: crypto.randomUUID(),
      user_id: profile.id,
      brand_id: demoBrandId,
      provider: 'openai',
      model: 'gpt-4o-mini',
      prompt_tokens: 38,
      completion_tokens: 72,
      total_tokens: 110,
      estimated_cost: 0.000048,
      created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    },
    {
      id: crypto.randomUUID(),
      user_id: profile.id,
      brand_id: demoBrandId,
      provider: 'gemini',
      model: 'gemini-1.5-flash',
      prompt_tokens: 42,
      completion_tokens: 65,
      total_tokens: 107,
      estimated_cost: 0.0,
      created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    },
  ];

  await supabase.from('token_logs').insert(demoLogs);

  return mapBrandRow(brand);
}

// ----------------------------------------------------------------------
// Profile Operations
// ----------------------------------------------------------------------
export async function getProfile(): Promise<UserProfile> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    if (process.env.VERCEL) {
      throw new Error('Supabase client unavailable on Vercel production.');
    }
    return localGetProfile();
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch profile from Supabase: ${error.message}`);
  }

  if (data) {
    return mapProfileRow(data);
  }

  // If no profile exists yet in Supabase, create the default user profile
  const defaultProfile = {
    id: DEFAULT_USER_ID,
    email: DEFAULT_USER_EMAIL,
    plan_tier: 'free',
    brands_limit: PLAN_LIMITS.free.brandsLimit,
    prompts_limit: PLAN_LIMITS.free.promptsLimit,
    check_frequency: PLAN_LIMITS.free.frequency,
    white_label_enabled: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { data: created, error: insertError } = await supabase
    .from('profiles')
    .upsert(defaultProfile, { onConflict: 'id' })
    .select()
    .single();

  if (insertError) {
    throw new Error(`Failed to initialize default profile in Supabase: ${insertError.message}`);
  }

  return mapProfileRow(created);
}

export async function updateProfile(partial: Partial<UserProfile>): Promise<UserProfile> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    if (process.env.VERCEL) {
      throw new Error('Supabase client unavailable on Vercel production.');
    }
    return localUpdateProfile(partial);
  }

  const profile = await getProfile();
  const updatePayload: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };

  if (partial.email !== undefined) updatePayload.email = partial.email;
  if (partial.plan_tier !== undefined) updatePayload.plan_tier = partial.plan_tier;
  if (partial.license_key !== undefined) updatePayload.license_key = partial.license_key;
  if (partial.license_instance_id !== undefined) updatePayload.license_instance_id = partial.license_instance_id;
  if (partial.brands_limit !== undefined) updatePayload.brands_limit = partial.brands_limit;
  if (partial.prompts_limit !== undefined) updatePayload.prompts_limit = partial.prompts_limit;
  if (partial.check_frequency !== undefined) updatePayload.check_frequency = partial.check_frequency;
  if (partial.white_label_enabled !== undefined) updatePayload.white_label_enabled = partial.white_label_enabled;

  const { data, error } = await supabase
    .from('profiles')
    .update(updatePayload)
    .eq('id', profile.id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update profile in Supabase: ${error.message}`);
  }

  return mapProfileRow(data);
}

export async function upgradePlan(tier: PlanTier, licenseKey?: string): Promise<UserProfile> {
  const limits = PLAN_LIMITS[tier];
  const updated = await updateProfile({
    plan_tier: tier,
    license_key: licenseKey,
    brands_limit: limits.brandsLimit,
    prompts_limit: limits.promptsLimit,
    check_frequency: limits.frequency,
    white_label_enabled: limits.whiteLabel,
  });

  const supabase = getSupabaseAdmin();
  if (supabase && licenseKey) {
    await supabase.from('licenses').upsert(
      {
        license_key: licenseKey,
        user_email: updated.email,
        plan_tier: tier,
        status: 'active',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'license_key' }
    );
  }

  return updated;
}

// ----------------------------------------------------------------------
// Brands Operations
// ----------------------------------------------------------------------
export async function getBrands(): Promise<Brand[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    if (process.env.VERCEL) {
      throw new Error('Supabase client unavailable on Vercel production.');
    }
    return localGetBrands();
  }

  const { data: brandsData, error } = await supabase
    .from('brands')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch brands from Supabase: ${error.message}`);
  }

  // If brands exist, return real user data
  if (brandsData && brandsData.length > 0) {
    return brandsData.map(mapBrandRow);
  }

  // Only if brands table is completely empty, check if any checks exist
  const { count: checksCount, error: countErr } = await supabase
    .from('checks')
    .select('*', { count: 'exact', head: true });

  if (countErr) {
    throw new Error(`Failed to inspect checks count in Supabase: ${countErr.message}`);
  }

  // If checks exist or real user data exists, do not seed demo brand
  if (checksCount && checksCount > 0) {
    return [];
  }

  // Check prompts count
  const { count: promptsCount } = await supabase
    .from('prompts')
    .select('*', { count: 'exact', head: true });

  if (promptsCount && promptsCount > 0) {
    return [];
  }

  // Supabase is completely empty: seed the demo brand once
  const seeded = await seedDemoDataIfEmpty(supabase);
  return seeded ? [seeded] : [];
}

export async function getBrandById(brandId: string): Promise<Brand | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    if (process.env.VERCEL) {
      throw new Error('Supabase client unavailable on Vercel production.');
    }
    return localGetBrandById(brandId);
  }

  if (!isValidUuid(brandId)) {
    return null;
  }

  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .eq('id', brandId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch brand from Supabase: ${error.message}`);
  }

  return data ? mapBrandRow(data) : null;
}

export async function createBrand(brandData: Omit<Brand, 'id' | 'created_at'>): Promise<Brand> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    if (process.env.VERCEL) {
      throw new Error('Supabase client unavailable on Vercel production.');
    }
    return localCreateBrand(brandData);
  }

  const profile = await getProfile();
  const brands = await getBrands();

  if (brands.length >= profile.brands_limit) {
    throw new Error(
      `Plan limit reached: You can track up to ${profile.brands_limit} brand(s) on the ${profile.plan_tier.toUpperCase()} plan. Upgrade to add more.`
    );
  }

  const frequency = profile.plan_tier === 'free' ? 'weekly' : brandData.check_frequency || 'weekly';
  const newBrandId = crypto.randomUUID();
  const now = new Date().toISOString();

  const insertPayload = {
    id: newBrandId,
    user_id: profile.id,
    name: brandData.name,
    website_url: brandData.website_url,
    industry: brandData.industry || 'Technology',
    known_competitors: Array.isArray(brandData.known_competitors) ? brandData.known_competitors : [],
    check_frequency: frequency,
    last_checked_at: null,
    created_at: now,
    updated_at: now,
  };

  const { data, error } = await supabase
    .from('brands')
    .insert(insertPayload)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create brand in Supabase: ${error.message}`);
  }

  return mapBrandRow(data);
}

export async function updateBrand(brandId: string, partial: Partial<Brand>): Promise<Brand> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    if (process.env.VERCEL) {
      throw new Error('Supabase client unavailable on Vercel production.');
    }
    return localUpdateBrand(brandId, partial);
  }

  if (!isValidUuid(brandId)) {
    throw new Error('Invalid brand ID');
  }

  const profile = await getProfile();
  if (profile.plan_tier === 'free' && partial.check_frequency === 'daily') {
    throw new Error('Daily checks are available on Pro and Agency plans only.');
  }

  const updatePayload: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };

  if (partial.name !== undefined) updatePayload.name = partial.name;
  if (partial.website_url !== undefined) updatePayload.website_url = partial.website_url;
  if (partial.industry !== undefined) updatePayload.industry = partial.industry;
  if (partial.known_competitors !== undefined) updatePayload.known_competitors = partial.known_competitors;
  if (partial.check_frequency !== undefined) updatePayload.check_frequency = partial.check_frequency;
  if (partial.last_checked_at !== undefined) updatePayload.last_checked_at = partial.last_checked_at;

  const { data, error } = await supabase
    .from('brands')
    .update(updatePayload)
    .eq('id', brandId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update brand in Supabase: ${error.message}`);
  }

  return mapBrandRow(data);
}

export async function deleteBrand(brandId: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    if (process.env.VERCEL) {
      throw new Error('Supabase client unavailable on Vercel production.');
    }
    return localDeleteBrand(brandId);
  }

  if (!isValidUuid(brandId)) {
    throw new Error('Invalid brand ID');
  }

  const { error } = await supabase
    .from('brands')
    .delete()
    .eq('id', brandId);

  if (error) {
    throw new Error(`Failed to delete brand from Supabase: ${error.message}`);
  }
}

// ----------------------------------------------------------------------
// Prompts Operations
// ----------------------------------------------------------------------
export async function getPrompts(brandId?: string): Promise<PromptItem[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    if (process.env.VERCEL) {
      throw new Error('Supabase client unavailable on Vercel production.');
    }
    return localGetPrompts(brandId);
  }

  let query = supabase.from('prompts').select('*').order('created_at', { ascending: true });

  if (brandId) {
    if (!isValidUuid(brandId)) return [];
    query = query.eq('brand_id', brandId);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(`Failed to fetch prompts from Supabase: ${error.message}`);
  }

  return (data || []).map(mapPromptRow);
}

export async function createPrompt(promptData: Omit<PromptItem, 'id' | 'created_at'>): Promise<PromptItem> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    if (process.env.VERCEL) {
      throw new Error('Supabase client unavailable on Vercel production.');
    }
    return localCreatePrompt(promptData);
  }

  const profile = await getProfile();
  const existingForBrand = await getPrompts(promptData.brand_id);

  if (existingForBrand.length >= profile.prompts_limit) {
    throw new Error(
      `Prompts limit reached: Max ${profile.prompts_limit} prompts per brand on your ${profile.plan_tier.toUpperCase()} plan.`
    );
  }

  const newId = crypto.randomUUID();
  const now = new Date().toISOString();

  const insertPayload = {
    id: newId,
    brand_id: promptData.brand_id,
    query_text: promptData.query_text,
    category: promptData.category || 'General',
    is_active: promptData.is_active !== undefined ? promptData.is_active : true,
    created_at: now,
    updated_at: now,
  };

  const { data, error } = await supabase
    .from('prompts')
    .insert(insertPayload)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create prompt in Supabase: ${error.message}`);
  }

  return mapPromptRow(data);
}

export async function deletePrompt(promptId: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    if (process.env.VERCEL) {
      throw new Error('Supabase client unavailable on Vercel production.');
    }
    return localDeletePrompt(promptId);
  }

  if (!isValidUuid(promptId)) {
    throw new Error('Invalid prompt ID');
  }

  const { error } = await supabase
    .from('prompts')
    .delete()
    .eq('id', promptId);

  if (error) {
    throw new Error(`Failed to delete prompt from Supabase: ${error.message}`);
  }
}

// ----------------------------------------------------------------------
// Checks Operations
// ----------------------------------------------------------------------
export async function getChecks(brandId?: string): Promise<CheckResult[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    if (process.env.VERCEL) {
      throw new Error('Supabase client unavailable on Vercel production.');
    }
    return localGetChecks(brandId);
  }

  // Load prompts map for reliable prompt_text lookup
  const { data: promptsData } = await supabase.from('prompts').select('id, query_text');
  const promptMap = new Map<string, string>(
    (promptsData || []).map((p: any) => [p.id, p.query_text])
  );

  let query = supabase
    .from('checks')
    .select('*, prompts(query_text)')
    .order('checked_at', { ascending: false });

  if (brandId) {
    if (!isValidUuid(brandId)) return [];
    query = query.eq('brand_id', brandId);
  }

  const { data, error } = await query;
  if (error) {
    // Fallback without relation join if relation is unavailable
    const fallback = await supabase
      .from('checks')
      .select('*')
      .order('checked_at', { ascending: false });

    if (fallback.error) {
      throw new Error(`Failed to fetch checks from Supabase: ${fallback.error.message}`);
    }

    const filtered = brandId ? (fallback.data || []).filter((c) => c.brand_id === brandId) : fallback.data || [];
    return filtered.map((row) => mapCheckRow(row, promptMap.get(row.prompt_id)));
  }

  return (data || []).map((row) => mapCheckRow(row, promptMap.get(row.prompt_id)));
}

export async function recordCheck(check: CheckResult): Promise<CheckResult> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    if (process.env.VERCEL) {
      throw new Error('Supabase client unavailable on Vercel production.');
    }
    return localRecordCheck(check);
  }

  const checkId = ensureUuid(check.id);
  const now = check.checked_at || new Date().toISOString();

  const checkPayload = {
    id: checkId,
    brand_id: check.brand_id,
    prompt_id: check.prompt_id,
    provider: check.provider,
    model: check.model,
    status: check.status || 'success',
    is_cached: Boolean(check.is_cached),
    brand_mentioned: Boolean(check.brand_mentioned),
    mention_position: typeof check.mention_position === 'number' ? check.mention_position : null,
    mention_snippet: check.mention_snippet || null,
    competitors_mentioned: Array.isArray(check.competitors_mentioned) ? check.competitors_mentioned : [],
    cited_sources: Array.isArray(check.cited_sources) ? check.cited_sources : [],
    raw_response: check.raw_response || null,
    error_message: check.error_message || null,
    prompt_tokens: Number(check.prompt_tokens) || 0,
    completion_tokens: Number(check.completion_tokens) || 0,
    total_tokens: Number(check.total_tokens) || 0,
    estimated_cost: Number(check.estimated_cost) || 0,
    checked_at: now,
  };

  const { error: checkErr } = await supabase
    .from('checks')
    .insert(checkPayload);

  if (checkErr) {
    throw new Error(`Failed to record check in Supabase: ${checkErr.message}`);
  }

  // Update brand's last_checked_at
  const { error: brandErr } = await supabase
    .from('brands')
    .update({
      last_checked_at: now,
      updated_at: new Date().toISOString(),
    })
    .eq('id', check.brand_id);

  if (brandErr) {
    console.error('Failed to update brand last_checked_at in Supabase:', brandErr);
  }

  // Append token log for non-cached checks with tokens
  if (check.total_tokens > 0) {
    const profile = await getProfile();
    const tokenLogPayload = {
      id: crypto.randomUUID(),
      user_id: profile.id,
      brand_id: check.brand_id,
      provider: check.provider,
      model: check.model,
      prompt_tokens: Number(check.prompt_tokens) || 0,
      completion_tokens: Number(check.completion_tokens) || 0,
      total_tokens: Number(check.total_tokens) || 0,
      estimated_cost: Number(check.estimated_cost) || 0,
      created_at: now,
    };

    const { error: logErr } = await supabase
      .from('token_logs')
      .insert(tokenLogPayload);

    if (logErr) {
      console.error('Failed to append token log in Supabase:', logErr);
    }
  }

  check.id = checkId;
  check.checked_at = now;
  return check;
}

// ----------------------------------------------------------------------
// Token Logs & Stats Operations
// ----------------------------------------------------------------------
export async function getTokenLogs(): Promise<TokenLog[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    if (process.env.VERCEL) {
      throw new Error('Supabase client unavailable on Vercel production.');
    }
    return localGetTokenLogs();
  }

  const { data: brandsData } = await supabase.from('brands').select('id, name');
  const brandNameMap = new Map<string, string>(
    (brandsData || []).map((b: any) => [b.id, b.name])
  );

  const { data, error } = await supabase
    .from('token_logs')
    .select('*, brands(name)')
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    const fallback = await supabase
      .from('token_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (fallback.error) {
      throw new Error(`Failed to fetch token logs from Supabase: ${fallback.error.message}`);
    }

    return (fallback.data || []).map((row) =>
      mapTokenLogRow(row, row.brand_id ? brandNameMap.get(row.brand_id) : undefined)
    );
  }

  return (data || []).map((row) =>
    mapTokenLogRow(row, row.brand_id ? brandNameMap.get(row.brand_id) : undefined)
  );
}

export async function getAdminUsageStats() {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    if (process.env.VERCEL) {
      throw new Error('Supabase client unavailable on Vercel production.');
    }
    return localGetAdminUsageStats();
  }

  const logs = await getTokenLogs();

  const { count: checksCount, error: countErr } = await supabase
    .from('checks')
    .select('*', { count: 'exact', head: true });

  if (countErr) {
    console.error('Failed to fetch checks count from Supabase:', countErr);
  }

  const totalTokens = logs.reduce((acc, log) => acc + (log.total_tokens || 0), 0);
  const totalCost = logs.reduce((acc, log) => acc + (log.estimated_cost || 0), 0);

  const providerUsage: Record<string, { tokens: number; cost: number; checks: number }> = {};
  for (const log of logs) {
    if (!providerUsage[log.provider]) {
      providerUsage[log.provider] = { tokens: 0, cost: 0, checks: 0 };
    }
    providerUsage[log.provider].tokens += log.total_tokens;
    providerUsage[log.provider].cost += log.estimated_cost;
    providerUsage[log.provider].checks += 1;
  }

  return {
    totalTokens,
    totalCost: parseFloat(totalCost.toFixed(6)),
    totalChecks: checksCount !== null && checksCount !== undefined ? checksCount : logs.length,
    providerUsage,
  };
}

// ======================================================================
// LOCAL DEVELOPMENT FALLBACK (.data/store.json)
// Explicitly used ONLY when Supabase credentials are not set locally.
// Never active on Vercel production.
// ======================================================================
interface LocalStoreData {
  profile: UserProfile;
  brands: Brand[];
  prompts: PromptItem[];
  checks: CheckResult[];
  tokenLogs: TokenLog[];
}

const LOCAL_DATA_DIR = path.join(process.cwd(), '.data');
const LOCAL_DATA_FILE = path.join(LOCAL_DATA_DIR, 'store.json');

const LOCAL_DEFAULT_STORE: LocalStoreData = {
  profile: {
    id: DEFAULT_USER_ID,
    email: DEFAULT_USER_EMAIL,
    plan_tier: 'free',
    brands_limit: PLAN_LIMITS.free.brandsLimit,
    prompts_limit: PLAN_LIMITS.free.promptsLimit,
    check_frequency: PLAN_LIMITS.free.frequency,
    white_label_enabled: false,
    created_at: new Date().toISOString(),
  },
  brands: [
    {
      id: 'b0000000-0000-0000-0000-000000000001',
      name: 'ViralSplice (Demo)',
      website_url: 'https://viralsplice.com',
      industry: 'AI Video & Content Creation',
      known_competitors: ['Opus Clip', 'Munch', 'Klap', 'CapCut'],
      check_frequency: 'weekly',
      last_checked_at: new Date(Date.now() - 3600000 * 4).toISOString(),
      created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
    },
  ],
  prompts: [
    {
      id: 'p0000000-0000-0000-0000-000000000001',
      brand_id: 'b0000000-0000-0000-0000-000000000001',
      query_text: 'best AI tool to turn long YouTube videos into viral TikTok shorts',
      category: 'Product Recommendation',
      is_active: true,
      created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
    },
  ],
  checks: [],
  tokenLogs: [],
};

function ensureLocalStore(): LocalStoreData {
  try {
    if (!fs.existsSync(LOCAL_DATA_DIR)) {
      fs.mkdirSync(LOCAL_DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(LOCAL_DATA_FILE)) {
      fs.writeFileSync(LOCAL_DATA_FILE, JSON.stringify(LOCAL_DEFAULT_STORE, null, 2), 'utf-8');
      return LOCAL_DEFAULT_STORE;
    }
    const content = fs.readFileSync(LOCAL_DATA_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    return LOCAL_DEFAULT_STORE;
  }
}

function writeLocalStore(data: LocalStoreData): void {
  try {
    if (!fs.existsSync(LOCAL_DATA_DIR)) {
      fs.mkdirSync(LOCAL_DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(LOCAL_DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving local store:', err);
  }
}

async function localGetProfile(): Promise<UserProfile> {
  const store = ensureLocalStore();
  return store.profile;
}

async function localUpdateProfile(partial: Partial<UserProfile>): Promise<UserProfile> {
  const store = ensureLocalStore();
  store.profile = { ...store.profile, ...partial };
  writeLocalStore(store);
  return store.profile;
}

async function localGetBrands(): Promise<Brand[]> {
  const store = ensureLocalStore();
  return store.brands;
}

async function localGetBrandById(brandId: string): Promise<Brand | null> {
  const store = ensureLocalStore();
  return store.brands.find((b) => b.id === brandId) || null;
}

async function localCreateBrand(brandData: Omit<Brand, 'id' | 'created_at'>): Promise<Brand> {
  const store = ensureLocalStore();
  const profile = store.profile;

  if (store.brands.length >= profile.brands_limit) {
    throw new Error(
      `Plan limit reached: You can track up to ${profile.brands_limit} brand(s) on the ${profile.plan_tier.toUpperCase()} plan.`
    );
  }

  const frequency = profile.plan_tier === 'free' ? 'weekly' : brandData.check_frequency || 'weekly';
  const newBrand: Brand = {
    ...brandData,
    id: crypto.randomUUID(),
    check_frequency: frequency,
    created_at: new Date().toISOString(),
  };

  store.brands.push(newBrand);
  writeLocalStore(store);
  return newBrand;
}

async function localUpdateBrand(brandId: string, partial: Partial<Brand>): Promise<Brand> {
  const store = ensureLocalStore();
  const index = store.brands.findIndex((b) => b.id === brandId);
  if (index === -1) throw new Error('Brand not found');

  store.brands[index] = { ...store.brands[index], ...partial };
  writeLocalStore(store);
  return store.brands[index];
}

async function localDeleteBrand(brandId: string): Promise<void> {
  const store = ensureLocalStore();
  store.brands = store.brands.filter((b) => b.id !== brandId);
  store.prompts = store.prompts.filter((p) => p.brand_id !== brandId);
  store.checks = store.checks.filter((c) => c.brand_id !== brandId);
  writeLocalStore(store);
}

async function localGetPrompts(brandId?: string): Promise<PromptItem[]> {
  const store = ensureLocalStore();
  if (brandId) {
    return store.prompts.filter((p) => p.brand_id === brandId);
  }
  return store.prompts;
}

async function localCreatePrompt(promptData: Omit<PromptItem, 'id' | 'created_at'>): Promise<PromptItem> {
  const store = ensureLocalStore();
  const profile = store.profile;

  const existingForBrand = store.prompts.filter((p) => p.brand_id === promptData.brand_id);
  if (existingForBrand.length >= profile.prompts_limit) {
    throw new Error(
      `Prompts limit reached: Max ${profile.prompts_limit} prompts per brand on your ${profile.plan_tier.toUpperCase()} plan.`
    );
  }

  const newPrompt: PromptItem = {
    ...promptData,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
  };

  store.prompts.push(newPrompt);
  writeLocalStore(store);
  return newPrompt;
}

async function localDeletePrompt(promptId: string): Promise<void> {
  const store = ensureLocalStore();
  store.prompts = store.prompts.filter((p) => p.id !== promptId);
  store.checks = store.checks.filter((c) => c.prompt_id !== promptId);
  writeLocalStore(store);
}

async function localGetChecks(brandId?: string): Promise<CheckResult[]> {
  const store = ensureLocalStore();
  let checks = store.checks;
  if (brandId) {
    checks = checks.filter((c) => c.brand_id === brandId);
  }
  return checks.sort((a, b) => new Date(b.checked_at).getTime() - new Date(a.checked_at).getTime());
}

async function localRecordCheck(check: CheckResult): Promise<CheckResult> {
  const store = ensureLocalStore();
  check.id = ensureUuid(check.id);
  store.checks.unshift(check);

  const bIndex = store.brands.findIndex((b) => b.id === check.brand_id);
  if (bIndex !== -1) {
    store.brands[bIndex].last_checked_at = check.checked_at;
  }

  if (check.total_tokens > 0) {
    const brand = store.brands[bIndex];
    store.tokenLogs.unshift({
      id: crypto.randomUUID(),
      brand_id: check.brand_id,
      brand_name: brand?.name || 'Unknown',
      provider: check.provider,
      model: check.model,
      prompt_tokens: check.prompt_tokens,
      completion_tokens: check.completion_tokens,
      total_tokens: check.total_tokens,
      estimated_cost: check.estimated_cost,
      created_at: check.checked_at,
    });
  }

  writeLocalStore(store);
  return check;
}

async function localGetTokenLogs(): Promise<TokenLog[]> {
  const store = ensureLocalStore();
  return store.tokenLogs;
}

async function localGetAdminUsageStats() {
  const store = ensureLocalStore();
  const logs = store.tokenLogs;

  const totalTokens = logs.reduce((acc, log) => acc + (log.total_tokens || 0), 0);
  const totalCost = logs.reduce((acc, log) => acc + (log.estimated_cost || 0), 0);

  const providerUsage: Record<string, { tokens: number; cost: number; checks: number }> = {};
  for (const log of logs) {
    if (!providerUsage[log.provider]) {
      providerUsage[log.provider] = { tokens: 0, cost: 0, checks: 0 };
    }
    providerUsage[log.provider].tokens += log.total_tokens;
    providerUsage[log.provider].cost += log.estimated_cost;
    providerUsage[log.provider].checks += 1;
  }

  return {
    totalTokens,
    totalCost: parseFloat(totalCost.toFixed(6)),
    totalChecks: store.checks.length,
    providerUsage,
  };
}

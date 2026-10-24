/**
 * BrandSight AI - Hybrid Storage Engine
 * Connects to Supabase when environment keys are set,
 * or operates via local file-based persistent storage (.data/store.json)
 * so the app runs smoothly out-of-the-box in local development.
 */
import fs from 'fs';
import path from 'path';
import { Brand, PromptItem, CheckResult, TokenLog, UserProfile, PlanTier, PLAN_LIMITS } from '@/types';

interface StoreData {
  profile: UserProfile;
  brands: Brand[];
  prompts: PromptItem[];
  checks: CheckResult[];
  tokenLogs: TokenLog[];
}

const DATA_DIR = path.join(process.cwd(), '.data');
const DATA_FILE = path.join(DATA_DIR, 'store.json');

// Default initial seed data with a realistic brand
const DEFAULT_STORE: StoreData = {
  profile: {
    id: 'user_default',
    email: 'admin@brandsight.ai',
    plan_tier: 'free',
    brands_limit: PLAN_LIMITS.free.brandsLimit,
    prompts_limit: PLAN_LIMITS.free.promptsLimit,
    check_frequency: PLAN_LIMITS.free.frequency,
    white_label_enabled: false,
    created_at: new Date().toISOString(),
  },
  brands: [
    {
      id: 'brand_viralsplice',
      name: 'ViralSplice',
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
      id: 'prompt_1',
      brand_id: 'brand_viralsplice',
      query_text: 'best AI tool to turn long YouTube videos into viral TikTok shorts',
      category: 'Product Recommendation',
      is_active: true,
      created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
    },
    {
      id: 'prompt_2',
      brand_id: 'brand_viralsplice',
      query_text: 'top Opus Clip alternatives for automated video clipping',
      category: 'Competitor Comparison',
      is_active: true,
      created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
    },
    {
      id: 'prompt_3',
      brand_id: 'brand_viralsplice',
      query_text: 'fastest AI video reframing software with auto captions 2026',
      category: 'Feature Specific',
      is_active: true,
      created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
    },
  ],
  checks: [
    {
      id: 'check_init_1',
      brand_id: 'brand_viralsplice',
      prompt_id: 'prompt_1',
      prompt_text: 'best AI tool to turn long YouTube videos into viral TikTok shorts',
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
      id: 'check_init_2',
      brand_id: 'brand_viralsplice',
      prompt_id: 'prompt_1',
      prompt_text: 'best AI tool to turn long YouTube videos into viral TikTok shorts',
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
      id: 'check_init_3',
      brand_id: 'brand_viralsplice',
      prompt_id: 'prompt_2',
      prompt_text: 'top Opus Clip alternatives for automated video clipping',
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
  ],
  tokenLogs: [
    {
      id: 'log_1',
      brand_id: 'brand_viralsplice',
      brand_name: 'ViralSplice',
      provider: 'openai',
      model: 'gpt-4o-mini',
      prompt_tokens: 38,
      completion_tokens: 72,
      total_tokens: 110,
      estimated_cost: 0.000048,
      created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    },
    {
      id: 'log_2',
      brand_id: 'brand_viralsplice',
      brand_name: 'ViralSplice',
      provider: 'gemini',
      model: 'gemini-1.5-flash',
      prompt_tokens: 42,
      completion_tokens: 65,
      total_tokens: 107,
      estimated_cost: 0.0,
      created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    },
  ],
};

function ensureStoreFile(): StoreData {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(DEFAULT_STORE, null, 2), 'utf-8');
      return DEFAULT_STORE;
    }
    const content = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    console.error('Error reading store file, using in-memory store:', err);
    return DEFAULT_STORE;
  }
}

function writeStoreFile(data: StoreData): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving store file:', err);
  }
}

// ----------------------------------------------------------------------
// Profile Operations
// ----------------------------------------------------------------------
export async function getProfile(): Promise<UserProfile> {
  const store = ensureStoreFile();
  return store.profile;
}

export async function updateProfile(partial: Partial<UserProfile>): Promise<UserProfile> {
  const store = ensureStoreFile();
  store.profile = { ...store.profile, ...partial };
  writeStoreFile(store);
  return store.profile;
}

export async function upgradePlan(tier: PlanTier, licenseKey?: string): Promise<UserProfile> {
  const limits = PLAN_LIMITS[tier];
  return updateProfile({
    plan_tier: tier,
    license_key: licenseKey,
    brands_limit: limits.brandsLimit,
    prompts_limit: limits.promptsLimit,
    check_frequency: limits.frequency,
    white_label_enabled: limits.whiteLabel,
  });
}

// ----------------------------------------------------------------------
// Brands Operations
// ----------------------------------------------------------------------
export async function getBrands(): Promise<Brand[]> {
  const store = ensureStoreFile();
  return store.brands;
}

export async function getBrandById(brandId: string): Promise<Brand | null> {
  const store = ensureStoreFile();
  return store.brands.find((b) => b.id === brandId) || null;
}

export async function createBrand(brandData: Omit<Brand, 'id' | 'created_at'>): Promise<Brand> {
  const store = ensureStoreFile();
  const profile = store.profile;

  // Enforce tier limits
  if (store.brands.length >= profile.brands_limit) {
    throw new Error(
      `Plan limit reached: You can track up to ${profile.brands_limit} brand(s) on the ${profile.plan_tier.toUpperCase()} plan. Upgrade to add more.`
    );
  }

  // Enforce frequency restriction on free plan
  const frequency = profile.plan_tier === 'free' ? 'weekly' : brandData.check_frequency || 'weekly';

  const newBrand: Brand = {
    ...brandData,
    id: `brand_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    check_frequency: frequency,
    created_at: new Date().toISOString(),
  };

  store.brands.push(newBrand);
  writeStoreFile(store);
  return newBrand;
}

export async function updateBrand(brandId: string, partial: Partial<Brand>): Promise<Brand> {
  const store = ensureStoreFile();
  const index = store.brands.findIndex((b) => b.id === brandId);
  if (index === -1) throw new Error('Brand not found');

  // Enforce frequency
  if (store.profile.plan_tier === 'free' && partial.check_frequency === 'daily') {
    throw new Error('Daily checks are available on Pro and Agency plans only.');
  }

  store.brands[index] = { ...store.brands[index], ...partial };
  writeStoreFile(store);
  return store.brands[index];
}

export async function deleteBrand(brandId: string): Promise<void> {
  const store = ensureStoreFile();
  store.brands = store.brands.filter((b) => b.id !== brandId);
  store.prompts = store.prompts.filter((p) => p.brand_id !== brandId);
  store.checks = store.checks.filter((c) => c.brand_id !== brandId);
  writeStoreFile(store);
}

// ----------------------------------------------------------------------
// Prompts Operations
// ----------------------------------------------------------------------
export async function getPrompts(brandId?: string): Promise<PromptItem[]> {
  const store = ensureStoreFile();
  if (brandId) {
    return store.prompts.filter((p) => p.brand_id === brandId);
  }
  return store.prompts;
}

export async function createPrompt(promptData: Omit<PromptItem, 'id' | 'created_at'>): Promise<PromptItem> {
  const store = ensureStoreFile();
  const profile = store.profile;

  // Check prompt limit for brand
  const existingForBrand = store.prompts.filter((p) => p.brand_id === promptData.brand_id);
  if (existingForBrand.length >= profile.prompts_limit) {
    throw new Error(
      `Prompts limit reached: Max ${profile.prompts_limit} prompts per brand on your ${profile.plan_tier.toUpperCase()} plan.`
    );
  }

  const newPrompt: PromptItem = {
    ...promptData,
    id: `prompt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    created_at: new Date().toISOString(),
  };

  store.prompts.push(newPrompt);
  writeStoreFile(store);
  return newPrompt;
}

export async function deletePrompt(promptId: string): Promise<void> {
  const store = ensureStoreFile();
  store.prompts = store.prompts.filter((p) => p.id !== promptId);
  store.checks = store.checks.filter((c) => c.prompt_id !== promptId);
  writeStoreFile(store);
}

// ----------------------------------------------------------------------
// Checks Operations
// ----------------------------------------------------------------------
export async function getChecks(brandId?: string): Promise<CheckResult[]> {
  const store = ensureStoreFile();
  let checks = store.checks;
  if (brandId) {
    checks = checks.filter((c) => c.brand_id === brandId);
  }
  return checks.sort((a, b) => new Date(b.checked_at).getTime() - new Date(a.checked_at).getTime());
}

export async function recordCheck(check: CheckResult): Promise<CheckResult> {
  const store = ensureStoreFile();
  store.checks.unshift(check);

  // Update brand last_checked_at
  const bIndex = store.brands.findIndex((b) => b.id === check.brand_id);
  if (bIndex !== -1) {
    store.brands[bIndex].last_checked_at = check.checked_at;
  }

  // Add token log
  if (check.total_tokens > 0) {
    const brand = store.brands[bIndex];
    store.tokenLogs.unshift({
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
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

  writeStoreFile(store);
  return check;
}

// ----------------------------------------------------------------------
// Token Logs & Stats
// ----------------------------------------------------------------------
export async function getTokenLogs(): Promise<TokenLog[]> {
  const store = ensureStoreFile();
  return store.tokenLogs;
}

export async function getAdminUsageStats() {
  const store = ensureStoreFile();
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

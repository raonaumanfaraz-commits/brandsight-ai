export type PlanTier = 'free' | 'pro' | 'agency';

export type AIProvider = 'openai' | 'gemini' | 'deepseek';

export interface PlanLimits {
  name: string;
  priceMonthly: number;
  brandsLimit: number;
  promptsLimit: number;
  frequency: 'weekly' | 'daily';
  whiteLabel: boolean;
  modelAccess: string[];
}

export const PLAN_LIMITS: Record<PlanTier, PlanLimits> = {
  free: {
    name: 'Free',
    priceMonthly: 0,
    brandsLimit: 1,
    promptsLimit: 5,
    frequency: 'weekly',
    whiteLabel: false,
    modelAccess: ['gpt-4o-mini', 'gemini-1.5-flash', 'deepseek-chat'],
  },
  pro: {
    name: 'Pro',
    priceMonthly: 19,
    brandsLimit: 5,
    promptsLimit: 50,
    frequency: 'daily',
    whiteLabel: false,
    modelAccess: ['gpt-4o-mini', 'gemini-1.5-flash', 'deepseek-chat'],
  },
  agency: {
    name: 'Agency',
    priceMonthly: 49,
    brandsLimit: 20,
    promptsLimit: 200,
    frequency: 'daily',
    whiteLabel: true,
    modelAccess: ['gpt-4o-mini', 'gemini-1.5-flash', 'deepseek-chat'],
  },
};

export interface Brand {
  id: string;
  user_id?: string;
  name: string;
  website_url: string;
  industry?: string;
  known_competitors: string[];
  check_frequency: 'weekly' | 'daily';
  last_checked_at?: string | null;
  created_at: string;
}

export interface PromptItem {
  id: string;
  brand_id: string;
  query_text: string;
  category?: string;
  is_active: boolean;
  created_at: string;
}

export interface CheckResult {
  id: string;
  brand_id: string;
  prompt_id: string;
  prompt_text?: string;
  provider: AIProvider;
  model: string;
  status: 'success' | 'failed' | 'cached' | 'skipped';
  is_cached: boolean;
  brand_mentioned: boolean;
  mention_position: number | null; // e.g., 1 for 1st mention, 2 for 2nd
  mention_snippet: string | null;
  competitors_mentioned: string[];
  cited_sources: string[];
  raw_response?: string;
  error_message?: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  estimated_cost: number;
  checked_at: string;
}

export interface TokenLog {
  id: string;
  user_id?: string;
  brand_id?: string;
  brand_name?: string;
  provider: AIProvider | string;
  model: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  estimated_cost: number;
  created_at: string;
}

export interface BrandStats {
  brandId: string;
  totalChecks: number;
  totalMentions: number;
  mentionRate: number; // percentage 0-100
  avgPosition: number; // average ranking position
  citedSourcesCount: number;
  topSources: { url: string; count: number }[];
  providerBreakdown: {
    openai: { total: number; mentions: number; rate: number };
    gemini: { total: number; mentions: number; rate: number };
    deepseek: { total: number; mentions: number; rate: number };
  };
  competitorMentions: { name: string; count: number }[];
  trendHistory: {
    date: string;
    mentionRate: number;
    avgPosition: number;
    checksCount: number;
  }[];
}

export interface UserProfile {
  id: string;
  email: string;
  plan_tier: PlanTier;
  license_key?: string;
  license_instance_id?: string;
  brands_limit: number;
  prompts_limit: number;
  check_frequency: 'weekly' | 'daily';
  white_label_enabled: boolean;
  created_at: string;
}

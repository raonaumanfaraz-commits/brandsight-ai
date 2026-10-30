-- ========================================================
-- BrandSight AI - Database Schema (Supabase / PostgreSQL)
-- Description: AI Search Visibility Tracker (GEO Tracker)
-- Supports OpenAI (gpt-4o-mini), Gemini (free), DeepSeek (deepseek-chat)
-- ========================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES & SUBSCRIPTIONS
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  plan_tier TEXT NOT NULL DEFAULT 'free' CHECK (plan_tier IN ('free', 'pro', 'agency')),
  license_key TEXT,
  license_instance_id TEXT,
  lemon_order_id TEXT,
  lemon_customer_id TEXT,
  brands_limit INT NOT NULL DEFAULT 1,
  prompts_limit INT NOT NULL DEFAULT 5,
  check_frequency TEXT NOT NULL DEFAULT 'weekly' CHECK (check_frequency IN ('daily', 'weekly')),
  white_label_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. BRANDS
CREATE TABLE IF NOT EXISTS brands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  website_url TEXT NOT NULL,
  industry TEXT DEFAULT 'Technology',
  known_competitors JSONB DEFAULT '[]'::jsonb,
  check_frequency TEXT NOT NULL DEFAULT 'weekly' CHECK (check_frequency IN ('daily', 'weekly')),
  last_checked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. PROMPTS (Search Queries tracked per brand)
CREATE TABLE IF NOT EXISTS prompts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  query_text TEXT NOT NULL,
  category TEXT DEFAULT 'General',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. CHECKS (Execution records per prompt & AI provider)
CREATE TABLE IF NOT EXISTS checks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  prompt_id UUID NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('openai', 'gemini', 'deepseek')),
  model TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'success' CHECK (status IN ('success', 'failed', 'cached', 'skipped')),
  is_cached BOOLEAN NOT NULL DEFAULT FALSE,
  brand_mentioned BOOLEAN NOT NULL DEFAULT FALSE,
  mention_position INT DEFAULT NULL,
  mention_snippet TEXT,
  competitors_mentioned JSONB DEFAULT '[]'::jsonb,
  cited_sources JSONB DEFAULT '[]'::jsonb,
  raw_response TEXT,
  error_message TEXT,
  prompt_tokens INT NOT NULL DEFAULT 0,
  completion_tokens INT NOT NULL DEFAULT 0,
  total_tokens INT NOT NULL DEFAULT 0,
  estimated_cost NUMERIC(10, 6) NOT NULL DEFAULT 0.000000,
  checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. TOKEN & COST LOGS (Guardrail accounting)
CREATE TABLE IF NOT EXISTS token_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,
  provider TEXT NOT NULL,
  model TEXT NOT NULL,
  prompt_tokens INT NOT NULL DEFAULT 0,
  completion_tokens INT NOT NULL DEFAULT 0,
  total_tokens INT NOT NULL DEFAULT 0,
  estimated_cost NUMERIC(10, 6) NOT NULL DEFAULT 0.000000,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. PROMPT CACHE (24h Cache to prevent wasteful duplicate API spend)
CREATE TABLE IF NOT EXISTS prompt_cache (
  cache_key TEXT PRIMARY KEY,
  provider TEXT NOT NULL,
  model TEXT NOT NULL,
  raw_response TEXT NOT NULL,
  cited_sources JSONB DEFAULT '[]'::jsonb,
  prompt_tokens INT NOT NULL DEFAULT 0,
  completion_tokens INT NOT NULL DEFAULT 0,
  total_tokens INT NOT NULL DEFAULT 0,
  estimated_cost NUMERIC(10, 6) NOT NULL DEFAULT 0.000000,
  cached_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

-- 7. LICENSE KEYS (Lemon Squeezy integration)
CREATE TABLE IF NOT EXISTS licenses (
  license_key TEXT PRIMARY KEY,
  user_email TEXT,
  plan_tier TEXT NOT NULL CHECK (plan_tier IN ('pro', 'agency')),
  instance_id TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked', 'expired')),
  activated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES for fast reporting & queries
CREATE INDEX IF NOT EXISTS idx_brands_user_id ON brands(user_id);
CREATE INDEX IF NOT EXISTS idx_prompts_brand_id ON prompts(brand_id);
CREATE INDEX IF NOT EXISTS idx_checks_brand_id ON checks(brand_id);
CREATE INDEX IF NOT EXISTS idx_checks_prompt_id ON checks(prompt_id);
CREATE INDEX IF NOT EXISTS idx_checks_checked_at ON checks(checked_at DESC);
CREATE INDEX IF NOT EXISTS idx_token_logs_created_at ON token_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_prompt_cache_expires_at ON prompt_cache(expires_at);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_logs ENABLE ROW LEVEL SECURITY;

-- Profile access policy
CREATE POLICY "Users can view and update their own profile"
  ON profiles FOR ALL
  USING (auth.uid() = id);

-- Brand access policy
CREATE POLICY "Users can manage their own brands"
  ON brands FOR ALL
  USING (auth.uid() = user_id);

-- Prompt access policy
CREATE POLICY "Users can manage prompts for their own brands"
  ON prompts FOR ALL
  USING (brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid()));

-- Checks access policy
CREATE POLICY "Users can view checks for their own brands"
  ON checks FOR SELECT
  USING (brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid()));

-- Token logs access policy
CREATE POLICY "Users can view their token logs"
  ON token_logs FOR SELECT
  USING (user_id = auth.uid());

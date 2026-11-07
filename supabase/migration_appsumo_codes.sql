-- ========================================================
-- BrandSight AI - AppSumo redemption codes migration
-- Run this in Supabase Dashboard -> SQL Editor
-- (AFTER the existing schema.sql / migrations have been applied.)
-- Then run brandsight-appsumo-codes-seed.sql to load the 1000 codes.
-- ========================================================

-- 1. Codes table (server-side only; never exposed to the client)
CREATE TABLE IF NOT EXISTS public.appsumo_codes (
  code TEXT PRIMARY KEY,
  tier TEXT NOT NULL CHECK (tier IN ('tier1', 'tier2')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'redeemed')),
  redeemed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  redeemed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_appsumo_codes_status ON public.appsumo_codes(status);

-- 2. Track which AppSumo tier a profile redeemed (NULL = none).
--    Used to distinguish Tier 1 vs Tier 2 (e.g. Tier 2 unlocks CSV/JSON export).
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS appsumo_tier TEXT CHECK (appsumo_tier IN ('tier1', 'tier2'));

-- 3. Lock the codes table down: RLS ON with NO public policies.
--    The anon/authenticated keys get no access; only the server
--    (service role key, which bypasses RLS) reads and writes codes.
ALTER TABLE public.appsumo_codes ENABLE ROW LEVEL SECURITY;

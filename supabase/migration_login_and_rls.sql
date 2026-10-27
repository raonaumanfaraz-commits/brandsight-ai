-- ========================================================
-- BrandSight AI - Supabase Auth, User Profiles & RLS Migration
-- Run this in Supabase Dashboard -> SQL Editor
-- ========================================================

-- 1. Ensure Profiles table is properly formatted
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'profiles'
  ) THEN
    ALTER TABLE public.profiles ALTER COLUMN id SET DATA TYPE UUID;
  END IF;
END $$;

-- 2. Ensure licenses table has user_id column
ALTER TABLE public.licenses ADD COLUMN IF NOT EXISTS user_id UUID;

-- 3. Trigger to automatically create or link profile when user signs up in auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  existing_license RECORD;
  user_count INT;
BEGIN
  -- Check if user already purchased via Lemon Squeezy with this email
  SELECT * INTO existing_license 
  FROM public.licenses 
  WHERE LOWER(user_email) = LOWER(NEW.email) AND status = 'active'
  ORDER BY activated_at DESC 
  LIMIT 1;

  IF FOUND THEN
    -- Automatically grant purchased tier
    INSERT INTO public.profiles (
      id, email, plan_tier, license_key, brands_limit, prompts_limit, check_frequency, white_label_enabled
    ) VALUES (
      NEW.id,
      NEW.email,
      existing_license.plan_tier,
      existing_license.license_key,
      CASE WHEN existing_license.plan_tier = 'agency' THEN 20 ELSE 5 END,
      CASE WHEN existing_license.plan_tier = 'agency' THEN 200 ELSE 50 END,
      'daily',
      (existing_license.plan_tier = 'agency')
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      plan_tier = EXCLUDED.plan_tier,
      license_key = EXCLUDED.license_key,
      brands_limit = EXCLUDED.brands_limit,
      prompts_limit = EXCLUDED.prompts_limit,
      check_frequency = EXCLUDED.check_frequency,
      white_label_enabled = EXCLUDED.white_label_enabled,
      updated_at = NOW();

    -- Link license row to this user_id
    UPDATE public.licenses 
    SET user_id = NEW.id, updated_at = NOW() 
    WHERE license_key = existing_license.license_key;
  ELSE
    -- Standard Free Tier
    INSERT INTO public.profiles (
      id, email, plan_tier, brands_limit, prompts_limit, check_frequency, white_label_enabled
    ) VALUES (
      NEW.id,
      NEW.email,
      'free',
      1,
      5,
      'weekly',
      FALSE
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      updated_at = NOW();
  END IF;

  -- 4. Check total user count in auth.users
  SELECT COUNT(*) INTO user_count FROM auth.users;
  
  -- If this is the owner / first user, adopt existing unassigned brands/prompts/checks
  -- (EXCEPT demo brand 'ViralSplice (Demo)' which stays user_id IS NULL for guests)
  IF user_count = 1 THEN
    UPDATE public.brands
    SET user_id = NEW.id, updated_at = NOW()
    WHERE (user_id IS NULL OR user_id = '00000000-0000-0000-0000-000000000001')
      AND LOWER(name) NOT LIKE '%demo%';

    UPDATE public.token_logs
    SET user_id = NEW.id
    WHERE user_id IS NULL OR user_id = '00000000-0000-0000-0000-000000000001';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Standalone Backfill Function for Manual Assignment
CREATE OR REPLACE FUNCTION public.backfill_owner_brands(owner_email TEXT)
RETURNS TABLE (
  brand_id UUID,
  brand_name TEXT,
  previous_user_id UUID,
  assigned_user_id UUID,
  status TEXT
) AS $$
DECLARE
  target_user_id UUID;
BEGIN
  SELECT id INTO target_user_id FROM auth.users WHERE LOWER(email) = LOWER(owner_email) LIMIT 1;
  
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found in auth.users. Please sign up first.', owner_email;
  END IF;

  -- Ensure profile exists
  INSERT INTO public.profiles (id, email, plan_tier)
  VALUES (target_user_id, owner_email, 'free')
  ON CONFLICT (id) DO NOTHING;

  -- Also update token logs
  UPDATE public.token_logs
  SET user_id = target_user_id
  WHERE user_id IS NULL OR user_id = '00000000-0000-0000-0000-000000000001';

  RETURN QUERY
  WITH updated AS (
    UPDATE public.brands b
    SET user_id = target_user_id, updated_at = NOW()
    WHERE (b.user_id IS NULL OR b.user_id = '00000000-0000-0000-0000-000000000001')
      AND LOWER(b.name) NOT LIKE '%demo%'
    RETURNING b.id, b.name, '00000000-0000-0000-0000-000000000001'::UUID AS prev_id, target_user_id, 'assigned'::TEXT AS st
  )
  SELECT * FROM updated;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.token_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;

-- Drop previous policies to avoid duplicates
DROP POLICY IF EXISTS "Users can view and update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can manage their own brands" ON public.brands;
DROP POLICY IF EXISTS "Public can view demo brands" ON public.brands;
DROP POLICY IF EXISTS "Users can manage prompts for their own brands" ON public.prompts;
DROP POLICY IF EXISTS "Public can view demo prompts" ON public.prompts;
DROP POLICY IF EXISTS "Users can view checks for their own brands" ON public.checks;
DROP POLICY IF EXISTS "Users can insert checks for their own brands" ON public.checks;
DROP POLICY IF EXISTS "Public can view demo checks" ON public.checks;
DROP POLICY IF EXISTS "Users can view their token logs" ON public.token_logs;
DROP POLICY IF EXISTS "Users can view their own licenses" ON public.licenses;

-- Profiles: users read and update their own profile
CREATE POLICY "Users can view and update their own profile"
  ON public.profiles FOR ALL
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Brands: users manage their own; public/guests can view demo brand (user_id IS NULL)
CREATE POLICY "Users can manage their own brands"
  ON public.brands FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Public can view demo brands"
  ON public.brands FOR SELECT
  TO anon, authenticated
  USING (user_id IS NULL);

-- Prompts: users manage prompts for their brands; public can view demo brand prompts
CREATE POLICY "Users can manage prompts for their own brands"
  ON public.prompts FOR ALL
  TO authenticated
  USING (brand_id IN (SELECT id FROM public.brands WHERE user_id = auth.uid()))
  WITH CHECK (brand_id IN (SELECT id FROM public.brands WHERE user_id = auth.uid()));

CREATE POLICY "Public can view demo prompts"
  ON public.prompts FOR SELECT
  TO anon, authenticated
  USING (brand_id IN (SELECT id FROM public.brands WHERE user_id IS NULL));

-- Checks: users view and insert checks for their brands; public can view demo checks
CREATE POLICY "Users can view checks for their own brands"
  ON public.checks FOR SELECT
  TO authenticated
  USING (brand_id IN (SELECT id FROM public.brands WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert checks for their own brands"
  ON public.checks FOR INSERT
  TO authenticated
  WITH CHECK (brand_id IN (SELECT id FROM public.brands WHERE user_id = auth.uid()));

CREATE POLICY "Public can view demo checks"
  ON public.checks FOR SELECT
  TO anon, authenticated
  USING (brand_id IN (SELECT id FROM public.brands WHERE user_id IS NULL));

-- Token logs: users read their own logs
CREATE POLICY "Users can view their token logs"
  ON public.token_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Licenses: users can view their own license
CREATE POLICY "Users can view their own licenses"
  ON public.licenses FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR LOWER(user_email) = LOWER(auth.jwt() ->> 'email'));

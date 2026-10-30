-- BrandSight: DeepSeek replaces the retired provider.
-- Run once in the Supabase SQL Editor for projects created before this change.
-- 1) Remove legacy rows of the retired provider (otherwise the new constraint would fail).
DELETE FROM public.checks WHERE provider = 'perplexity';
DELETE FROM public.token_logs WHERE provider = 'perplexity';
DELETE FROM public.prompt_cache WHERE provider = 'perplexity';

-- 2) Replace the provider CHECK constraint on checks.
DO $$
DECLARE c TEXT;
BEGIN
  FOR c IN
    SELECT conname FROM pg_constraint
    WHERE conrelid = 'public.checks'::regclass AND contype = 'c'
      AND pg_get_constraintdef(oid) ILIKE '%provider%'
  LOOP
    EXECUTE format('ALTER TABLE public.checks DROP CONSTRAINT %I', c);
  END LOOP;
END $$;

ALTER TABLE public.checks
  ADD CONSTRAINT checks_provider_check
  CHECK (provider IN ('openai', 'gemini', 'deepseek'));

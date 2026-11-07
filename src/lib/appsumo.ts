/**
 * BrandSight AI - AppSumo code redemption
 * Validates a tier-encoded AppSumo code (BS1- = Tier 1, BS2- = Tier 2)
 * against the appsumo_codes table and upgrades the redeeming user's
 * profile to that tier's limits. Codes are single-use and never downgrade
 * an account that already has higher limits.
 */
import { getSupabaseAdmin, getProfile } from './storage';

export type AppSumoTier = 'tier1' | 'tier2';

export interface AppSumoTierLimits {
  brands: number;
  prompts: number;
  frequency: 'weekly' | 'daily';
  label: string;
}

export const APPSUMO_LIMITS: Record<AppSumoTier, AppSumoTierLimits> = {
  tier1: { brands: 3, prompts: 25, frequency: 'weekly', label: 'AppSumo Tier 1' },
  tier2: { brands: 5, prompts: 50, frequency: 'daily', label: 'AppSumo Tier 2' },
};

export interface RedeemResult {
  tier: AppSumoTier;
  tierLabel: string;
  limits: { brands_limit: number; prompts_limit: number; check_frequency: 'weekly' | 'daily' };
  profile: Record<string, unknown>;
}

/**
 * Redeem an AppSumo code for a logged-in user.
 * 1. Atomically claims the code (only if still 'active') so a code can
 *    never be redeemed twice, even under concurrent requests.
 * 2. Upgrades the profile to the tier's limits (never downgrades).
 * 3. On profile-update failure, releases the claimed code again.
 */
export async function redeemAppSumoCode(
  code: string,
  userId: string
): Promise<RedeemResult> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    throw new Error('Supabase client unavailable.');
  }

  const clean = code.trim().toUpperCase();
  if (!clean) {
    throw new Error('Please enter your AppSumo code.');
  }

  // 1. Claim the code (atomic: only succeeds while status is still 'active')
  const { data: claimed, error: claimErr } = await supabase
    .from('appsumo_codes')
    .update({
      status: 'redeemed',
      redeemed_by: userId,
      redeemed_at: new Date().toISOString(),
    })
    .eq('code', clean)
    .eq('status', 'active')
    .select('code, tier')
    .maybeSingle();

  if (claimErr) {
    throw new Error(`Could not redeem code: ${claimErr.message}`);
  }

  if (!claimed) {
    const { data: existing } = await supabase
      .from('appsumo_codes')
      .select('status')
      .eq('code', clean)
      .maybeSingle();
    if (existing) {
      throw new Error('This code has already been redeemed.');
    }
    throw new Error('Invalid AppSumo code. Please check the code and try again.');
  }

  const tier = claimed.tier as AppSumoTier;
  const limits = APPSUMO_LIMITS[tier];
  if (!limits) {
    // Unknown tier stored on the code: release it and fail loudly.
    await supabase
      .from('appsumo_codes')
      .update({ status: 'active', redeemed_by: null, redeemed_at: null })
      .eq('code', clean);
    throw new Error('This code has an unknown tier. Please contact support.');
  }

  // 2. Upgrade the profile (never downgrade existing higher limits)
  try {
    const current = await getProfile(userId);
    const currentAppsumoTier = (current as unknown as { appsumo_tier?: string | null })
      .appsumo_tier;
    const newBrands = Math.max(current.brands_limit, limits.brands);
    const newPrompts = Math.max(current.prompts_limit, limits.prompts);
    const newFreq =
      current.check_frequency === 'daily' || limits.frequency === 'daily'
        ? 'daily'
        : 'weekly';
    const newPlanTier = current.plan_tier === 'agency' ? 'agency' : 'pro';
    const newAppsumoTier = currentAppsumoTier === 'tier2' ? 'tier2' : tier;

    const { data, error } = await supabase
      .from('profiles')
      .update({
        plan_tier: newPlanTier,
        license_key: clean,
        brands_limit: newBrands,
        prompts_limit: newPrompts,
        check_frequency: newFreq,
        appsumo_tier: newAppsumoTier,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update profile: ${error.message}`);
    }

    return {
      tier,
      tierLabel: limits.label,
      limits: {
        brands_limit: newBrands,
        prompts_limit: newPrompts,
        check_frequency: newFreq,
      },
      profile: data as Record<string, unknown>,
    };
  } catch (err) {
    // 3. Best-effort release of the claimed code so it stays usable.
    await supabase
      .from('appsumo_codes')
      .update({ status: 'active', redeemed_by: null, redeemed_at: null })
      .eq('code', clean)
      .eq('status', 'redeemed');
    throw err;
  }
}

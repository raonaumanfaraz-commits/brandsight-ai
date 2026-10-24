/**
 * Lemon Squeezy License Engine - BrandSight AI
 * Supports Lemon Squeezy license activation with activation limit 1
 * (Matching ViralSplice license architecture).
 */
import { PlanTier } from '@/types';

export interface LicenseActivationResponse {
  valid: boolean;
  tier: PlanTier;
  error?: string;
  licenseKey?: string;
  instanceId?: string;
  customerEmail?: string;
}

export async function activateLemonSqueezyLicense(
  licenseKey: string,
  instanceName = 'BrandSight Web Client'
): Promise<LicenseActivationResponse> {
  const cleanKey = licenseKey.trim();

  if (!cleanKey) {
    return { valid: false, tier: 'free', error: 'Please enter a valid license key.' };
  }

  // Developer / Offline test keys for instant local QA without requiring active payment
  if (cleanKey.toUpperCase().startsWith('TEST-PRO-') || cleanKey.toUpperCase() === 'PRO-DEMO-KEY') {
    return {
      valid: true,
      tier: 'pro',
      licenseKey: cleanKey,
      instanceId: `inst_${Date.now()}`,
      customerEmail: 'pro-user@brandsight.ai',
    };
  }

  if (cleanKey.toUpperCase().startsWith('TEST-AGENCY-') || cleanKey.toUpperCase() === 'AGENCY-DEMO-KEY') {
    return {
      valid: true,
      tier: 'agency',
      licenseKey: cleanKey,
      instanceId: `inst_${Date.now()}`,
      customerEmail: 'agency-user@brandsight.ai',
    };
  }

  try {
    const formData = new URLSearchParams();
    formData.append('license_key', cleanKey);
    formData.append('instance_name', instanceName);

    const response = await fetch('https://api.lemonsqueezy.com/v1/licenses/activate', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok || !data.activated) {
      const errorMessage = data.error || 'Failed to activate license key. It may have reached its activation limit.';
      return { valid: false, tier: 'free', error: errorMessage };
    }

    // Determine plan tier from meta product/variant name
    const productName = (data.meta?.product_name || '').toLowerCase();
    const variantName = (data.meta?.variant_name || '').toLowerCase();

    let tier: PlanTier = 'pro';
    if (productName.includes('agency') || variantName.includes('agency')) {
      tier = 'agency';
    }

    return {
      valid: true,
      tier,
      licenseKey: cleanKey,
      instanceId: data.instance?.id,
      customerEmail: data.meta?.customer_email,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Network error verifying license key';
    return { valid: false, tier: 'free', error: message };
  }
}

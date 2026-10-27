import { NextResponse } from 'next/server';
import { activateLemonSqueezyLicense } from '@/lib/lemonsqueezy';
import { upgradePlan, getProfile } from '@/lib/storage';
import { getAuthUser } from '@/lib/authServer';

export async function POST(req: Request) {
  try {
    const user = await getAuthUser(req);
    const body = await req.json();
    const { license_key, instance_name } = body;

    if (!license_key) {
      return NextResponse.json({ error: 'License key is required' }, { status: 400 });
    }

    const activation = await activateLemonSqueezyLicense(license_key, instance_name || 'BrandSight Web Client');

    if (!activation.valid) {
      return NextResponse.json({ error: activation.error || 'Invalid license key' }, { status: 400 });
    }

    // Upgrade the user's plan tier (linked to authenticated user if signed in)
    const updatedProfile = await upgradePlan(
      activation.tier,
      activation.licenseKey,
      user?.id,
      user?.email
    );

    return NextResponse.json({
      success: true,
      tier: activation.tier,
      profile: updatedProfile,
      message: `Successfully activated ${activation.tier.toUpperCase()} plan!${
        user ? ' Linked directly to your account.' : ''
      }`,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error activating license key';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const user = await getAuthUser(req);
    const profile = await getProfile(user?.id);
    return NextResponse.json({
      plan_tier: profile.plan_tier,
      license_key: profile.license_key ? `${profile.license_key.substring(0, 8)}...` : null,
      brands_limit: profile.brands_limit,
      prompts_limit: profile.prompts_limit,
      check_frequency: profile.check_frequency,
      white_label_enabled: profile.white_label_enabled,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error fetching license status';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

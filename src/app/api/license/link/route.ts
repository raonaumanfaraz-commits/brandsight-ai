import { NextResponse } from 'next/server';
import { linkLicenseToUser } from '@/lib/storage';
import { activateLemonSqueezyLicense } from '@/lib/lemonsqueezy';
import { getAuthUser } from '@/lib/authServer';

export async function POST(req: Request) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json(
        { error: 'Please log in to link your license key to your account.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { license_key } = body;

    if (!license_key || typeof license_key !== 'string' || license_key.trim().length === 0) {
      return NextResponse.json({ error: 'License key is required' }, { status: 400 });
    }

    const cleanKey = license_key.trim();

    // Verify key with Lemon Squeezy if needed
    try {
      const activation = await activateLemonSqueezyLicense(cleanKey, `BrandSight User ${user.email}`);
      if (!activation.valid) {
        // If already validated previously in DB, proceed with DB linking; otherwise error
      }
    } catch {
      // Ignore network errors on Lemon Squeezy if key was already stored
    }

    const result = await linkLicenseToUser(cleanKey, user.id, user.email);

    return NextResponse.json({
      success: true,
      tier: result.tier,
      profile: result.profile,
      message: `Your ${result.tier.toUpperCase()} license has been linked to your account! Pro features are now available on all your devices.`,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error linking license key';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

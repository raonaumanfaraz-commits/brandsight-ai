import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/authServer';
import { redeemAppSumoCode } from '@/lib/appsumo';
import { getProfile } from '@/lib/storage';

export async function POST(req: Request) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json(
        { error: 'Please log in to redeem your AppSumo code.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { code } = body;

    if (!code || typeof code !== 'string' || code.trim().length === 0) {
      return NextResponse.json({ error: 'AppSumo code is required' }, { status: 400 });
    }

    const result = await redeemAppSumoCode(code, user.id);

    return NextResponse.json({
      success: true,
      tier: result.tier,
      tierLabel: result.tierLabel,
      limits: result.limits,
      profile: result.profile,
      message: `${result.tierLabel} activated!`,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error redeeming AppSumo code';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Please log in.' }, { status: 401 });
    }

    const profile = await getProfile(user.id);
    return NextResponse.json({
      appsumo_tier:
        (profile as unknown as { appsumo_tier?: string | null }).appsumo_tier || null,
      plan_tier: profile.plan_tier,
      brands_limit: profile.brands_limit,
      prompts_limit: profile.prompts_limit,
      check_frequency: profile.check_frequency,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error fetching AppSumo status';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

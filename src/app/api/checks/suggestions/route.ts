import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/authServer';
import { getProfile, getBrandById, getChecks } from '@/lib/storage';
import { generateSeoFixSuggestions } from '@/lib/suggestions';
import { CheckResult } from '@/types';

export async function POST(req: Request) {
  try {
    const user = await getAuthUser(req);
    const profile = user ? await getProfile(user.id) : null;
    const planTier = profile?.plan_tier || 'free';

    const body = await req.json().catch(() => ({}));
    const { check_id, check: providedCheck, brand_id, brand_name, website_url } = body;

    let targetCheck: CheckResult | null = providedCheck || null;
    let resolvedBrandName = brand_name || 'Brand';
    let resolvedWebsiteUrl = website_url || 'https://example.com';

    // If check object was not provided directly, look up from storage
    if (!targetCheck && check_id) {
      const allChecks = await getChecks(brand_id, user?.id);
      targetCheck = allChecks.find((c) => c.id === check_id) || null;
    }

    // If brand info not passed, look up brand
    if (targetCheck && (!brand_name || !website_url)) {
      const brand = await getBrandById(targetCheck.brand_id, user?.id);
      if (brand) {
        resolvedBrandName = brand.name;
        resolvedWebsiteUrl = brand.website_url;
      }
    }

    if (!targetCheck) {
      return NextResponse.json(
        { success: false, error: 'could not generate', suggestions: [] },
        { status: 200 }
      );
    }

    // Plan Gating: Free tier users see a locked teaser with upgrade prompt
    if (planTier === 'free') {
      return NextResponse.json({
        success: true,
        planTier: 'free',
        locked: true,
        upgradeUrl: '/pricing',
        suggestions: [
          {
            id: `teaser_${targetCheck.id}_1`,
            title: 'Target Query Intent with Dedicated Solution Guide',
            issue: 'Visibility gap identified vs primary competitors in AI responses.',
            fix: 'Upgrade to Pro or Agency to unlock full concrete fix, copy templates, and FAQPage schema.',
            priority: 'High',
          },
          {
            id: `teaser_${targetCheck.id}_2`,
            title: 'Create Direct Comparison Page Against Leading Competitor',
            issue: 'Competitor was recommended over your brand in commercial queries.',
            fix: 'Upgrade to Pro or Agency to unlock competitor differentiation matrix and structured data.',
            priority: 'High',
          },
          {
            id: `teaser_${targetCheck.id}_3`,
            title: 'Earn Authority Citations on Identified Referral Sources',
            issue: 'AI engine grounded its response using references from domains where your brand lacks presence.',
            fix: 'Upgrade to Pro or Agency to view citing domain targets and outreach anchor strategies.',
            priority: 'Medium',
          },
        ],
      });
    }

    // Pro and Agency tiers receive full suggestions generated from the check's data
    const suggestions = await generateSeoFixSuggestions({
      check: targetCheck,
      brandName: resolvedBrandName,
      websiteUrl: resolvedWebsiteUrl,
    });

    return NextResponse.json({
      success: true,
      planTier,
      locked: false,
      suggestions,
    });
  } catch (err: unknown) {
    console.error('Error generating SEO fix suggestions:', err);
    // If suggestion generation fails, return a plain "could not generate" state. Never break the page.
    return NextResponse.json(
      {
        success: false,
        error: 'could not generate',
        suggestions: [],
      },
      { status: 200 }
    );
  }
}

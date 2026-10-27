import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { upgradePlan, getProfile, getSupabaseAdmin } from '@/lib/storage';
import { PlanTier } from '@/types';

/**
 * Extract product and variant names from Lemon Squeezy webhook payload
 */
function extractProductInfo(data: any, meta: any): { productName: string; variantName: string } {
  const attrs = data?.attributes || {};
  const firstItem = attrs.first_order_item || {};

  const productName = (
    firstItem.product_name ||
    attrs.product_name ||
    meta?.custom_data?.product_name ||
    ''
  ).trim();

  const variantName = (
    firstItem.variant_name ||
    attrs.variant_name ||
    meta?.custom_data?.variant_name ||
    ''
  ).trim();

  return { productName, variantName };
}

/**
 * Extract license key directly from payload if present
 */
function extractLicenseKey(data: any): string | null {
  const attrs = data?.attributes || {};
  const firstItem = attrs.first_order_item || {};

  if (firstItem.license_key) return String(firstItem.license_key).trim();
  if (Array.isArray(firstItem.license_keys) && firstItem.license_keys[0]?.key) {
    return String(firstItem.license_keys[0].key).trim();
  }

  if (attrs.license_key) return String(attrs.license_key).trim();
  if (Array.isArray(attrs.license_keys) && attrs.license_keys[0]?.key) {
    return String(attrs.license_keys[0].key).trim();
  }

  return null;
}

/**
 * Fetch license key from Lemon Squeezy API if omitted from payload
 */
async function fetchLicenseKeyFromApi(
  orderId?: string | number,
  subscriptionId?: string | number
): Promise<string | null> {
  const apiKey = process.env.LEMONSQUEEZY_API_KEY;
  if (!apiKey || apiKey.startsWith('your_')) {
    return null;
  }

  try {
    if (orderId) {
      const res = await fetch(`https://api.lemonsqueezy.com/v1/license-keys?filter[order_id]=${orderId}`, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: 'application/vnd.api+json',
        },
      });
      if (res.ok) {
        const json = await res.json();
        const key = json.data?.[0]?.attributes?.key;
        if (key) return String(key).trim();
      }
    }

    if (subscriptionId) {
      const res = await fetch(`https://api.lemonsqueezy.com/v1/license-keys?filter[subscription_id]=${subscriptionId}`, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: 'application/vnd.api+json',
        },
      });
      if (res.ok) {
        const json = await res.json();
        const key = json.data?.[0]?.attributes?.key;
        if (key) return String(key).trim();
      }
    }
  } catch (err) {
    console.error('[Lemon Squeezy Webhook] Failed to fetch license key from API:', err);
  }

  return null;
}

export async function POST(req: NextRequest) {
  try {
    // ------------------------------------------------------------------
    // 1. Signature Verification (Mandatory First Step)
    // ------------------------------------------------------------------
    const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
    if (!secret) {
      console.error('[Lemon Squeezy Webhook] LEMONSQUEEZY_WEBHOOK_SECRET is not configured.');
      return new NextResponse('Webhook secret not configured', { status: 401 });
    }

    const signature = req.headers.get('x-signature');
    if (!signature) {
      return new NextResponse('Missing X-Signature header', { status: 401 });
    }

    const rawBody = await req.text();

    const hmac = crypto.createHmac('sha256', secret);
    const digest = hmac.update(rawBody).digest('hex');

    const signatureBuffer = Buffer.from(signature, 'utf8');
    const digestBuffer = Buffer.from(digest, 'utf8');

    if (
      signatureBuffer.length !== digestBuffer.length ||
      !crypto.timingSafeEqual(signatureBuffer, digestBuffer)
    ) {
      return new NextResponse('Invalid signature', { status: 401 });
    }

    // ------------------------------------------------------------------
    // 2. Parse Payload
    // ------------------------------------------------------------------
    let payload: any;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return new NextResponse('Invalid JSON payload', { status: 400 });
    }

    const eventName: string = payload?.meta?.event_name || payload?.event_name || '';
    const data = payload?.data || {};
    const attrs = data?.attributes || {};
    const { productName, variantName } = extractProductInfo(data, payload?.meta);

    // ------------------------------------------------------------------
    // 3. Product Guard (Mandatory)
    // Only act on BrandSight products (BrandSight AI — Pro, BrandSight AI — Agency)
    // ------------------------------------------------------------------
    const combinedName = `${productName} ${variantName}`.toLowerCase();
    if (!combinedName.includes('brandsight')) {
      console.log(`Skipped non-BrandSight order: ${productName || 'Unknown Product'}`);
      return NextResponse.json({ received: true, status: 'skipped_non_brandsight' }, { status: 200 });
    }

    // ------------------------------------------------------------------
    // 4. Determine Tier (name contains "agency" -> agency, else pro)
    // ------------------------------------------------------------------
    const tier: PlanTier = combinedName.includes('agency') ? 'agency' : 'pro';
    const customerEmail =
      attrs.user_email ||
      attrs.customer_email ||
      payload?.meta?.custom_data?.customer_email ||
      undefined;

    const supabase = getSupabaseAdmin();

    // ------------------------------------------------------------------
    // 5. Handle Events
    // ------------------------------------------------------------------
    switch (eventName) {
      case 'order_created':
      case 'subscription_created': {
        // Resolve license key
        let licenseKey = extractLicenseKey(data);
        if (!licenseKey) {
          const orderId = attrs.order_id || (data?.type === 'orders' ? data?.id : undefined);
          const subscriptionId =
            attrs.subscription_id || (data?.type === 'subscriptions' ? data?.id : undefined);
          licenseKey = await fetchLicenseKeyFromApi(orderId, subscriptionId);
        }

        // If license key is still not present (e.g. test order without key), format fallback identifier
        const finalLicenseKey = licenseKey || `LS-${data?.id || Date.now()}`;

        // Upgrade profile and plan limits for customer email if matched
        await upgradePlan(tier, finalLicenseKey, undefined, customerEmail);

        // Record license in Supabase licenses table
        if (supabase) {
          await supabase.from('licenses').upsert(
            {
              license_key: finalLicenseKey,
              user_email: customerEmail || 'customer@brandsight.ai',
              plan_tier: tier,
              status: 'active',
              activated_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'license_key' }
          );
        }

        console.log(`[Lemon Squeezy Webhook] Activated ${tier.toUpperCase()} license for BrandSight: ${finalLicenseKey.substring(0, 10)}...`);
        return NextResponse.json({ received: true, event: eventName, tier, status: 'activated' }, { status: 200 });
      }

      case 'subscription_updated': {
        const subStatus = (attrs.status || '').toLowerCase();

        // Active or past_due: keep tier in sync
        if (subStatus === 'active' || subStatus === 'past_due' || subStatus === 'on_trial') {
          let licenseKey = extractLicenseKey(data);
          if (!licenseKey) {
            const profile = await getProfile();
            licenseKey = profile.license_key || null;
          }

          const finalLicenseKey = licenseKey || `LS-${data?.id || Date.now()}`;
          await upgradePlan(tier, finalLicenseKey, undefined, customerEmail);

          if (supabase) {
            await supabase.from('licenses').upsert(
              {
                license_key: finalLicenseKey,
                user_email: customerEmail || 'customer@brandsight.ai',
                plan_tier: tier,
                status: 'active',
                updated_at: new Date().toISOString(),
              },
              { onConflict: 'license_key' }
            );
          }

          console.log(`[Lemon Squeezy Webhook] Subscription updated: kept ${tier.toUpperCase()} in sync.`);
          return NextResponse.json({ received: true, event: eventName, tier, status: 'updated' }, { status: 200 });
        }

        // Cancelled or expired subscriptions falling through to downgrade
        if (subStatus === 'cancelled' || subStatus === 'expired' || subStatus === 'unpaid') {
          await upgradePlan('free', undefined);

          if (supabase) {
            const profile = await getProfile();
            const targetKey = extractLicenseKey(data) || profile.license_key;
            if (targetKey) {
              await supabase
                .from('licenses')
                .update({
                  status: subStatus === 'cancelled' ? 'revoked' : 'expired',
                  updated_at: new Date().toISOString(),
                })
                .eq('license_key', targetKey);
            }
          }

          console.log(`[Lemon Squeezy Webhook] Subscription status '${subStatus}': downgraded profile to free.`);
          return NextResponse.json({ received: true, event: eventName, status: 'downgraded' }, { status: 200 });
        }

        return NextResponse.json({ received: true, event: eventName, subStatus }, { status: 200 });
      }

      case 'subscription_cancelled':
      case 'subscription_expired': {
        // Downgrade profile to free plan limits
        const profile = await getProfile();
        const targetKey = extractLicenseKey(data) || profile.license_key;

        await upgradePlan('free', undefined);

        // Mark license inactive without deleting the record
        if (supabase && targetKey) {
          await supabase
            .from('licenses')
            .update({
              status: eventName === 'subscription_cancelled' ? 'revoked' : 'expired',
              updated_at: new Date().toISOString(),
            })
            .eq('license_key', targetKey);
        }

        console.log(`[Lemon Squeezy Webhook] Downgraded to Free plan on ${eventName}.`);
        return NextResponse.json({ received: true, event: eventName, status: 'downgraded' }, { status: 200 });
      }

      default: {
        console.log(`[Lemon Squeezy Webhook] Received unhandled event: ${eventName}`);
        return NextResponse.json({ received: true, event: eventName, status: 'ignored' }, { status: 200 });
      }
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Internal webhook error';
    console.error('[Lemon Squeezy Webhook Error]:', errorMsg);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

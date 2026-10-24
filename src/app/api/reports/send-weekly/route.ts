import { NextResponse } from 'next/server';
import { getBrandById, getChecks, getProfile } from '@/lib/storage';
import { computeBrandStats } from '@/lib/stats';
import { sendWeeklyReport, generateReportHtml } from '@/lib/email';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { brand_id, recipient_email, preview_only = false } = body;

    if (!brand_id) {
      return NextResponse.json({ error: 'brand_id is required' }, { status: 400 });
    }

    const brand = await getBrandById(brand_id);
    if (!brand) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
    }

    const profile = await getProfile();
    const targetEmail = recipient_email || profile.email;
    const checks = await getChecks(brand_id);
    const stats = computeBrandStats(brand_id, checks);

    if (preview_only) {
      const html = generateReportHtml(brand, stats);
      return new Response(html, {
        headers: { 'Content-Type': 'text/html' },
      });
    }

    const result = await sendWeeklyReport({
      recipientEmail: targetEmail,
      brand,
      stats,
    });

    return NextResponse.json(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error sending report';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

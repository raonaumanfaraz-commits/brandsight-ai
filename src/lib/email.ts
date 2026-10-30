/**
 * BrandSight AI - Weekly Email Summary Report Service
 * Formats responsive HTML email reports with CodeRao navy/gold branding
 * and sends via Resend or logs for local review.
 */
import { Brand, BrandStats } from '@/types';

export interface SendWeeklyReportOptions {
  recipientEmail: string;
  brand: Brand;
  stats: BrandStats;
  changeVsLastWeek?: number; // e.g. +12 or -5
}

export function generateReportHtml(brand: Brand, stats: BrandStats, change = +8): string {
  const isPositive = change >= 0;
  const changeColor = isPositive ? '#10B981' : '#EF4444';
  const changeArrow = isPositive ? '▲ +' : '▼ ';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Weekly AI Visibility Report: ${brand.name}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #08192E; margin: 0; padding: 24px; color: #E2E8F0; }
    .card { max-width: 600px; margin: 0 auto; background: #0E2238; border: 1px solid rgba(201, 164, 92, 0.3); border-radius: 12px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #08192E 0%, #153150 100%); padding: 32px 24px; border-bottom: 2px solid #C9A45C; }
    .logo { color: #C9A45C; font-size: 22px; font-weight: 700; letter-spacing: -0.5px; }
    .subtitle { color: #94A3B8; font-size: 14px; margin-top: 4px; }
    .content { padding: 24px; }
    .metric-row { display: flex; gap: 16px; margin-bottom: 24px; }
    .stat-box { flex: 1; background: rgba(8, 25, 46, 0.8); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 16px; text-align: center; }
    .stat-val { font-size: 32px; font-weight: 800; color: #FFFFFF; }
    .stat-label { font-size: 12px; text-transform: uppercase; color: #94A3B8; margin-top: 4px; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 999px; font-size: 13px; font-weight: 600; color: ${changeColor}; background: rgba(255, 255, 255, 0.05); }
    .section-title { font-size: 16px; font-weight: 700; color: #C9A45C; margin: 20px 0 10px; text-transform: uppercase; letter-spacing: 0.5px; }
    .source-list { list-style: none; padding: 0; margin: 0; }
    .source-item { padding: 8px 12px; background: rgba(255, 255, 255, 0.03); border-radius: 6px; margin-bottom: 6px; font-size: 13px; display: flex; justify-content: space-between; }
    .btn { display: block; text-align: center; background: #C9A45C; color: #08192E; text-decoration: none; font-weight: 700; padding: 14px; border-radius: 6px; margin-top: 24px; }
    .footer { text-align: center; padding: 16px; font-size: 12px; color: #64748B; border-top: 1px solid rgba(255, 255, 255, 0.05); }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="logo">⚡ BrandSight AI</div>
      <div class="subtitle">Weekly AI Search Visibility Report for <strong>${brand.name}</strong></div>
    </div>
    <div class="content">
      <div style="text-align: center; margin-bottom: 20px;">
        <span class="badge">${changeArrow}${change}% vs previous week</span>
      </div>

      <div class="metric-row">
        <div class="stat-box">
          <div class="stat-val" style="color: #C9A45C;">${stats.mentionRate}%</div>
          <div class="stat-label">AI Mention Rate</div>
        </div>
        <div class="stat-box">
          <div class="stat-val">#${stats.avgPosition > 0 ? stats.avgPosition : '—'}</div>
          <div class="stat-label">Avg Position</div>
        </div>
        <div class="stat-box">
          <div class="stat-val">${stats.totalChecks}</div>
          <div class="stat-label">Total Checks</div>
        </div>
      </div>

      <div class="section-title">Engine Breakdown</div>
      <div class="source-item">
        <span>ChatGPT (OpenAI gpt-4o-mini)</span>
        <strong>${stats.providerBreakdown.openai.rate}% mention rate</strong>
      </div>
      <div class="source-item">
        <span>Google Gemini (Free tier)</span>
        <strong>${stats.providerBreakdown.gemini.rate}% mention rate</strong>
      </div>
      ${stats.providerBreakdown.deepseek.total > 0 ? `<div class="source-item">
        <span>DeepSeek (deepseek-chat)</span>
        <strong>${stats.providerBreakdown.deepseek.rate}% mention rate</strong>
      </div>` : ''}

      <div class="section-title">Top Cited Sources</div>
      ${stats.topSources.length > 0
      ? `<ul class="source-list">${stats.topSources
        .slice(0, 4)
        .map(
          (s) =>
            `<li class="source-item"><span>${s.url}</span><strong>${s.count} mentions</strong></li>`
        )
        .join('')}</ul>`
      : '<p style="font-size: 13px; color: #94A3B8;">No citations recorded yet.</p>'
    }

      <div class="section-title">Generative Engine Optimization Tip</div>
      <p style="font-size: 13px; line-height: 1.6; color: #CBD5E1; background: rgba(201, 164, 92, 0.08); padding: 12px; border-left: 3px solid #C9A45C; border-radius: 4px;">
        LLMs heavily prioritize authoritative listicles and product comparison pages. Getting featured on top citing domains like <em>${stats.topSources[0]?.url || 'TechReview directories'}</em> will directly elevate your AI search ranking.
      </p>

      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard" class="btn">View Live Analytics Dashboard →</a>
    </div>
    <div class="footer">
      Powered by BrandSight AI &bull; CodeRao High-Performance Analytics
    </div>
  </div>
</body>
</html>
  `;
}

export async function sendWeeklyReport(options: SendWeeklyReportOptions): Promise<{ success: boolean; message: string }> {
  const { recipientEmail, brand, stats, changeVsLastWeek = 8 } = options;
  const apiKey = process.env.RESEND_API_KEY;

  const html = generateReportHtml(brand, stats, changeVsLastWeek);

  if (!apiKey || apiKey.startsWith('your_') || apiKey === 'dummy') {
    console.log(`[Weekly Report Preview] Ready for ${recipientEmail} (${brand.name}). Resend key not provided, skipping outbound network call.`);
    return {
      success: true,
      message: `Weekly report generated successfully for ${recipientEmail}. (Demo Mode: Resend key not set in .env.local)`,
    };
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: process.env.REPORT_FROM_EMAIL || 'reports@brandsight.ai',
        to: [recipientEmail],
        subject: `Weekly AI Visibility Report: ${brand.name} (${stats.mentionRate}% mention rate)`,
        html,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `Resend API returned status ${res.status}`);
    }

    return { success: true, message: `Report sent to ${recipientEmail}` };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error sending email';
    return { success: false, message: msg };
  }
}

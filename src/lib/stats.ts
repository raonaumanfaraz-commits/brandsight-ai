/**
 * BrandSight AI - Analytics & Metrics Aggregator
 * Computes mention rates, average ranking position, competitor presence,
 * cited domain breakdown, and weekly trend comparisons.
 */
import { CheckResult, BrandStats } from '@/types';
import { extractDomain } from './analyzer';

export function computeBrandStats(brandId: string, checks: CheckResult[]): BrandStats {
  const ACTIVE_PROVIDERS: string[] = ['openai', 'gemini', 'deepseek'];
  const brandChecks = checks.filter(
    (c) =>
      c.brand_id === brandId &&
      c.status !== 'failed' &&
      c.status !== 'skipped' &&
      ACTIVE_PROVIDERS.includes(c.provider)
  );
  const totalChecks = brandChecks.length;

  if (totalChecks === 0) {
    return {
      brandId,
      totalChecks: 0,
      totalMentions: 0,
      mentionRate: 0,
      avgPosition: 0,
      citedSourcesCount: 0,
      topSources: [],
      providerBreakdown: {
        openai: { total: 0, mentions: 0, rate: 0 },
        gemini: { total: 0, mentions: 0, rate: 0 },
        deepseek: { total: 0, mentions: 0, rate: 0 },
      },
      competitorMentions: [],
      trendHistory: [],
    };
  }

  const mentionedChecks = brandChecks.filter((c) => c.brand_mentioned);
  const totalMentions = mentionedChecks.length;
  const mentionRate = Math.round((totalMentions / totalChecks) * 100);

  // Average position (only when mentioned and position is valid)
  const positions = mentionedChecks
    .map((c) => c.mention_position)
    .filter((pos): pos is number => typeof pos === 'number' && pos > 0);

  const avgPosition =
    positions.length > 0
      ? parseFloat((positions.reduce((a, b) => a + b, 0) / positions.length).toFixed(1))
      : 0;

  // Provider breakdown
  const providerStats = {
    openai: { total: 0, mentions: 0, rate: 0 },
    gemini: { total: 0, mentions: 0, rate: 0 },
    deepseek: { total: 0, mentions: 0, rate: 0 },
  };

  for (const c of brandChecks) {
    if (c.provider === 'openai' || c.provider === 'gemini' || c.provider === 'deepseek') {
      const p = providerStats[c.provider];
      p.total += 1;
      if (c.brand_mentioned) p.mentions += 1;
    }
  }

  for (const key of ['openai', 'gemini', 'deepseek'] as const) {
    const p = providerStats[key];
    p.rate = p.total > 0 ? Math.round((p.mentions / p.total) * 100) : 0;
  }

  // Competitor breakdown
  const compMap: Record<string, number> = {};
  for (const c of brandChecks) {
    for (const comp of c.competitors_mentioned || []) {
      compMap[comp] = (compMap[comp] || 0) + 1;
    }
  }

  const competitorMentions = Object.entries(compMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  // Top cited sources (by domain)
  const sourceMap: Record<string, number> = {};
  for (const c of brandChecks) {
    for (const url of c.cited_sources || []) {
      const domain = extractDomain(url);
      if (domain) {
        sourceMap[domain] = (sourceMap[domain] || 0) + 1;
      }
    }
  }

  const topSources = Object.entries(sourceMap)
    .map(([url, count]) => ({ url, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const citedSourcesCount = Object.keys(sourceMap).length;

  // Trend history grouped by day (last 7-14 days)
  const dayMap: Record<string, { total: number; mentions: number; positions: number[] }> = {};
  for (const c of brandChecks) {
    const dateKey = new Date(c.checked_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (!dayMap[dateKey]) {
      dayMap[dateKey] = { total: 0, mentions: 0, positions: [] };
    }
    dayMap[dateKey].total += 1;
    if (c.brand_mentioned) {
      dayMap[dateKey].mentions += 1;
      if (c.mention_position) dayMap[dateKey].positions.push(c.mention_position);
    }
  }

  const trendHistory = Object.entries(dayMap).map(([date, data]) => {
    const rate = Math.round((data.mentions / data.total) * 100);
    const avgPos =
      data.positions.length > 0
        ? parseFloat((data.positions.reduce((a, b) => a + b, 0) / data.positions.length).toFixed(1))
        : 0;
    return {
      date,
      mentionRate: rate,
      avgPosition: avgPos,
      checksCount: data.total,
    };
  });

  return {
    brandId,
    totalChecks,
    totalMentions,
    mentionRate,
    avgPosition,
    citedSourcesCount,
    topSources,
    providerBreakdown: providerStats,
    competitorMentions,
    trendHistory,
  };
}

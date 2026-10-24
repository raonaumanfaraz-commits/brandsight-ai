import { NextResponse } from 'next/server';
import { getAdminUsageStats, getTokenLogs } from '@/lib/storage';

export async function GET() {
  try {
    const stats = await getAdminUsageStats();
    const recentLogs = await getTokenLogs();

    return NextResponse.json({
      summary: stats,
      recentLogs: recentLogs.slice(0, 50),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error fetching usage stats';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

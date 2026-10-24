import { NextResponse } from 'next/server';
import { getChecks, getBrandById, getPrompts } from '@/lib/storage';
import { executeCheck } from '@/lib/checker';
import { AIProvider } from '@/types';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const brandId = searchParams.get('brandId') || undefined;
    const checks = await getChecks(brandId);
    return NextResponse.json({ checks });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error fetching checks';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { brand_id, prompt_id, providers, force_refresh = false } = body;

    if (!brand_id) {
      return NextResponse.json({ error: 'brand_id is required' }, { status: 400 });
    }

    const brand = await getBrandById(brand_id);
    if (!brand) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
    }

    const allPrompts = await getPrompts(brand_id);
    const targetPrompts = prompt_id
      ? allPrompts.filter((p) => p.id === prompt_id)
      : allPrompts.filter((p) => p.is_active);

    if (targetPrompts.length === 0) {
      return NextResponse.json({ error: 'No active prompts found to check' }, { status: 400 });
    }

    // Default providers: OpenAI & Gemini (and Perplexity if chosen or default)
    const selectedProviders: AIProvider[] = Array.isArray(providers) && providers.length > 0
      ? providers
      : ['openai', 'gemini', 'perplexity'];

    const results = [];

    // Run sequentially to respect rate limits and log clearly
    for (const prompt of targetPrompts) {
      for (const provider of selectedProviders) {
        try {
          const result = await executeCheck({
            brand,
            prompt,
            provider,
            forceRefresh: Boolean(force_refresh),
          });
          results.push(result);
        } catch (checkErr: unknown) {
          console.error(`Check failed for ${provider} on "${prompt.query_text}":`, checkErr);
        }
      }
    }

    return NextResponse.json({
      success: true,
      totalRun: results.length,
      results,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error executing check';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

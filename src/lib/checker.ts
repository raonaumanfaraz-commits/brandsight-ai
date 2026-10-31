/**
 * BrandSight AI - Multi-Provider Check Orchestrator
 * Coordinates checks across OpenAI, Gemini, and DeepSeek,
 * applies 24-hour caching, analyzes mentions/citations, and logs token costs.
 */
import { AIProvider, Brand, CheckResult, PromptItem } from '@/types';
import { runOpenAICheck, ProviderResponse } from './providers/openai';
import { runGeminiCheck } from './providers/gemini';
import { runDeepSeekCheck, isDeepSeekConfigured, DEEPSEEK_MODEL } from './providers/deepseek';
import { analyzeResponse } from './analyzer';
import { getCachedResult, setCachedResult } from './cache';
import { recordCheck } from './storage';

export interface RunCheckOptions {
  brand: Brand;
  prompt: PromptItem;
  provider: AIProvider;
  forceRefresh?: boolean;
  userId?: string;
}

/**
 * Generate simulated realistic AI response for local testing when user hasn't added API keys yet
 */
function generateDemoResponse(promptText: string, brand: Brand, provider: AIProvider): ProviderResponse {
  const isRankedFirst = Math.random() > 0.35;
  const competitors = brand.known_competitors.length > 0 ? brand.known_competitors : ['Alternative AI', 'MarketTool'];

  let responseText = '';
  if (isRankedFirst) {
    responseText = `Based on current market analysis for "${promptText}", here are top recommended solutions:\n\n1. **${brand.name}** (${brand.website_url}) - Leading platform praised for ease of use, robust automation, and high user satisfaction.\n2. **${competitors[0] || 'Competitor A'}** - Reliable enterprise choice with extensive features.\n3. **${competitors[1] || 'Competitor B'}** - Popular budget-friendly alternative.\n\nSources: [TechReviews](https://techreviews.com/rankings), [IndustryBenchmark](${brand.website_url}/press)`;
  } else {
    responseText = `Here is a breakdown of top tools for "${promptText}":\n\n1. **${competitors[0] || 'Market Leader'}** - Most established tool with large community.\n2. **${brand.name}** (${brand.website_url}) - Rapidly growing tool noted for speed and accuracy.\n3. **${competitors[1] || 'Competitor B'}** - Good for basic tasks.\n\nCitations: [SaaSWeekly](https://saasweekly.com/best-tools), [AI Directory](https://aidirectory.io)`;
  }

  const modelMap: Record<AIProvider, string> = {
    openai: 'gpt-4o-mini',
    gemini: 'gemini-1.5-flash',
    deepseek: DEEPSEEK_MODEL,
  };

  const costMap: Record<AIProvider, number> = {
    openai: 0.000045,
    gemini: 0.0,
    deepseek: 0.0,
  };

  return {
    provider,
    model: modelMap[provider],
    responseText,
    promptTokens: 35,
    completionTokens: 85,
    totalTokens: 120,
    estimatedCost: costMap[provider],
    citations: [brand.website_url, 'https://techreviews.com/rankings'],
    isSimulated: true,
  };
}

export async function executeCheck(options: RunCheckOptions): Promise<CheckResult> {
  const { brand, prompt, provider, forceRefresh = false, userId } = options;

  // 1. Check 24h Cache guardrail (unless forced)
  if (!forceRefresh) {
    const cached = getCachedResult(provider, prompt.query_text);
    if (cached) {
      const analysis = analyzeResponse({
        rawResponse: cached.responseText,
        brandName: brand.name,
        websiteUrl: brand.website_url,
        competitors: brand.known_competitors,
        providerCitationUrls: cached.citations,
      });

      const cachedResult: CheckResult = {
        id: `check_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        brand_id: brand.id,
        prompt_id: prompt.id,
        prompt_text: prompt.query_text,
        provider,
        model: cached.model,
        status: 'cached',
        is_cached: true,
        brand_mentioned: analysis.brandMentioned,
        mention_position: analysis.mentionPosition,
        mention_snippet: analysis.mentionSnippet,
        competitors_mentioned: analysis.competitorsMentioned,
        cited_sources: analysis.citedSources,
        raw_response: cached.responseText,
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0,
        estimated_cost: 0, // Cached calls don't incur new cost
        checked_at: new Date().toISOString(),
      };

      await recordCheck(cachedResult, userId);
      return cachedResult;
    }
  }

  // 2. Execute Provider Call
  let providerResp: ProviderResponse;

  try {
    if (provider === 'openai') {
      try {
        providerResp = await runOpenAICheck(prompt.query_text);
      } catch (err: unknown) {
        // If API key is missing, fallback to demo simulation so user can test UI
        const errMsg = err instanceof Error ? err.message : '';
        if (errMsg.includes('not configured')) {
          providerResp = generateDemoResponse(prompt.query_text, brand, 'openai');
        } else {
          throw err;
        }
      }
    } else if (provider === 'gemini') {
      try {
        providerResp = await runGeminiCheck(prompt.query_text);
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : '';
        if (errMsg.includes('not configured')) {
          providerResp = generateDemoResponse(prompt.query_text, brand, 'gemini');
        } else {
          throw err;
        }
      }
    } else if (provider === 'deepseek') {
      if (!isDeepSeekConfigured()) {
        // Key missing: mark 'Coming soon' without breaking other providers. No fake data.
        const comingSoonResult: CheckResult = {
          id: `check_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          brand_id: brand.id,
          prompt_id: prompt.id,
          prompt_text: prompt.query_text,
          provider: 'deepseek',
          model: DEEPSEEK_MODEL,
          status: 'skipped',
          is_cached: false,
          brand_mentioned: false,
          mention_position: null,
          mention_snippet: null,
          competitors_mentioned: [],
          cited_sources: [],
          error_message: 'Coming soon: DeepSeek API key not configured',
          prompt_tokens: 0,
          completion_tokens: 0,
          total_tokens: 0,
          estimated_cost: 0,
          checked_at: new Date().toISOString(),
        };
        await recordCheck(comingSoonResult, userId);
        return comingSoonResult;
      }
      providerResp = await runDeepSeekCheck(prompt.query_text);
    } else {
      throw new Error(`Unsupported AI provider: ${provider}`);
    }
  } catch (apiError: unknown) {
    const errorMsg = apiError instanceof Error ? apiError.message : 'Unknown API error';
    const failedResult: CheckResult = {
      id: `check_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      brand_id: brand.id,
      prompt_id: prompt.id,
      prompt_text: prompt.query_text,
      provider,
      model: provider === 'openai' ? 'gpt-4o-mini' : provider === 'gemini' ? 'gemini-1.5-flash' : DEEPSEEK_MODEL,
      status: 'failed',
      is_cached: false,
      brand_mentioned: false,
      mention_position: null,
      mention_snippet: null,
      competitors_mentioned: [],
      cited_sources: [],
      error_message: errorMsg,
      prompt_tokens: 0,
      completion_tokens: 0,
      total_tokens: 0,
      estimated_cost: 0,
      checked_at: new Date().toISOString(),
    };
    await recordCheck(failedResult, userId);
    return failedResult;
  }

  // 3. Cache the response for 24h
  setCachedResult(provider, prompt.query_text, providerResp);

  // 4. Analyze brand mentions, position rank, competitors, and citations
  const analysis = analyzeResponse({
    rawResponse: providerResp.responseText,
    brandName: brand.name,
    websiteUrl: brand.website_url,
    competitors: brand.known_competitors,
    providerCitationUrls: providerResp.citations,
  });

  const checkResult: CheckResult = {
    id: `check_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    brand_id: brand.id,
    prompt_id: prompt.id,
    prompt_text: prompt.query_text,
    provider,
    model: providerResp.model,
    status: 'success',
    is_cached: false,
    brand_mentioned: analysis.brandMentioned,
    mention_position: analysis.mentionPosition,
    mention_snippet: analysis.mentionSnippet,
    competitors_mentioned: analysis.competitorsMentioned,
    cited_sources: analysis.citedSources,
    raw_response: providerResp.responseText,
    prompt_tokens: providerResp.promptTokens,
    completion_tokens: providerResp.completionTokens,
    total_tokens: providerResp.totalTokens,
    estimated_cost: providerResp.estimatedCost,
    checked_at: new Date().toISOString(),
  };

  await recordCheck(checkResult, userId);
  return checkResult;
}

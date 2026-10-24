/**
 * Perplexity Provider - BrandSight AI
 * Uses Perplexity Sonar search models.
 * If PERPLEXITY_API_KEY is missing or empty, safely marks provider as 'Coming soon' without breaking the app.
 */
import { ProviderResponse } from './openai';

export interface PerplexityCheckResult extends ProviderResponse {
  isAvailable: boolean;
  comingSoonReason?: string;
}

export function isPerplexityConfigured(apiKey?: string): boolean {
  const key = apiKey || process.env.PERPLEXITY_API_KEY;
  return Boolean(key && !key.startsWith('your_') && key !== 'dummy' && key.trim().length > 5);
}

export async function runPerplexityCheck(prompt: string, apiKey?: string): Promise<PerplexityCheckResult> {
  const key = apiKey || process.env.PERPLEXITY_API_KEY;
  const model = 'sonar';

  if (!isPerplexityConfigured(key)) {
    return {
      provider: 'perplexity',
      model,
      responseText: '',
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
      estimatedCost: 0,
      citations: [],
      isAvailable: false,
      comingSoonReason: 'Perplexity API key not set — Coming soon',
    };
  }

  const payload = {
    model,
    messages: [
      {
        role: 'system',
        content: 'You are a search assistant. Answer the user query thoroughly with accurate recommendations and web citations.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
  };

  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData?.error?.message || `Perplexity returned status ${response.status}`;
    throw new Error(message);
  }

  const data = await response.json();
  const choice = data.choices?.[0];
  const responseText = choice?.message?.content || '';
  const citations: string[] = data.citations || [];

  const promptTokens = data.usage?.prompt_tokens || 0;
  const completionTokens = data.usage?.completion_tokens || 0;
  const totalTokens = promptTokens + completionTokens;

  // Sonar is ~$1 per 1M tokens ($0.000001/token) + $0.005 per search request
  const estimatedCost = (totalTokens * 0.000001) + 0.005;

  return {
    provider: 'perplexity',
    model,
    responseText,
    promptTokens,
    completionTokens,
    totalTokens,
    estimatedCost: parseFloat(estimatedCost.toFixed(6)),
    citations,
    isAvailable: true,
  };
}

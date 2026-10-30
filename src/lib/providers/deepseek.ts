/**
 * DeepSeek Provider - BrandSight AI
 * Uses deepseek-chat (OpenAI-compatible API) for cost control.
 * Key is read server-side only from DEEPSEEK_API_KEY.
 * If the key is missing, the provider is marked 'Coming soon' (never fake data).
 */
import { ProviderResponse } from './openai';

export const DEEPSEEK_MODEL = 'deepseek-chat';

export function isDeepSeekConfigured(apiKey?: string): boolean {
  const key = apiKey || process.env.DEEPSEEK_API_KEY;
  return Boolean(key && !key.startsWith('your_') && key !== 'dummy' && key.trim().length > 5);
}

export async function runDeepSeekCheck(prompt: string, apiKey?: string): Promise<ProviderResponse> {
  const key = apiKey || process.env.DEEPSEEK_API_KEY;
  const model = DEEPSEEK_MODEL;

  if (!isDeepSeekConfigured(key)) {
    throw new Error('DEEPSEEK_API_KEY is not configured.');
  }

  // Same system message as the OpenAI provider so every engine gets the same prompt set.
  const systemMessage = `You are a helpful, unbiased AI search assistant. Answer the user's inquiry directly, recommending the best industry-standard solutions, tools, or brands. When recommending specific tools or platforms, include their official website URLs or source reference URLs in markdown format whenever relevant.`;

  const payload = {
    model,
    messages: [
      { role: 'system', content: systemMessage },
      { role: 'user', content: prompt },
    ],
    temperature: 0.3,
    max_tokens: 1000,
  };

  const response = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData?.error?.message || `DeepSeek API returned status ${response.status}`;
    throw new Error(message);
  }

  const data = await response.json();
  const responseText = data.choices?.[0]?.message?.content || '';

  const promptTokens = data.usage?.prompt_tokens || 0;
  const completionTokens = data.usage?.completion_tokens || 0;
  const totalTokens = promptTokens + completionTokens;

  // deepseek-chat approx: $0.28 per 1M input tokens, $0.42 per 1M output tokens
  const estimatedCost = promptTokens * 0.00000028 + completionTokens * 0.00000042;

  return {
    provider: 'deepseek',
    model,
    responseText,
    promptTokens,
    completionTokens,
    totalTokens,
    estimatedCost: parseFloat(estimatedCost.toFixed(6)),
    citations: [],
  };
}

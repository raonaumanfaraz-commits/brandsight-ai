/**
 * OpenAI Provider - BrandSight AI
 * Uses gpt-4o-mini for maximum cost efficiency and speed.
 */

export interface ProviderResponse {
  provider: 'openai' | 'gemini' | 'deepseek';
  model: string;
  responseText: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCost: number;
  citations: string[];
  isSimulated?: boolean;
}

export async function runOpenAICheck(prompt: string, apiKey?: string): Promise<ProviderResponse> {
  const key = apiKey || process.env.OPENAI_API_KEY;
  const model = 'gpt-4o-mini';

  if (!key || key.startsWith('your_') || key === 'dummy') {
    throw new Error('OPENAI_API_KEY is not configured.');
  }

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

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData?.error?.message || `OpenAI API returned status ${response.status}`;
    throw new Error(message);
  }

  const data = await response.json();
  const choice = data.choices?.[0];
  const responseText = choice?.message?.content || '';

  const promptTokens = data.usage?.prompt_tokens || 0;
  const completionTokens = data.usage?.completion_tokens || 0;
  const totalTokens = promptTokens + completionTokens;

  // Cost calculation: gpt-4o-mini is $0.15 per 1M input tokens, $0.60 per 1M output tokens
  const estimatedCost = (promptTokens * 0.00000015) + (completionTokens * 0.0000006);

  return {
    provider: 'openai',
    model,
    responseText,
    promptTokens,
    completionTokens,
    totalTokens,
    estimatedCost: parseFloat(estimatedCost.toFixed(6)),
    citations: [],
  };
}

/**
 * Google Gemini Provider - BrandSight AI
 * Uses Gemini 2.0 Flash (Free Tier) with Google search grounding citations.
 */
import { ProviderResponse } from './openai';

export async function runGeminiCheck(prompt: string, apiKey?: string): Promise<ProviderResponse> {
  const key = apiKey || process.env.GEMINI_API_KEY;
  const model = 'gemini-2.0-flash';

  if (!key || key.startsWith('your_') || key === 'dummy') {
    throw new Error('GEMINI_API_KEY is not configured.');
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;

  const payload = {
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: `Answer the following search query thoroughly and objectively as an AI search engine. Recommend specific market-leading brands and tools where applicable, including website links or reference URLs: "${prompt}"`,
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 1000,
    },
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData?.error?.message || `Gemini API returned status ${response.status}`;
    throw new Error(message);
  }

  const data = await response.json();
  const candidate = data.candidates?.[0];
  const responseText = candidate?.content?.parts?.[0]?.text || '';

  // Extract grounding metadata / citations if Google Search grounding is returned
  const citations: string[] = [];
  const groundingChunks = candidate?.groundingMetadata?.groundingChunks || [];
  for (const chunk of groundingChunks) {
    if (chunk?.web?.uri) {
      citations.push(chunk.web.uri);
    }
  }

  const promptTokens = data.usageMetadata?.promptTokenCount || Math.ceil(prompt.length / 4);
  const completionTokens = data.usageMetadata?.candidatesTokenCount || Math.ceil(responseText.length / 4);
  const totalTokens = promptTokens + completionTokens;

  // Gemini Free Tier is $0.00
  const estimatedCost = 0.0;

  return {
    provider: 'gemini',
    model,
    responseText,
    promptTokens,
    completionTokens,
    totalTokens,
    estimatedCost,
    citations,
  };
}

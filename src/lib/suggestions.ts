/**
 * BrandSight AI - SEO Fix Suggestions Generator
 * Generates concrete, prioritized SEO fix suggestions derived ONLY from a completed check's results.
 * Uses the cheapest already-configured AI provider model (Gemini free -> OpenAI gpt-4o-mini -> DeepSeek deepseek-chat),
 * with robust rule-based fallback if API keys are absent or calls fail.
 *
 * RULES:
 * - SUGGESTIONS ONLY. Never publishes or touches user websites.
 * - Does not run new brand scans; reuses completed check data.
 * - Maximum 8 suggestions, prioritized High -> Medium -> Low.
 */
import { CheckResult, SeoFixSuggestion, SuggestionPriority } from '@/types';

export interface GenerateSuggestionsOptions {
  check: CheckResult;
  brandName: string;
  websiteUrl: string;
}

// ----------------------------------------------------------------------
// Helper to clean and format domain names
// ----------------------------------------------------------------------
function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url.replace(/^https?:\/\//i, '').split('/')[0];
  }
}

// ----------------------------------------------------------------------
// Deterministic Rule-Based Fallback Generator
// ----------------------------------------------------------------------
export function generateFallbackSuggestions(options: GenerateSuggestionsOptions): SeoFixSuggestion[] {
  const { check, brandName, websiteUrl } = options;
  const query = check.prompt_text || 'target search query';
  const provider = check.provider || 'AI search engine';
  const competitors = check.competitors_mentioned || [];
  const citations = check.cited_sources || [];
  const primaryComp = competitors[0] || 'competing alternatives';

  const suggestions: SeoFixSuggestion[] = [];

  // 1. Missing Brand Mention (High Priority)
  if (!check.brand_mentioned) {
    suggestions.push({
      id: `sugg_missing_${check.id || Date.now()}_1`,
      title: 'Target Query Intent with Dedicated Solution Guide',
      issue: `${brandName} was completely absent from ${provider}'s recommendations for "${query}". ${competitors.length > 0 ? `Competitors (${competitors.slice(0, 3).join(', ')}) dominated the answer.` : 'No brand presence was identified.'}`,
      fix: `Publish a comprehensive guide or landing page targeting "${query}". Clearly define ${brandName}'s value proposition and core capabilities in the first 100 words so AI search crawlers index it as a primary solution.`,
      priority: 'High',
    });

    if (competitors.length > 0) {
      suggestions.push({
        id: `sugg_comp_${check.id || Date.now()}_2`,
        title: `Create Direct Comparison Page (${brandName} vs ${primaryComp})`,
        issue: `The AI engine recommended ${primaryComp} over ${brandName} when users queried "${query}".`,
        fix: `Add a dedicated "${brandName} vs ${primaryComp}" alternative page featuring transparent comparison tables, feature-by-feature breakdowns, and clear migration/switch reasons.`,
        priority: 'High',
      });
    }
  }

  // 2. Mentioned but lower rank (High / Medium Priority)
  if (check.brand_mentioned && check.mention_position && check.mention_position > 1) {
    suggestions.push({
      id: `sugg_rank_${check.id || Date.now()}_3`,
      title: 'Optimize Top-of-Page Entity Definition to Claim #1 Rank',
      issue: `${brandName} was ranked #${check.mention_position} in ${provider}'s list, behind other recommendations.`,
      fix: `Add a crisp, authoritative summary paragraph at the very top of your primary landing page: "${brandName} is a [category] that helps [target audience] achieve [core benefit]". LLMs favor structured lead definitions for top-ranked placement.`,
      priority: 'High',
    });
  }

  // 3. Competitor differentiation (Medium Priority)
  if (competitors.length > 1) {
    suggestions.push({
      id: `sugg_comp_diff_${check.id || Date.now()}_4`,
      title: `Highlight Key Feature Differentiators vs ${competitors.slice(0, 2).join(' & ')}`,
      issue: `AI responses highlighted competing platforms for specific workflows where ${brandName}'s capabilities are not sufficiently emphasized in crawled copy.`,
      fix: `Add a dedicated "Key Features & Comparison" section highlighting 3 distinct advantages ${brandName} holds over ${competitors[0]} and ${competitors[1]}.`,
      priority: 'Medium',
    });
  }

  // 4. Citation Authority Gap (Medium Priority)
  if (citations.length > 0) {
    const topDomains = Array.from(new Set(citations.map(extractDomain))).filter(Boolean);
    const domainList = topDomains.slice(0, 2).join(', ');
    suggestions.push({
      id: `sugg_cite_${check.id || Date.now()}_5`,
      title: 'Earn Inclusion on AI Grounding Sources',
      issue: `The AI engine grounded its response using authoritative reference domains (${domainList}) where ${brandName} has no prominent presence.`,
      fix: `Conduct digital PR outreach to get ${brandName} reviewed, listed, or referenced in roundups on ${topDomains[0] || 'industry authority sites'}. AI engines heavily cite third-party listicles.`,
      priority: 'Medium',
    });
  }

  // 5. Schema Markup: FAQPage (Medium Priority)
  suggestions.push({
    id: `sugg_faq_${check.id || Date.now()}_6`,
    title: 'Implement FAQPage Structured Data (JSON-LD)',
    issue: `The target page lacks machine-readable FAQ schema, reducing the AI engine's ability to extract direct question-and-answer snippets.`,
    fix: `Add Schema.org FAQPage structured data answering: "How does ${brandName} help with ${query}?" and "What makes ${brandName} different from ${primaryComp}?".`,
    priority: 'Medium',
  });

  // 6. Schema Markup: Organization & sameAs (Low Priority)
  suggestions.push({
    id: `sugg_sameas_${check.id || Date.now()}_7`,
    title: "Add 'sameAs' Authority Signals to Organization Schema",
    issue: `AI knowledge graphs require verifiable cross-platform entity signals to validate brand claims and domain authority.`,
    fix: `Update Schema.org Organization markup on ${websiteUrl} with verified sameAs links pointing to official LinkedIn, X/Twitter, Crunchbase, ProductHunt, and G2 profiles.`,
    priority: 'Low',
  });

  // 7. Quantitative proof points (Low Priority)
  suggestions.push({
    id: `sugg_proof_${check.id || Date.now()}_8`,
    title: 'Embed Verifiable Statistics & Direct Quotations',
    issue: `AI models strongly prioritize factual, quantitative assertions (e.g., speed benchmarks, ratings, ROI metrics) over descriptive marketing copy.`,
    fix: `Embed verifiable data points (e.g., "trusted by X creators", "reduces time by Y%") directly in heading summaries and body copy to facilitate AI factual extraction.`,
    priority: 'Low',
  });

  // 8. Natural Language Heading Alignment (Low Priority)
  if (suggestions.length < 8) {
    suggestions.push({
      id: `sugg_heading_${check.id || Date.now()}_9`,
      title: 'Structure Subheadings as Explicit User Questions',
      issue: `Subheadings on the website may use abstract marketing titles rather than the conversational questions users ask AI assistants.`,
      fix: `Refactor H2 and H3 headings to match search phrasing, such as: "Why choose ${brandName} for ${query}?" followed by a direct two-sentence answer block.`,
      priority: 'Low',
    });
  }

  // Ensure priority sort order: High first, then Medium, then Low
  const priorityWeight: Record<SuggestionPriority, number> = { High: 3, Medium: 2, Low: 1 };
  suggestions.sort((a, b) => priorityWeight[b.priority] - priorityWeight[a.priority]);

  return suggestions.slice(0, 8);
}

// ----------------------------------------------------------------------
// Extra AI Call using the cheapest already-configured provider
// ----------------------------------------------------------------------
async function callCheapestProvider(prompt: string): Promise<string> {
  const geminiKey = process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;
  const deepseekKey = process.env.DEEPSEEK_API_KEY;

  // 1. Gemini (Free tier = cheapest, $0.00)
  if (geminiKey && !geminiKey.startsWith('your_') && geminiKey !== 'dummy') {
    const model = 'gemini-1.5-flash';
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`;
    const payload = {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 1200,
        responseMimeType: 'application/json',
      },
    };

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) return text;
    }
  }

  // 2. OpenAI (gpt-4o-mini = $0.15/1M input)
  if (openaiKey && !openaiKey.startsWith('your_') && openaiKey !== 'dummy') {
    const payload = {
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an AI Search Visibility (GEO/AIO) strategist. Output strictly a JSON array of suggestions.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.2,
      max_tokens: 1200,
      response_format: { type: 'json_object' },
    };

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const data = await res.json();
      const text = data.choices?.[0]?.message?.content;
      if (text) return text;
    }
  }

  // 3. DeepSeek (deepseek-chat = $0.28/1M input)
  if (deepseekKey && !deepseekKey.startsWith('your_') && deepseekKey !== 'dummy') {
    const payload = {
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: 'You are an AI Search Visibility (GEO/AIO) strategist. Output strictly a JSON array of suggestions.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.2,
      max_tokens: 1200,
    };

    const res = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${deepseekKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const data = await res.json();
      const text = data.choices?.[0]?.message?.content;
      if (text) return text;
    }
  }

  throw new Error('No AI provider configured or all provider calls failed');
}

// ----------------------------------------------------------------------
// Main Suggestions Generator
// ----------------------------------------------------------------------
export async function generateSeoFixSuggestions(
  options: GenerateSuggestionsOptions
): Promise<SeoFixSuggestion[]> {
  const { check, brandName, websiteUrl } = options;

  // Prepare input from the completed check's existing results ONLY
  const query = check.prompt_text || 'query';
  const provider = check.provider || 'AI engine';
  const mentioned = check.brand_mentioned;
  const position = check.mention_position;
  const snippet = check.mention_snippet;
  const competitors = check.competitors_mentioned || [];
  const citations = check.cited_sources || [];

  const prompt = `Analyze the following completed AI search check result and generate a prioritized list of concrete SEO fix suggestions to increase this brand's visibility in AI search recommendations.

BRAND DETAILS:
- Brand Name: ${brandName}
- Website URL: ${websiteUrl}

CHECK RESULTS (DERIVE SUGGESTIONS ONLY FROM THESE RESULTS):
- Search Query Checked: "${query}"
- AI Engine: ${provider}
- Brand Mentioned: ${mentioned ? `Yes (Rank #${position || 1})` : 'No (Missing from AI response)'}
${snippet ? `- Mention Snippet: "${snippet}"` : ''}
- Competitors Mentioned: ${competitors.length > 0 ? competitors.join(', ') : 'None'}
- Cited Authority Sources: ${citations.length > 0 ? citations.join(', ') : 'None'}

REQUIREMENTS:
- Generate maximum 8 suggestions.
- Priority MUST be "High", "Medium", or "Low". High priority must come first.
- Each suggestion MUST be concrete (e.g., add an FAQ answering X, add a page section covering Y, add FAQPage schema for Z).
- Suggestions ONLY. Never propose auto-publishing or modifying the site directly.
- Return ONLY a JSON array of objects with keys:
  - "title": short action title
  - "issue": what is missing or wrong based on the check result
  - "fix": the concrete fix recommendation
  - "priority": "High" | "Medium" | "Low"

Example JSON output:
[
  {
    "title": "Add FAQ Section Answering Core Query",
    "issue": "Brand was not cited for query X while Competitor Y was recommended.",
    "fix": "Add an FAQ answering 'How does [Brand] solve X?' with FAQPage JSON-LD schema.",
    "priority": "High"
  }
]`;

  try {
    const rawAiResponse = await callCheapestProvider(prompt);

    // Parse JSON safely
    let parsed: any;
    try {
      // Clean possible markdown code fences
      const cleanJson = rawAiResponse
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();

      parsed = JSON.parse(cleanJson);
      // In case OpenAI returns { suggestions: [...] }
      if (!Array.isArray(parsed) && Array.isArray(parsed.suggestions)) {
        parsed = parsed.suggestions;
      }
    } catch {
      // JSON parse failed, fall back
      return generateFallbackSuggestions(options);
    }

    if (Array.isArray(parsed) && parsed.length > 0) {
      const priorityWeight: Record<SuggestionPriority, number> = { High: 3, Medium: 2, Low: 1 };

      const validated: SeoFixSuggestion[] = parsed
        .filter((item) => item && typeof item.title === 'string' && typeof item.fix === 'string')
        .map((item, idx) => {
          const rawPriority = (item.priority || 'Medium').toString().toLowerCase();
          const priority: SuggestionPriority =
            rawPriority === 'high' ? 'High' : rawPriority === 'low' ? 'Low' : 'Medium';

          return {
            id: `sugg_ai_${check.id || Date.now()}_${idx + 1}`,
            title: item.title.trim(),
            issue: (item.issue || 'Visibility gap identified in AI response').trim(),
            fix: item.fix.trim(),
            priority,
          };
        })
        .sort((a, b) => priorityWeight[b.priority] - priorityWeight[a.priority])
        .slice(0, 8);

      if (validated.length > 0) {
        return validated;
      }
    }

    return generateFallbackSuggestions(options);
  } catch (err) {
    // If AI provider is not configured or errors out, seamlessly use the check-derived fallback
    return generateFallbackSuggestions(options);
  }
}

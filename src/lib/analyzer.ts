/**
 * BrandSight AI - Mention & Citation Analyzer
 * Parses AI model responses to detect brand appearances, list positions,
 * competitor presence, and cited reference URLs.
 */

export interface AnalysisInput {
  rawResponse: string;
  brandName: string;
  websiteUrl: string;
  competitors?: string[];
  providerCitationUrls?: string[];
}

export interface AnalysisResult {
  brandMentioned: boolean;
  mentionPosition: number | null; // e.g., 1 (1st place/recommendation), 2, 3...
  mentionSnippet: string | null;
  competitorsMentioned: string[];
  citedSources: string[];
}

/**
 * Clean and normalize a string for regex matching
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Extract domain name from URL (e.g., "viralsplice.com" from "https://www.viralsplice.com/demo")
 */
export function extractDomain(url: string): string {
  try {
    const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
    return parsed.hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return url.replace(/^https?:\/\//i, '').replace(/^www\./i, '').split('/')[0].toLowerCase();
  }
}

/**
 * Extract all URLs from markdown links [text](url) and plain text http/https
 */
export function extractUrlsFromText(text: string): string[] {
  const urls = new Set<string>();

  // 1. Markdown link format: [label](https://...)
  const mdRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/gi;
  let match;
  while ((match = mdRegex.exec(text)) !== null) {
    if (match[2]) urls.add(match[2].trim());
  }

  // 2. Plain text URLs: https://... or http://...
  const plainRegex = /(https?:\/\/[^\s<>"'()]+)/gi;
  while ((match = plainRegex.exec(text)) !== null) {
    if (match[1]) {
      // Remove trailing punctuation like ., !, ), etc.
      const cleaned = match[1].replace(/[.,;:!?)]+$/, '');
      urls.add(cleaned.trim());
    }
  }

  return Array.from(urls);
}

/**
 * Determine the position/ranking of a brand in the AI's response
 */
export function determineMentionPosition(text: string, brandName: string, domain: string): number | null {
  const brandRegex = new RegExp(`\\b(${escapeRegex(brandName)}|${escapeRegex(domain)})\\b`, 'i');
  
  // Split response into numbered list items (e.g., "1. BrandName", "2) BrandName", "### 1. BrandName")
  const lines = text.split('\n');
  let currentListIndex = 0;
  
  for (const line of lines) {
    const trimmed = line.trim();
    // Matches "1. ", "1) ", "**1. ", "# 1. ", "1 - "
    const listMatch = trimmed.match(/^(?:[#*`\s]*)(?:(\d+)[\.\)\-]|\bTop\s+(\d+)\b)/i);
    
    if (listMatch) {
      currentListIndex = parseInt(listMatch[1] || listMatch[2], 10);
      if (brandRegex.test(trimmed)) {
        return currentListIndex;
      }
    } else if (brandRegex.test(trimmed) && currentListIndex > 0) {
      // Brand mentioned inside the current numbered item paragraph
      return currentListIndex;
    }
  }

  // If no numbered list, check paragraph order where brand first appears
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
  for (let i = 0; i < paragraphs.length; i++) {
    if (brandRegex.test(paragraphs[i])) {
      return i + 1;
    }
  }

  return 1; // Default to 1 if mentioned anywhere
}

/**
 * Extract a highlighted contextual snippet around the mention
 */
export function extractMentionSnippet(text: string, brandName: string, domain: string): string | null {
  const brandRegex = new RegExp(`(${escapeRegex(brandName)}|${escapeRegex(domain)})`, 'i');
  const match = brandRegex.exec(text);
  if (!match) return null;

  const matchIndex = match.index;
  const start = Math.max(0, matchIndex - 80);
  const end = Math.min(text.length, matchIndex + match[0].length + 100);

  let snippet = text.slice(start, end).trim();
  if (start > 0) snippet = '...' + snippet;
  if (end < text.length) snippet = snippet + '...';

  return snippet.replace(/[\r\n]+/g, ' ');
}

/**
 * Main analysis function
 */
export function analyzeResponse(input: AnalysisInput): AnalysisResult {
  const { rawResponse, brandName, websiteUrl, competitors = [], providerCitationUrls = [] } = input;

  if (!rawResponse || typeof rawResponse !== 'string') {
    return {
      brandMentioned: false,
      mentionPosition: null,
      mentionSnippet: null,
      competitorsMentioned: [],
      citedSources: [],
    };
  }

  const domain = extractDomain(websiteUrl);
  const brandRegex = new RegExp(`\\b(${escapeRegex(brandName)}|${escapeRegex(domain)})\\b`, 'i');
  const brandMentioned = brandRegex.test(rawResponse);

  let mentionPosition: number | null = null;
  let mentionSnippet: string | null = null;

  if (brandMentioned) {
    mentionPosition = determineMentionPosition(rawResponse, brandName, domain);
    mentionSnippet = extractMentionSnippet(rawResponse, brandName, domain);
  }

  // Detect competitors mentioned
  const competitorsMentioned: string[] = [];
  for (const comp of competitors) {
    if (!comp || comp.trim().length === 0) continue;
    const compRegex = new RegExp(`\\b${escapeRegex(comp.trim())}\\b`, 'i');
    if (compRegex.test(rawResponse)) {
      competitorsMentioned.push(comp.trim());
    }
  }

  // Extract cited URLs from both text parsing and provider groundings
  const textUrls = extractUrlsFromText(rawResponse);
  const allUrls = new Set<string>([...providerCitationUrls, ...textUrls]);

  return {
    brandMentioned,
    mentionPosition,
    mentionSnippet,
    competitorsMentioned,
    citedSources: Array.from(allUrls),
  };
}

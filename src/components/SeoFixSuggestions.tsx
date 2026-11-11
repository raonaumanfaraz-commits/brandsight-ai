'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Copy,
  Check,
  Lock,
  ArrowRight,
  AlertCircle,
  RotateCw,
  SlidersHorizontal,
  ChevronDown,
  Info,
} from 'lucide-react';
import { Brand, CheckResult, PlanTier, SeoFixSuggestion } from '@/types';

interface SeoFixSuggestionsProps {
  brand: Brand;
  checks: CheckResult[];
  planTier: PlanTier;
  authFetch: (url: string, options?: RequestInit) => Promise<Response>;
}

export default function SeoFixSuggestions({
  brand,
  checks,
  planTier,
  authFetch,
}: SeoFixSuggestionsProps) {
  const isPaid = planTier === 'pro' || planTier === 'agency';

  // Sort checks by checked_at descending so the newest check is first
  const validChecks = useMemo(() => {
    return [...checks]
      .filter((c) => c.status === 'success' || c.status === 'cached')
      .sort((a, b) => new Date(b.checked_at).getTime() - new Date(a.checked_at).getTime());
  }, [checks]);

  const [selectedCheckId, setSelectedCheckId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [suggestions, setSuggestions] = useState<SeoFixSuggestion[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState<boolean>(false);

  // In-memory cache keyed by check.id to prevent redundant AI calls on the results page
  const suggestionsCache = useRef<Record<string, SeoFixSuggestion[]>>({});

  // Sync selected check when validChecks change (defaulting to the latest check)
  useEffect(() => {
    if (validChecks.length > 0) {
      if (!selectedCheckId || !validChecks.some((c) => c.id === selectedCheckId)) {
        setSelectedCheckId(validChecks[0].id);
      }
    } else {
      setSelectedCheckId('');
      setSuggestions([]);
      setError(false);
    }
  }, [validChecks, selectedCheckId]);

  const selectedCheck = useMemo(() => {
    return validChecks.find((c) => c.id === selectedCheckId) || validChecks[0] || null;
  }, [validChecks, selectedCheckId]);

  // Fetch or generate suggestions for the selected check
  useEffect(() => {
    if (!selectedCheck) {
      setSuggestions([]);
      setLoading(false);
      setError(false);
      return;
    }

    // Check client-side in-memory cache first
    const cached = suggestionsCache.current[selectedCheck.id];
    if (cached && cached.length > 0) {
      setSuggestions(cached);
      setLoading(false);
      setError(false);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(false);

    const fetchSuggestions = async () => {
      try {
        const res = await authFetch('/api/checks/suggestions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            check_id: selectedCheck.id,
            check: selectedCheck,
            brand_id: brand.id,
            brand_name: brand.name,
            website_url: brand.website_url,
          }),
        });

        const data = await res.json();
        if (!isMounted) return;

        if (data.success && Array.isArray(data.suggestions) && data.suggestions.length > 0) {
          setSuggestions(data.suggestions);
          suggestionsCache.current[selectedCheck.id] = data.suggestions;
          setError(false);
        } else if (data.locked && Array.isArray(data.suggestions)) {
          // Free tier teaser data
          setSuggestions(data.suggestions);
          setError(false);
        } else {
          // Could not generate
          setError(true);
          setSuggestions([]);
        }
      } catch (err) {
        console.warn('Could not generate SEO suggestions:', err);
        if (isMounted) {
          setError(true);
          setSuggestions([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchSuggestions();

    return () => {
      isMounted = false;
    };
  }, [selectedCheck, brand.id, brand.name, brand.website_url, authFetch]);

  // Robust Clipboard copy helper
  const copyText = async (text: string): Promise<boolean> => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch {
      // Fallback
    }
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      return success;
    } catch {
      return false;
    }
  };

  const handleCopySingle = async (item: SeoFixSuggestion) => {
    const formatted = `[PRIORITY: ${item.priority.toUpperCase()}] ${item.title}\nIssue: ${item.issue}\nConcrete Fix: ${item.fix}`;
    const success = await copyText(formatted);
    if (success) {
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleCopyAll = async () => {
    if (!suggestions || suggestions.length === 0) return;
    const header = `SEO FIX SUGGESTIONS - ${brand.name.toUpperCase()}\nTarget Query: "${selectedCheck?.prompt_text || 'Commercial Query'}"\nEngine: ${(selectedCheck?.provider || 'AI').toUpperCase()} | Mentions: ${selectedCheck?.brand_mentioned ? `Rank #${selectedCheck?.mention_position || 1}` : 'Not Mentioned'}\nTotal Fixes: ${suggestions.length}\n${'='.repeat(60)}\n\n`;

    const body = suggestions
      .map(
        (s, idx) =>
          `${idx + 1}. [PRIORITY: ${s.priority.toUpperCase()}] ${s.title}\n   ISSUE: ${s.issue}\n   CONCRETE FIX: ${s.fix}`
      )
      .join('\n\n');

    const footer = `\n\nGenerated by BrandSight AI GEO Tracker (Suggestions Report Only).`;
    const success = await copyText(header + body + footer);
    if (success) {
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    }
  };

  const handleRetry = () => {
    if (!selectedCheck) return;
    delete suggestionsCache.current[selectedCheck.id];
    setError(false);
    setLoading(true);
    // Trigger re-evaluation
    authFetch('/api/checks/suggestions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        check_id: selectedCheck.id,
        check: selectedCheck,
        brand_id: brand.id,
        brand_name: brand.name,
        website_url: brand.website_url,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.suggestions) && data.suggestions.length > 0) {
          setSuggestions(data.suggestions);
          suggestionsCache.current[selectedCheck.id] = data.suggestions;
          setError(false);
        } else {
          setError(true);
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  return (
    <div className="m3-card" style={{ padding: '24px', marginBottom: '32px' }}>
      {/* SECTION TOP BAR */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="icon-tile">
            <Sparkles size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)' }}>
                SEO Fix Suggestions
              </h3>
              <span className="badge-accent" style={{ fontSize: '11px', padding: '2px 8px' }}>
                AI Check Audit
              </span>
              {!isPaid && (
                <span className="badge-purple" style={{ fontSize: '11px', padding: '2px 8px' }}>
                  Pro & Agency Feature
                </span>
              )}
            </div>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Concrete, prioritized on-page and schema fixes derived strictly from this check&apos;s results and competitor gaps.
            </p>
          </div>
        </div>

        {/* Action Controls & Check Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Check Selector if multiple checks exist */}
          {validChecks.length > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <label style={{ fontSize: '11.5px', color: 'var(--text-dim)', fontWeight: 600 }}>
                Query Check:
              </label>
              <select
                value={selectedCheck?.id || ''}
                onChange={(e) => setSelectedCheckId(e.target.value)}
                style={{
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: '12px',
                  color: 'var(--text-main)',
                  fontSize: '12px',
                  padding: '5px 8px',
                  maxWidth: '220px',
                  cursor: 'pointer',
                }}
              >
                {validChecks.map((c) => (
                  <option key={c.id} value={c.id}>
                    &ldquo;{c.prompt_text ? (c.prompt_text.length > 25 ? c.prompt_text.slice(0, 25) + '...' : c.prompt_text) : 'Query'}&rdquo; ({c.provider})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Copy-All Button (Pro/Agency only when suggestions exist) */}
          {isPaid && suggestions.length > 0 && !loading && !error && (
            <button
              onClick={handleCopyAll}
              className="btn-primary"
              style={{ fontSize: '12px', padding: '7px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}
              title="Copy all suggestions formatted with priority, issue, and fix"
            >
              {copiedAll ? (
                <>
                  <Check size={14} style={{ color: '#FFFFFF' }} />
                  <span>All Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={14} />
                  <span>Copy All Suggestions</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* CHECK CONTEXT BAR (Shows the exact check signals this advice is derived from) */}
      {selectedCheck && (
        <div
          style={{
            background: 'var(--bg-tonal)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '8px',
            padding: '10px 14px',
            marginBottom: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            fontSize: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ color: 'var(--text-dim)' }}>Audited Query:</span>
            <strong style={{ color: 'var(--text-main)' }}>&ldquo;{selectedCheck.prompt_text}&rdquo;</strong>
            <span style={{ color: 'var(--text-dim)' }}>&bull; Engine:</span>
            <span className="badge-blue" style={{ textTransform: 'uppercase', fontSize: '10.5px' }}>
              {selectedCheck.provider}
            </span>
            <span style={{ color: 'var(--text-dim)' }}>&bull; Result:</span>
            {selectedCheck.brand_mentioned ? (
              <span style={{ color: 'var(--accent-success-text)', fontWeight: 600 }}>
                Rank #{selectedCheck.mention_position || 1}
              </span>
            ) : (
              <span style={{ color: 'var(--accent-danger-text)', fontWeight: 600 }}>Unlisted / Missing</span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-dim)' }}>
            {selectedCheck.competitors_mentioned?.length > 0 && (
              <span>
                Competitors detected: <strong style={{ color: 'var(--text-main)' }}>{selectedCheck.competitors_mentioned.length}</strong>
              </span>
            )}
            {selectedCheck.cited_sources?.length > 0 && (
              <span>
                Citations: <strong style={{ color: 'var(--text-main)' }}>{selectedCheck.cited_sources.length}</strong>
              </span>
            )}
          </div>
        </div>
      )}

      {/* STATE 1: NO CHECKS RUN YET */}
      {validChecks.length === 0 && (
        <div style={{ padding: '36px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Info size={28} style={{ color: 'var(--accent-primary)', margin: '0 auto 10px', display: 'block' }} />
          <h4 style={{ color: 'var(--text-main)', fontSize: '15px', fontWeight: 700, marginBottom: '6px' }}>
            No Completed Check Results Yet
          </h4>
          <p style={{ fontSize: '13px', maxWidth: '480px', margin: '0 auto' }}>
            Run a brand check above to analyze your AI search rankings and generate prioritized SEO fix suggestions.
          </p>
        </div>
      )}

      {/* STATE 2: LOADING */}
      {validChecks.length > 0 && loading && (
        <div style={{ padding: '40px 20px', textAlign: 'center' }}>
          <RotateCw size={24} className="animate-spin" style={{ color: 'var(--accent-primary)', margin: '0 auto 12px' }} />
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)' }}>
            Generating Prioritized SEO Fix Suggestions...
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Analyzing mentions, competitor placements, and authority citation gaps from this check.
          </p>
        </div>
      )}

      {/* STATE 3: ERROR / COULD NOT GENERATE STATE (Never breaks results page) */}
      {validChecks.length > 0 && !loading && error && (
        <div
          style={{
            padding: '28px 20px',
            textAlign: 'center',
            background: 'rgba(239, 68, 68, 0.05)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '8px',
          }}
        >
          <AlertCircle size={24} style={{ color: 'var(--accent-danger-text)', margin: '0 auto 8px', display: 'block' }} />
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)' }}>
            Could not generate SEO suggestions for this check.
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', maxWidth: '420px', margin: '4px auto 14px' }}>
            The check results remain fully accessible above and below. You can try refreshing or running the suggestion analysis again.
          </p>
          <button
            onClick={handleRetry}
            className="btn-secondary"
            style={{ fontSize: '12px', padding: '6px 14px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <RotateCw size={12} />
            <span>Retry Analysis</span>
          </button>
        </div>
      )}

      {/* STATE 4: FREE PLAN LOCKED TEASER */}
      {validChecks.length > 0 && !loading && !error && !isPaid && (
        <div style={{ position: 'relative' }}>
          {/* Locked Teaser Banner */}
          <div
            style={{
              background: 'var(--accent-subtle)',
              border: '1px solid var(--accent-border)',
              borderRadius: '12px',
              padding: '20px 24px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '20px',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', maxWidth: '700px' }}>
              <div className="icon-tile">
                <Lock size={22} />
              </div>
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-main)' }}>
                  Unlock Prioritized AI Search SEO Fixes
                </h4>
                <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  BrandSight analyzed this check and identified high-impact content, schema, and citation gaps vs competitors. Upgrade to Pro or Agency to unlock full concrete fixes, copy templates, and FAQPage schemas.
                </p>
              </div>
            </div>

            <Link
              href="/pricing"
              className="btn-primary"
              style={{ fontSize: '13px', padding: '9px 18px', display: 'inline-flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}
            >
              <span>Upgrade to Pro to View SEO Fixes</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* Teaser Preview Cards with Blurred Fixes */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', opacity: 0.85 }}>
            {(suggestions.length > 0 ? suggestions : [
              {
                id: 't1',
                title: 'Target Query Intent with Dedicated Guide',
                issue: 'Visibility gap identified vs primary competitors in AI responses.',
                fix: 'Upgrade to Pro or Agency to view the concrete fix.',
                priority: 'High' as const,
              },
              {
                id: 't2',
                title: 'Create Direct Comparison Page Against Leading Competitor',
                issue: 'Competitor was recommended over your brand in commercial queries.',
                fix: 'Upgrade to Pro or Agency to view the concrete fix.',
                priority: 'High' as const,
              },
              {
                id: 't3',
                title: 'Earn Citations on AI Grounding Sources',
                issue: 'AI engine cited external authority domains where your brand is unlisted.',
                fix: 'Upgrade to Pro or Agency to view the concrete fix.',
                priority: 'Medium' as const,
              },
            ]).slice(0, 3).map((item, idx) => (
              <div
                key={item.id || idx}
                style={{
                  background: 'var(--bg-sunken)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  padding: '16px 18px',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        background: item.priority === 'High' ? 'rgba(239, 68, 68, 0.15)' : 'var(--accent-subtle)',
                        color: item.priority === 'High' ? 'var(--accent-danger-text)' : 'var(--accent-primary)',
                        border: `1px solid ${item.priority === 'High' ? 'rgba(239, 68, 68, 0.35)' : 'var(--accent-border)'}`,
                        borderRadius: '4px',
                        padding: '2px 7px',
                        fontSize: '10.5px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                      }}
                    >
                      {item.priority} Priority
                    </span>
                    <strong style={{ fontSize: '13.5px', color: 'var(--text-main)' }}>{item.title}</strong>
                  </div>

                  <Link
                    href="/pricing"
                    className="btn-secondary"
                    style={{ fontSize: '11px', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Lock size={11} style={{ color: 'var(--accent-primary)' }} />
                    <span>Locked</span>
                  </Link>
                </div>

                <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Gap: </span>
                  {item.issue}
                </div>

                <div
                  style={{
                    background: 'var(--accent-subtle)',
                    border: '1px dashed var(--accent-border)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span style={{ fontSize: '11.5px', color: 'var(--accent-primary)', filter: 'blur(3.5px)', userSelect: 'none' }}>
                    Add Schema.org FAQPage structured data answering: What makes your brand different from competitors?
                  </span>
                  <Link href="/pricing" style={{ fontSize: '11px', color: 'var(--accent-primary)', fontWeight: 700, marginLeft: '12px', whiteSpace: 'nowrap' }}>
                    Unlock Concrete Fix &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STATE 5: PAID (PRO / AGENCY) FULL SUGGESTIONS LIST */}
      {validChecks.length > 0 && !loading && !error && isPaid && (
        <div>
          {suggestions.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {suggestions.slice(0, 8).map((item, idx) => (
                <div
                  key={item.id || idx}
                  style={{
                    background: 'var(--bg-sunken)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '12px',
                    padding: '16px 18px',
                    transition: 'border-color 0.2s ease',
                  }}
                >
                  {/* Card Header: Priority, Title, Copy Button */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: '12px',
                      marginBottom: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      {/* Priority Badge */}
                      <span
                        style={{
                          background:
                            item.priority === 'High'
                              ? 'rgba(239, 68, 68, 0.15)'
                              : item.priority === 'Medium'
                                ? 'var(--accent-subtle)'
                                : 'rgba(56, 189, 248, 0.15)',
                          color:
                            item.priority === 'High'
                              ? 'var(--accent-danger-text)'
                              : item.priority === 'Medium'
                                ? 'var(--accent-primary)'
                                : 'var(--accent-info-text)',
                          border: `1px solid ${
                            item.priority === 'High'
                              ? 'rgba(239, 68, 68, 0.35)'
                              : item.priority === 'Medium'
                                ? 'var(--accent-border)'
                                : 'rgba(56, 189, 248, 0.35)'
                          }`,
                          borderRadius: '4px',
                          padding: '2px 8px',
                          fontSize: '10.5px',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                        }}
                      >
                        {item.priority} Priority
                      </span>

                      <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>
                        {item.title}
                      </h4>
                    </div>

                    {/* Individual Copy Button */}
                    <button
                      onClick={() => handleCopySingle(item)}
                      className="btn-secondary"
                      style={{
                        padding: '4px 10px',
                        fontSize: '11.5px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        flexShrink: 0,
                      }}
                      title="Copy suggestion to clipboard"
                    >
                      {copiedId === item.id ? (
                        <>
                          <Check size={12} style={{ color: 'var(--accent-success)' }} />
                          <span style={{ color: 'var(--accent-success)' }}>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={12} />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* What is missing or wrong */}
                  <div style={{ fontSize: '12.5px', color: 'var(--text-dim)', marginBottom: '10px', lineHeight: 1.5 }}>
                    <strong style={{ color: 'var(--text-muted)' }}>Issue / Gap: </strong>
                    {item.issue}
                  </div>

                  {/* Concrete Fix Container */}
                  <div
                    style={{
                      background: 'var(--accent-subtle)',
                      border: '1px solid var(--accent-border)',
                      borderRadius: '8px',
                      padding: '10px 14px',
                      fontSize: '12.5px',
                      color: 'var(--text-main)',
                      lineHeight: 1.55,
                    }}
                  >
                    <div
                      style={{
                        color: 'var(--accent-primary)',
                        fontSize: '11px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.4px',
                        marginBottom: '3px',
                      }}
                    >
                      Concrete Fix:
                    </div>
                    {item.fix}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
              Could not generate SEO suggestions for this check.
            </div>
          )}

          {/* Section Footer Notice */}
          <div
            style={{
              marginTop: '16px',
              fontSize: '11px',
              color: 'var(--text-dim)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '8px',
            }}
          >
            <span>
              Suggestions only. BrandSight generates optimization reports and never modifies or publishes to external websites.
            </span>
            <span style={{ color: 'var(--accent-primary)' }}>
              Showing {suggestions.slice(0, 8).length} prioritized fix suggestions
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

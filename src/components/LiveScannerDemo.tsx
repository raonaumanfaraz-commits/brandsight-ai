'use client';

import React, { useState } from 'react';
import { Search, Sparkles, CheckCircle2, XCircle, ExternalLink, ShieldCheck, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface DemoResult {
  provider: string;
  mentioned: boolean;
  position: number | null;
  snippet: string;
  sources: string[];
  competitors: string[];
}

const PRESET_EXAMPLES = [
  {
    brand: 'ViralSplice',
    url: 'https://viralsplice.com',
    query: 'best AI tool to turn long YouTube videos into TikTok shorts',
  },
  {
    brand: 'Linear',
    url: 'https://linear.app',
    query: 'fastest modern issue tracker for agile software engineers',
  },
  {
    brand: 'Supabase',
    url: 'https://supabase.com',
    query: 'best open source Firebase alternative with Postgres',
  },
];

export default function LiveScannerDemo() {
  const [brandName, setBrandName] = useState('ViralSplice');
  const [websiteUrl, setWebsiteUrl] = useState('https://viralsplice.com');
  const [query, setQuery] = useState('best AI tool to turn long YouTube videos into TikTok shorts');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState<DemoResult[] | null>(null);

  const handleScan = () => {
    if (!brandName || !query) return;
    setIsScanning(true);
    setScanResults(null);

    setTimeout(() => {
      setScanResults([
        {
          provider: 'ChatGPT (gpt-4o-mini)',
          mentioned: true,
          position: 1,
          snippet: `1. **${brandName}** (${websiteUrl}) is highly recommended for automated viral hook detection, auto-captions, and instant 9:16 re-framing.`,
          sources: [websiteUrl, 'https://techcrunch.com/video-ai', 'https://creatoreconomy.org'],
          competitors: ['Opus Clip', 'CapCut', 'Klap'],
        },
        {
          provider: 'Google Gemini (1.5 Flash)',
          mentioned: true,
          position: 2,
          snippet: `Top solutions include Opus Clip and **${brandName}**, with ${brandName} excelling at smart zoom cuts and multi-speaker tracking.`,
          sources: [websiteUrl, 'https://searchengineland.com/best-ai-video'],
          competitors: ['Opus Clip', 'Munch'],
        },
        {
          provider: 'Perplexity AI (Sonar)',
          mentioned: false,
          position: null,
          snippet: `Prominent video clipping tools cited in search benchmarks include Opus Clip, Descript, and InVideo.`,
          sources: ['https://forbes.com/advisor/video-tools', 'https://g2.com/categories/ai-video'],
          competitors: ['Opus Clip', 'Descript', 'InVideo'],
        },
      ]);
      setIsScanning(false);
    }, 1200);
  };

  return (
    <section id="live-demo" style={{
      maxWidth: '1100px',
      margin: '60px auto',
      padding: '0 20px',
    }}>
      <div className="glass-panel" style={{
        padding: '36px',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid rgba(201, 164, 92, 0.35)',
      }}>
        {/* Glow corner badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '24px',
        }}>
          <div>
            <span className="badge-gold">
              <Sparkles size={12} />
              Interactive GEO Live Scanner
            </span>
            <h3 style={{ fontSize: '24px', fontWeight: 800, color: '#FFF', marginTop: '8px' }}>
              Test Any Brand in AI Search Now
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
              See live how AI models rank your brand, which competitors appear, and what sources are cited.
            </p>
          </div>

          {/* Quick presets */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>Try preset:</span>
            {PRESET_EXAMPLES.map((preset) => (
              <button
                key={preset.brand}
                type="button"
                onClick={() => {
                  setBrandName(preset.brand);
                  setWebsiteUrl(preset.url);
                  setQuery(preset.query);
                }}
                className="btn-secondary"
                style={{ fontSize: '12px', padding: '4px 10px' }}
              >
                {preset.brand}
              </button>
            ))}
          </div>
        </div>

        {/* Search Inputs */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '14px',
          marginBottom: '18px',
        }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
              BRAND NAME
            </label>
            <input
              type="text"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              placeholder="e.g. ViralSplice"
              style={{
                width: '100%',
                padding: '12px 14px',
                background: 'rgba(8, 25, 46, 0.7)',
                border: '1px solid var(--border-medium)',
                borderRadius: '8px',
                color: '#FFF',
                fontSize: '14px',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
              WEBSITE URL
            </label>
            <input
              type="text"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="e.g. https://viralsplice.com"
              style={{
                width: '100%',
                padding: '12px 14px',
                background: 'rgba(8, 25, 46, 0.7)',
                border: '1px solid var(--border-medium)',
                borderRadius: '8px',
                color: '#FFF',
                fontSize: '14px',
              }}
            />
          </div>

          <div style={{ gridColumn: 'span 1' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
              TARGET SEARCH QUERY / PROMPT
            </label>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. best video editing tool for YouTubers"
              style={{
                width: '100%',
                padding: '12px 14px',
                background: 'rgba(8, 25, 46, 0.7)',
                border: '1px solid var(--border-medium)',
                borderRadius: '8px',
                color: '#FFF',
                fontSize: '14px',
              }}
            />
          </div>
        </div>

        {/* Scan Button */}
        <button
          onClick={handleScan}
          disabled={isScanning}
          className="btn-gold"
          style={{ width: '100%', padding: '14px', fontSize: '15px' }}
        >
          {isScanning ? (
            <span>Querying ChatGPT, Google Gemini & Perplexity...</span>
          ) : (
            <>
              <Search size={18} />
              <span>Run Instant Visibility Scan Across 3 AI Engines</span>
            </>
          )}
        </button>

        {/* Live Results Card Grid */}
        {scanResults && (
          <div style={{ marginTop: '28px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
            }}>
              <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#FFF' }}>
                Scan Results for &ldquo;{brandName}&rdquo;
              </h4>
              <span style={{ fontSize: '12px', color: 'var(--gold-primary)', fontWeight: 600 }}>
                Overall Mention Rate: 67% (2 / 3 Engines)
              </span>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '16px',
            }}>
              {scanResults.map((res) => (
                <div
                  key={res.provider}
                  style={{
                    background: 'rgba(8, 25, 46, 0.85)',
                    border: res.mentioned ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '12px',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '12px',
                    }}>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: '#FFF' }}>
                        {res.provider}
                      </span>
                      {res.mentioned ? (
                        <span className="badge-green">
                          <CheckCircle2 size={12} />
                          Rank #{res.position} Mentioned
                        </span>
                      ) : (
                        <span style={{
                          background: 'rgba(239, 68, 68, 0.15)',
                          color: '#F87171',
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '999px',
                        }}>
                          <XCircle size={12} style={{ display: 'inline', marginRight: '4px' }} />
                          Missing in Answers
                        </span>
                      )}
                    </div>

                    <p style={{
                      fontSize: '13px',
                      color: 'var(--text-muted)',
                      lineHeight: 1.5,
                      marginBottom: '14px',
                      fontStyle: res.mentioned ? 'normal' : 'italic',
                    }}>
                      &ldquo;{res.snippet}&rdquo;
                    </p>
                  </div>

                  <div>
                    {/* Competitors detected */}
                    <div style={{ marginBottom: '10px' }}>
                      <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-dim)', display: 'block', marginBottom: '4px' }}>
                        Competitors Detected:
                      </span>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {res.competitors.map((comp) => (
                          <span
                            key={comp}
                            style={{
                              fontSize: '11px',
                              background: 'rgba(255, 255, 255, 0.05)',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              color: '#CBD5E1',
                            }}
                          >
                            {comp}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Cited sources */}
                    <div>
                      <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-dim)', display: 'block', marginBottom: '4px' }}>
                        Cited Sources:
                      </span>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {res.sources.map((src) => (
                          <span
                            key={src}
                            style={{
                              fontSize: '11px',
                              color: 'var(--gold-primary)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <ExternalLink size={10} />
                            {src.replace(/^https?:\/\//i, '').split('/')[0]}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA bar */}
            <div style={{
              marginTop: '20px',
              padding: '16px 20px',
              background: 'rgba(201, 164, 92, 0.1)',
              border: '1px solid rgba(201, 164, 92, 0.3)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
            }}>
              <div>
                <strong style={{ color: '#FFF', fontSize: '14px' }}>
                  Want continuous daily AI visibility tracking & weekly email reports?
                </strong>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Set up your brand and 50+ prompts with automatic guardrails and competitor alerts.
                </p>
              </div>
              <Link href="/dashboard" className="btn-gold" style={{ fontSize: '13px', padding: '8px 16px' }}>
                <span>Launch Free Brand Setup</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import LiveScannerDemo from '@/components/LiveScannerDemo';
import LicenseModal from '@/components/LicenseModal';
import {
  Search,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Check,
  ArrowRight,
  Zap,
  BarChart3,
  Globe,
  Lock,
  ChevronRight,
  Bot,
  Layers,
  Key,
} from 'lucide-react';
import { PLAN_LIMITS } from '@/types';

export default function LandingPage() {
  const [showLicenseModal, setShowLicenseModal] = useState(false);

  return (
    <div style={{ position: 'relative', overflowX: 'hidden' }}>
      <Navbar />

      {/* HERO SECTION */}
      <section style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '80px 24px 40px',
        textAlign: 'center',
        position: 'relative',
      }}>
        {/* Top Announcement Pill */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
          <span className="badge-gold">
            <Sparkles size={12} />
            The Generative Engine Optimization (GEO) Tracker
          </span>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            CodeRao High-Performance Analytics
          </span>
        </div>

        {/* Main Headline */}
        <h1 style={{
          fontSize: 'clamp(36px, 5.5vw, 64px)',
          fontWeight: 800,
          lineHeight: 1.15,
          letterSpacing: '-1px',
          maxWidth: '940px',
          margin: '0 auto 24px',
          color: '#FFF',
        }}>
          Ranking #1 on Google is no longer enough.{' '}
          <span className="gold-text-gradient">
            Are AI search engines recommending your brand?
          </span>
        </h1>

        {/* Subhead */}
        <p style={{
          fontSize: 'clamp(16px, 2vw, 20px)',
          color: 'var(--text-muted)',
          maxWidth: '780px',
          margin: '0 auto 36px',
          lineHeight: 1.6,
        }}>
          Brands lose up to 60% of search clicks to AI Overviews and chat answers.
          <strong style={{ color: '#FFF' }}> BrandSight AI </strong> tracks whether your brand appears in{' '}
          <strong style={{ color: 'var(--gold-primary)' }}>ChatGPT, Google Gemini, and DeepSeek</strong>,
          at which ranking position, and which reference URLs are cited.
        </p>

        {/* CTA Buttons */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          flexWrap: 'wrap',
          marginBottom: '50px',
        }}>
          <Link href="/dashboard" className="btn-gold" style={{ fontSize: '16px', padding: '14px 28px' }}>
            <span>Start Tracking Free (1 Brand &bull; 5 Prompts)</span>
            <ArrowRight size={18} />
          </Link>

          <a href="#live-demo" className="btn-secondary" style={{ fontSize: '15px', padding: '14px 24px' }}>
            <Search size={16} style={{ color: 'var(--gold-primary)' }} />
            <span>Try Live AI Scanner</span>
          </a>
        </div>

        {/* Supported AI Engine Badges */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '28px',
          flexWrap: 'wrap',
          color: 'var(--text-dim)',
          fontSize: '13px',
          textTransform: 'uppercase',
          letterSpacing: '0.8px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }} />
            <span>OpenAI (GPT-4o-mini)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3B82F6' }} />
            <span>Google Gemini (Free Tier)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#C084FC' }} />
            <span>DeepSeek (deepseek-chat)</span>
          </div>
        </div>
      </section>

      {/* INTERACTIVE LIVE SCANNER DEMO */}
      <LiveScannerDemo />

      {/* HOW IT WORKS SECTION */}
      <section id="how-it-works" style={{
        maxWidth: '1200px',
        margin: '80px auto',
        padding: '0 24px',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <span className="badge-gold">Simple 3-Step Workflow</span>
          <h2 style={{ fontSize: '32px', fontWeight: 800, color: '#FFF', marginTop: '10px' }}>
            How BrandSight AI Tracks Your Visibility
          </h2>
          <p style={{ fontSize: '15px', color: 'var(--text-muted)', maxWidth: '600px', margin: '8px auto 0' }}>
            Continuous Generative Engine Optimization (GEO) tracking built for lean founders and marketing teams.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px',
        }}>
          {/* Step 1 */}
          <div className="glass-panel" style={{ padding: '32px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'rgba(201, 164, 92, 0.15)',
              border: '1px solid rgba(201, 164, 92, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--gold-primary)',
              fontSize: '20px',
              fontWeight: 800,
              marginBottom: '20px',
            }}>
              01
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#FFF', marginBottom: '10px' }}>
              Set Up Your Brand & Prompts
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Add your website URL, known competitors, and 5 to 10 commercial search questions your buyers ask AI (e.g. &ldquo;best video editing tool for YouTubers&rdquo;).
            </p>
          </div>

          {/* Step 2 */}
          <div className="glass-panel" style={{ padding: '32px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'rgba(59, 130, 246, 0.15)',
              border: '1px solid rgba(59, 130, 246, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#60A5FA',
              fontSize: '20px',
              fontWeight: 800,
              marginBottom: '20px',
            }}>
              02
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#FFF', marginBottom: '10px' }}>
              Multi-Engine AI Checks
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              We query OpenAI (gpt-4o-mini), Google Gemini (free tier), and DeepSeek. Our 24-hour cache guardrail guarantees you never waste duplicate API budget.
            </p>
          </div>

          {/* Step 3 */}
          <div className="glass-panel" style={{ padding: '32px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#34D399',
              fontSize: '20px',
              fontWeight: 800,
              marginBottom: '20px',
            }}>
              03
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#FFF', marginBottom: '10px' }}>
              Rank Tracking & Weekly Reports
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Inspect your mention rate %, list position ranking, competitor presence, and cited sources. Receive weekly executive email digests tracking week-over-week trends.
            </p>
          </div>
        </div>
      </section>

      {/* COST GUARDRAILS BANNER */}
      <section id="guardrails" style={{
        maxWidth: '1200px',
        margin: '80px auto',
        padding: '0 24px',
      }}>
        <div className="glass-panel" style={{
          padding: '40px',
          background: 'linear-gradient(135deg, rgba(14, 34, 56, 0.95) 0%, rgba(8, 25, 46, 0.98) 100%)',
          border: '1px solid rgba(201, 164, 92, 0.4)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <ShieldCheck size={24} style={{ color: 'var(--gold-primary)' }} />
            <span className="badge-gold">Built-In Cost Guardrails</span>
          </div>

          <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#FFF', marginBottom: '12px' }}>
            Engineered for Maximum Token & Cost Efficiency
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', maxWidth: '720px', lineHeight: 1.6, marginBottom: '28px' }}>
            Running automated AI prompts can quickly become expensive if left unmetered. BrandSight AI enforces strict cost guardrails as a foundational architecture pillar:
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '20px',
          }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '18px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontWeight: 700, color: '#FFF', marginBottom: '6px' }}>
                ⚡ 24-Hour Prompt Cache
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                If a prompt was executed in the last 24 hours, cached results are returned instantly without invoking redundant API bills unless force-refreshed.
              </p>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '18px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontWeight: 700, color: '#FFF', marginBottom: '6px' }}>
                💰 Economical Model Defaults
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                OpenAI checks default to <code>gpt-4o-mini</code> ($0.15/1M input) and Google Gemini runs on the generous free tier for near-zero operational overhead.
              </p>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '18px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontWeight: 700, color: '#FFF', marginBottom: '6px' }}>
                📊 Real-Time Token Auditing
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Every check logs prompt tokens, completion tokens, and estimated cost so administrators have 100% financial visibility down to the micro-penny.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING SECTION (FREEMIUM / LEMON SQUEEZY) */}
      <section id="pricing" style={{
        maxWidth: '1200px',
        margin: '80px auto',
        padding: '0 24px',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <span className="badge-gold">Transparent Freemium Pricing</span>
          <h2 style={{ fontSize: '32px', fontWeight: 800, color: '#FFF', marginTop: '10px' }}>
            Scale From One Brand to Full Agency Portfolios
          </h2>
          <p style={{ fontSize: '15px', color: 'var(--text-muted)', maxWidth: '600px', margin: '8px auto 0' }}>
            Powered by Lemon Squeezy secure checkout with single-activation license key validation.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px',
          alignItems: 'stretch',
        }}>
          {/* FREE PLAN */}
          <div className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <span className="badge-blue">Forever Free</span>
              <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#FFF', marginTop: '12px' }}>Free Tier</h3>
              <div style={{ margin: '16px 0 20px' }}>
                <span style={{ fontSize: '36px', fontWeight: 800, color: '#FFF' }}>$0</span>
                <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}> / month</span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>
                Perfect for indie makers and solo founders wanting to check their primary brand.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13.5px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Check size={16} style={{ color: '#10B981' }} />
                  <span><strong>1 Brand</strong> tracking</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Check size={16} style={{ color: '#10B981' }} />
                  <span><strong>5 Search Prompts</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Check size={16} style={{ color: '#10B981' }} />
                  <span><strong>Weekly auto-checks</strong> (Cost guardrail)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Check size={16} style={{ color: '#10B981' }} />
                  <span>OpenAI & Google Gemini models</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Check size={16} style={{ color: '#10B981' }} />
                  <span>Weekly email visibility report</span>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '32px' }}>
              <Link href="/dashboard" className="btn-secondary" style={{ width: '100%' }}>
                Get Started Free
              </Link>
            </div>
          </div>

          {/* PRO PLAN ($19/mo) */}
          <div className="glass-panel" style={{
            padding: '32px',
            border: '2px solid var(--gold-primary)',
            boxShadow: '0 10px 40px rgba(201, 164, 92, 0.25)',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}>
            <div style={{
              position: 'absolute',
              top: '-12px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'linear-gradient(135deg, #DFBA6F 0%, #C9A45C 100%)',
              color: '#08192E',
              fontSize: '11px',
              fontWeight: 800,
              padding: '3px 12px',
              borderRadius: '999px',
              textTransform: 'uppercase',
              letterSpacing: '0.6px',
            }}>
              Most Popular
            </div>

            <div>
              <span className="badge-gold">For Growth SaaS & Creators</span>
              <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#FFF', marginTop: '12px' }}>Pro Plan</h3>
              <div style={{ margin: '16px 0 20px' }}>
                <span style={{ fontSize: '36px', fontWeight: 800, color: 'var(--gold-primary)' }}>$19</span>
                <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}> / month</span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>
                Daily visibility tracking for multiple products and in-depth competitor benchmarking.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13.5px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Check size={16} style={{ color: 'var(--gold-primary)' }} />
                  <span><strong>5 Brands</strong> tracking</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Check size={16} style={{ color: 'var(--gold-primary)' }} />
                  <span><strong>50 Search Prompts</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Check size={16} style={{ color: 'var(--gold-primary)' }} />
                  <span><strong>Daily auto-checks</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Check size={16} style={{ color: 'var(--gold-primary)' }} />
                  <span>OpenAI, Gemini & DeepSeek</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Check size={16} style={{ color: 'var(--gold-primary)' }} />
                  <span>Competitor share-of-voice alerts</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Check size={16} style={{ color: 'var(--gold-primary)' }} />
                  <span>Lemon Squeezy License (1 activation)</span>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <a
                href={process.env.NEXT_PUBLIC_LEMON_PRO_CHECKOUT_URL || '#pricing'}
                onClick={(e) => {
                  if (!process.env.NEXT_PUBLIC_LEMON_PRO_CHECKOUT_URL) {
                    e.preventDefault();
                    setShowLicenseModal(true);
                  }
                }}
                className="btn-gold"
                style={{ width: '100%' }}
              >
                <span>Upgrade to Pro ($19/mo)</span>
                <ArrowRight size={16} />
              </a>
              <button
                type="button"
                onClick={() => setShowLicenseModal(true)}
                className="btn-secondary"
                style={{ width: '100%', fontSize: '12px', padding: '6px' }}
              >
                Already have a license key? Activate
              </button>
            </div>
          </div>

          {/* AGENCY PLAN ($49/mo) */}
          <div className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <span className="badge-purple">Agencies & Consultancies</span>
              <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#FFF', marginTop: '12px' }}>Agency Plan</h3>
              <div style={{ margin: '16px 0 20px' }}>
                <span style={{ fontSize: '36px', fontWeight: 800, color: '#FFF' }}>$49</span>
                <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}> / month</span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>
                Full suite for SEO/GEO agencies managing dozens of client brands and custom reports.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13.5px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Check size={16} style={{ color: '#C084FC' }} />
                  <span><strong>20 Brands</strong> tracking</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Check size={16} style={{ color: '#C084FC' }} />
                  <span><strong>200 Search Prompts</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Check size={16} style={{ color: '#C084FC' }} />
                  <span><strong>Daily auto-checks</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Check size={16} style={{ color: '#C084FC' }} />
                  <span><strong>White-label executive reports</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Check size={16} style={{ color: '#C084FC' }} />
                  <span>Client CSV & JSON API export</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Check size={16} style={{ color: '#C084FC' }} />
                  <span>Dedicated priority support</span>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <a
                href={process.env.NEXT_PUBLIC_LEMON_AGENCY_CHECKOUT_URL || '#pricing'}
                onClick={(e) => {
                  if (!process.env.NEXT_PUBLIC_LEMON_AGENCY_CHECKOUT_URL) {
                    e.preventDefault();
                    setShowLicenseModal(true);
                  }
                }}
                className="btn-secondary"
                style={{ width: '100%', borderColor: 'rgba(192, 132, 252, 0.4)' }}
              >
                <span>Get Agency ($49/mo)</span>
                <ArrowRight size={16} />
              </a>
              <button
                type="button"
                onClick={() => setShowLicenseModal(true)}
                className="btn-secondary"
                style={{ width: '100%', fontSize: '12px', padding: '6px' }}
              >
                Activate Agency License Key
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{
        borderTop: '1px solid rgba(201, 164, 92, 0.2)',
        background: '#040E1B',
        padding: '50px 24px',
        marginTop: '80px',
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <strong style={{ fontSize: '16px', color: '#FFF' }}>BrandSight AI</strong>
              <span className="badge-gold">CodeRao</span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-dim)', maxWidth: '420px' }}>
              Generative Engine Optimization (GEO) tracker monitoring ChatGPT, Gemini, and DeepSeek brand recommendations.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', fontSize: '13px', color: 'var(--text-muted)' }}>
            <Link href="/dashboard">Dashboard</Link>
            <button
              onClick={() => setShowLicenseModal(true)}
              style={{ background: 'transparent', color: 'var(--text-muted)' }}
            >
              Activate License
            </button>
            <a href="#guardrails">Cost Guardrails</a>
            <a href="#pricing">Pricing</a>
          </div>
        </div>

        <div style={{
          maxWidth: '1200px',
          margin: '30px auto 0',
          paddingTop: '20px',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          fontSize: '12px',
          color: 'var(--text-dim)',
          textAlign: 'center',
        }}>
          &copy; {new Date().getFullYear()} BrandSight AI. All rights reserved &bull; CodeRao High-Performance AI Architecture.
        </div>
      </footer>

      {showLicenseModal && <LicenseModal onClose={() => setShowLicenseModal(false)} />}
    </div>
  );
}

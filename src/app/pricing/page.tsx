'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import LicenseModal from '@/components/LicenseModal';
import { Check, ArrowRight } from 'lucide-react';

export default function PricingPage() {
  const [showLicenseModal, setShowLicenseModal] = useState(false);

  return (
    <div style={{ position: 'relative', overflowX: 'hidden' }}>
      <Navbar />

      {/* PRICING SECTION (FREEMIUM / LEMON SQUEEZY) - same tiers, prices and checkout links as homepage */}
      <section id="pricing" style={{
        maxWidth: '1200px',
        margin: '80px auto',
        padding: '0 24px',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <span className="badge-gold">Transparent Freemium Pricing</span>
          <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#FFF', marginTop: '10px' }}>
            Scale From One Brand to Full Agency Portfolios
          </h1>
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
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#FFF', marginTop: '12px' }}>Free Tier</h2>
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
                  <span>OpenAI &amp; Google Gemini models</span>
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
              <span className="badge-gold">For Growth SaaS &amp; Creators</span>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#FFF', marginTop: '12px' }}>Pro Plan</h2>
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
                  <span>OpenAI, Gemini &amp; DeepSeek</span>
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
              <span className="badge-purple">Agencies &amp; Consultancies</span>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#FFF', marginTop: '12px' }}>Agency Plan</h2>
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
                  <span>Client CSV &amp; JSON API export</span>
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
            <Link href="/">Home</Link>
            <Link href="/dashboard">Dashboard</Link>
            <button
              onClick={() => setShowLicenseModal(true)}
              style={{ background: 'transparent', color: 'var(--text-muted)' }}
            >
              Activate License
            </button>
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

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Eye, Key, ArrowRight, Sparkles } from 'lucide-react';
import LicenseModal from './LicenseModal';

export default function Navbar() {
  const [showLicenseModal, setShowLicenseModal] = useState(false);

  return (
    <>
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(8, 25, 46, 0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(201, 164, 92, 0.2)',
        padding: '14px 24px',
      }}>
        <div style={{
          maxWidth: '1240px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          {/* Brand Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #DFBA6F 0%, #C9A45C 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#08192E',
              boxShadow: '0 0 15px rgba(201, 164, 92, 0.4)',
            }}>
              <Eye size={22} strokeWidth={2.5} />
            </div>
            <div>
              <div style={{
                fontSize: '18px',
                fontWeight: 800,
                letterSpacing: '-0.3px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}>
                <span>BrandSight</span>
                <span style={{
                  color: 'var(--gold-primary)',
                  fontSize: '11px',
                  fontWeight: 800,
                  background: 'rgba(201, 164, 92, 0.15)',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  border: '1px solid rgba(201, 164, 92, 0.3)',
                }}>AI</span>
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-dim)', letterSpacing: '0.4px', textTransform: 'uppercase' }}>
                GEO Search Visibility
              </div>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav style={{
            display: 'flex',
            alignItems: 'center',
            gap: '24px',
            fontSize: '14px',
            fontWeight: 500,
            color: 'var(--text-muted)',
          }}>
            <a href="/#how-it-works" style={{ transition: 'color 0.2s' }}>How It Works</a>
            <a href="/#live-demo" style={{ transition: 'color 0.2s' }}>Live Scanner</a>
            <a href="/#pricing" style={{ transition: 'color 0.2s' }}>Pricing</a>
            <a href="/#guardrails" style={{ transition: 'color 0.2s' }}>Cost Guardrails</a>
            <Link href="/blog" style={{ transition: 'color 0.2s' }}>Blog</Link>
          </nav>

          {/* Right Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => setShowLicenseModal(true)}
              className="btn-secondary"
              style={{ fontSize: '13px', padding: '8px 14px' }}
              title="Activate Lemon Squeezy License Key"
            >
              <Key size={15} style={{ color: 'var(--gold-primary)' }} />
              <span>Activate Key</span>
            </button>

            <Link href="/dashboard" className="btn-gold" style={{ fontSize: '13px', padding: '8px 16px' }}>
              <span>Launch Dashboard</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </header>

      {showLicenseModal && <LicenseModal onClose={() => setShowLicenseModal(false)} />}
    </>
  );
}

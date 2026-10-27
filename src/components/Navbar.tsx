'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Eye, Key, ArrowRight, LogIn, LogOut, User, Sparkles, ShieldCheck } from 'lucide-react';
import LicenseModal from './LicenseModal';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const [showLicenseModal, setShowLicenseModal] = useState(false);
  const { user, profile, signOut, openAuthModal } = useAuth();

  return (
    <>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: 'rgba(8, 25, 46, 0.88)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(201, 164, 92, 0.2)',
          padding: '12px 24px',
        }}
      >
        <div
          style={{
            maxWidth: '1240px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            flexWrap: 'wrap',
          }}
        >
          {/* Brand Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #DFBA6F 0%, #C9A45C 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#08192E',
                boxShadow: '0 0 15px rgba(201, 164, 92, 0.4)',
              }}
            >
              <Eye size={22} strokeWidth={2.5} />
            </div>
            <div>
              <div
                style={{
                  fontSize: '18px',
                  fontWeight: 800,
                  letterSpacing: '-0.3px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>BrandSight</span>
                <span
                  style={{
                    color: 'var(--gold-primary)',
                    fontSize: '11px',
                    fontWeight: 800,
                    background: 'rgba(201, 164, 92, 0.15)',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    border: '1px solid rgba(201, 164, 92, 0.3)',
                  }}
                >
                  AI
                </span>
              </div>
              <div
                style={{
                  fontSize: '10px',
                  color: 'var(--text-dim)',
                  letterSpacing: '0.4px',
                  textTransform: 'uppercase',
                }}
              >
                GEO Search Visibility
              </div>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              fontSize: '14px',
              fontWeight: 500,
              color: 'var(--text-muted)',
            }}
          >
            <a href="/#how-it-works" style={{ transition: 'color 0.2s' }}>
              How It Works
            </a>
            <a href="/#live-demo" style={{ transition: 'color 0.2s' }}>
              Live Scanner
            </a>
            <a href="/#pricing" style={{ transition: 'color 0.2s' }}>
              Pricing
            </a>
            <a href="/#guardrails" style={{ transition: 'color 0.2s' }}>
              Guardrails
            </a>
            <Link href="/blog" style={{ transition: 'color 0.2s' }}>
              Blog
            </Link>
          </nav>

          {/* Right Action / Auth Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {user ? (
              /* LOGGED IN STATE */
              <>
                {/* User Info Chip */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'rgba(13, 34, 59, 0.9)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    fontSize: '13px',
                  }}
                >
                  <User size={15} style={{ color: 'var(--gold-primary)' }} />
                  <span
                    style={{
                      maxWidth: '140px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      color: 'var(--text-main)',
                      fontWeight: 500,
                    }}
                    title={user.email}
                  >
                    {user.email}
                  </span>
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 800,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      textTransform: 'uppercase',
                      background:
                        profile?.plan_tier === 'agency'
                          ? 'linear-gradient(135deg, #DFBA6F 0%, #C9A45C 100%)'
                          : profile?.plan_tier === 'pro'
                          ? 'rgba(201, 164, 92, 0.25)'
                          : 'rgba(255, 255, 255, 0.1)',
                      color: profile?.plan_tier === 'agency' ? '#08192E' : 'var(--gold-primary)',
                      border: '1px solid rgba(201, 164, 92, 0.35)',
                    }}
                  >
                    {profile?.plan_tier || 'FREE'}
                  </span>
                </div>

                {/* If Free, show activate/link key */}
                {profile?.plan_tier === 'free' && (
                  <button
                    onClick={() => setShowLicenseModal(true)}
                    className="btn-secondary"
                    style={{ fontSize: '12px', padding: '7px 12px' }}
                    title="Link Lemon Squeezy License Key"
                  >
                    <Key size={14} style={{ color: 'var(--gold-primary)' }} />
                    <span>Link Key</span>
                  </button>
                )}

                {/* Dashboard Link */}
                <Link
                  href="/dashboard"
                  className="btn-gold"
                  style={{ fontSize: '13px', padding: '7px 14px' }}
                >
                  <span>Dashboard</span>
                  <ArrowRight size={14} />
                </Link>

                {/* Log Out Button */}
                <button
                  onClick={() => signOut()}
                  className="btn-secondary"
                  style={{
                    fontSize: '12px',
                    padding: '7px 10px',
                    background: 'transparent',
                    borderColor: 'rgba(239, 68, 68, 0.25)',
                    color: '#F87171',
                  }}
                  title="Sign out of BrandSight"
                >
                  <LogOut size={15} />
                  <span>Log out</span>
                </button>
              </>
            ) : (
              /* LOGGED OUT STATE */
              <>
                <button
                  onClick={() => setShowLicenseModal(true)}
                  className="btn-secondary"
                  style={{ fontSize: '13px', padding: '8px 13px' }}
                  title="Activate Lemon Squeezy License Key"
                >
                  <Key size={14} style={{ color: 'var(--gold-primary)' }} />
                  <span>Activate Key</span>
                </button>

                <button
                  onClick={() => openAuthModal('login')}
                  className="btn-secondary"
                  style={{ fontSize: '13px', padding: '8px 14px' }}
                >
                  <LogIn size={15} />
                  <span>Log in</span>
                </button>

                <button
                  onClick={() => openAuthModal('signup')}
                  className="btn-gold"
                  style={{ fontSize: '13px', padding: '8px 16px' }}
                >
                  <span>Sign up</span>
                  <ArrowRight size={14} />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {showLicenseModal && <LicenseModal onClose={() => setShowLicenseModal(false)} />}
    </>
  );
}

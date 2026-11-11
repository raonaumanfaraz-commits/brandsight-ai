'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Eye,
  Key,
  ArrowRight,
  LogIn,
  LogOut,
  User,
  Home,
  ScanSearch,
  Tag,
  LayoutDashboard,
} from 'lucide-react';
import LicenseModal from './LicenseModal';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '@/context/AuthContext';

const MOBILE_TABS = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/#live-demo', label: 'Scanner', icon: ScanSearch },
  { href: '/pricing', label: 'Pricing', icon: Tag },
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
];

export default function Navbar() {
  const [showLicenseModal, setShowLicenseModal] = useState(false);
  const { user, profile, signOut, openAuthModal } = useAuth();
  const pathname = usePathname();

  const isActiveTab = (href: string) => {
    if (href === '/') return pathname === '/';
    if (href === '/#live-demo') return false;
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: 'var(--nav-bg)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--border-subtle)',
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
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #339dff 0%, #0a84ff 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 2px 10px var(--accent-glow)',
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
                <span className="badge-accent" style={{ fontSize: '11px', padding: '2px 6px' }}>
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

          {/* Navigation Links (desktop, hidden on mobile: bottom nav takes over) */}
          <nav className="nav-links">
            <a href="/#how-it-works">How It Works</a>
            <a href="/#live-demo">Live Scanner</a>
            <a href="/pricing">Pricing</a>
            <a href="/#guardrails">Guardrails</a>
            <Link href="/blog">Blog</Link>
          </nav>

          {/* Right Action / Auth Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ThemeToggle />
            {user ? (
              /* LOGGED IN STATE */
              <>
                {/* User Info Chip */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'var(--bg-tonal)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: '12px',
                    padding: '6px 12px',
                    fontSize: '13px',
                  }}
                >
                  <User size={15} style={{ color: 'var(--accent-primary)' }} />
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
                          ? 'linear-gradient(135deg, #339dff 0%, #0a84ff 100%)'
                          : profile?.plan_tier === 'pro'
                          ? 'var(--accent-subtle)'
                          : 'var(--bg-tonal)',
                      color: profile?.plan_tier === 'agency' ? '#ffffff' : 'var(--accent-primary)',
                      border: '1px solid var(--accent-border)',
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
                    style={{ fontSize: '12px', padding: '7px 12px', minHeight: '36px' }}
                    title="Link Lemon Squeezy License Key"
                  >
                    <Key size={14} style={{ color: 'var(--accent-primary)' }} />
                    <span>Link Key</span>
                  </button>
                )}

                {/* Dashboard Link */}
                <Link
                  href="/dashboard"
                  className="btn-primary"
                  style={{ fontSize: '13px', padding: '7px 14px', minHeight: '36px' }}
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
                    minHeight: '36px',
                    borderColor: 'rgba(239, 68, 68, 0.3)',
                    color: 'var(--accent-danger-text)',
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
                  style={{ fontSize: '13px', padding: '8px 13px', minHeight: '36px' }}
                  title="Activate Lemon Squeezy License Key"
                >
                  <Key size={14} style={{ color: 'var(--accent-primary)' }} />
                  <span>Activate Key</span>
                </button>

                <button
                  onClick={() => openAuthModal('login')}
                  className="btn-secondary"
                  style={{ fontSize: '13px', padding: '8px 14px', minHeight: '36px' }}
                >
                  <LogIn size={15} />
                  <span>Log in</span>
                </button>

                <button
                  onClick={() => openAuthModal('signup')}
                  className="btn-primary"
                  style={{ fontSize: '13px', padding: '8px 16px', minHeight: '36px' }}
                >
                  <span>Sign up</span>
                  <ArrowRight size={14} />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Mobile bottom navigation (3-5 tabs, per the design standards) */}
      <nav className="mobile-nav" aria-label="Mobile navigation">
        {MOBILE_TABS.map((tab) => {
          const Icon = tab.icon;
          const active = isActiveTab(tab.href);
          return (
            <Link key={tab.href} href={tab.href} className={active ? 'active' : undefined}>
              <Icon size={20} />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </nav>

      {showLicenseModal && <LicenseModal onClose={() => setShowLicenseModal(false)} />}
    </>
  );
}

'use client';

import React, { useState } from 'react';
import { Key, X, CheckCircle2, AlertCircle, Sparkles, ShieldCheck, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface LicenseModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export default function LicenseModal({ onClose, onSuccess }: LicenseModalProps) {
  const { user, authFetch, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'lemonsqueezy' | 'appsumo'>('lemonsqueezy');
  const [licenseKey, setLicenseKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successTier, setSuccessTier] = useState<string | null>(null);
  const [appsumoCode, setAppsumoCode] = useState('');
  const [appsumoLoading, setAppsumoLoading] = useState(false);
  const [appsumoError, setAppsumoError] = useState<string | null>(null);

  const handleActivate = async (keyToUse?: string) => {
    const key = (keyToUse || licenseKey).trim();
    if (!key) {
      setError('Please provide a valid Lemon Squeezy license key.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await authFetch('/api/license/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ license_key: key }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Activation failed');
      }

      setSuccessTier(data.tier);
      await refreshProfile();

      // Remember key in localStorage for linking if guest
      if (!user) {
        try {
          localStorage.setItem('brandsight_license_key', key);
        } catch {
          // ignore
        }
      }

      if (onSuccess) onSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Activation error';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeemAppSumo = async () => {
    const code = appsumoCode.trim().toUpperCase();
    if (!code) {
      setAppsumoError('Please enter your AppSumo code.');
      return;
    }

    setAppsumoLoading(true);
    setAppsumoError(null);

    try {
      const res = await authFetch('/api/license/redeem-appsumo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Redemption failed');
      }

      setSuccessTier(data.tierLabel || 'AppSumo');
      await refreshProfile();

      if (onSuccess) onSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Redemption error';
      setAppsumoError(msg);
    } finally {
      setAppsumoLoading(false);
    }
  };

  return (
    <div className="modal-overlay">

      <div className="m3-card modal-panel" style={{
          maxWidth: '480px',
          width: '100%',
          padding: '28px',
          position: 'relative',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'transparent',
            color: 'var(--text-muted)',
            padding: '4px',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div className="icon-tile">
            <Key size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)' }}>
              {user ? 'Link License to Account' : 'Activate Lemon Squeezy License'}
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              {user ? `Will link to ${user.email}` : 'Enables Pro/Agency on your device'}
            </p>
          </div>
        </div>

        {/* User Account Notice */}
        {user && (
          <div
            style={{
              background: 'var(--accent-subtle)',
              border: '1px solid rgba(10, 132, 255, 0.25)',
              borderRadius: '8px',
              padding: '10px 14px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '12.5px',
              color: 'var(--accent-primary)',
            }}
          >
            <ShieldCheck size={16} style={{ flexShrink: 0, color: 'var(--accent-primary)' }} />
            <span>
              This license key will be tied to <strong>{user.email}</strong>, so your plan stays active
              across all your devices without re-entering the key.
            </span>
          </div>
        )}

        {/* License source tabs */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '16px',
            background: 'var(--bg-sunken)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '8px',
            padding: '4px',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('lemonsqueezy')}
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 600,
              background: activeTab === 'lemonsqueezy' ? 'var(--accent-subtle)' : 'transparent',
              color: activeTab === 'lemonsqueezy' ? 'var(--accent-primary)' : 'var(--text-muted)',
            }}
          >
            Lemon Squeezy
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('appsumo')}
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 600,
              background: activeTab === 'appsumo' ? 'var(--accent-subtle)' : 'transparent',
              color: activeTab === 'appsumo' ? 'var(--accent-primary)' : 'var(--text-muted)',
            }}
          >
            AppSumo
          </button>
        </div>

        {successTier ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '2px solid var(--accent-success)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                color: 'var(--accent-success)',
              }}
            >
              <CheckCircle2 size={32} />
            </div>
            <h4 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
              License Successfully Activated!
            </h4>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Your account now has full{' '}
              <strong style={{ color: 'var(--accent-primary)' }}>{successTier.toUpperCase()}</strong>{' '}
              privileges unlocked.
            </p>
            <button
              onClick={() => {
                onClose();
                if (typeof window !== 'undefined' && window.location.pathname !== '/dashboard') {
                  window.location.href = '/dashboard';
                }
              }}
              className="btn-primary"
              style={{ width: '100%' }}
            >
              Continue to Dashboard
            </button>
          </div>
        ) : activeTab === 'appsumo' ? (
          <>
            <p
              style={{
                fontSize: '13.5px',
                color: 'var(--text-muted)',
                marginBottom: '18px',
                lineHeight: 1.5,
              }}
            >
              Paste the code from your AppSumo purchase to unlock your lifetime tier. Tier 1 (BS1-):
              3 brands, 25 prompts, weekly checks. Tier 2 (BS2-): 5 brands, 50 prompts, daily
              checks, plus CSV &amp; JSON export.
            </p>

            <div style={{ marginBottom: '16px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  marginBottom: '6px',
                }}
              >
                APPSUMO CODE
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="e.g. BS1-XXXX-XXXX-XXXX"
                  value={appsumoCode}
                  onChange={(e) => setAppsumoCode(e.target.value.toUpperCase())}
                  className="field-input" style={{ fontFamily: 'var(--font-mono)' }}
                />
              </div>
            </div>

            {appsumoError && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  color: 'var(--accent-danger-text)',
                  fontSize: '13px',
                  marginBottom: '16px',
                }}
              >
                <AlertCircle size={16} />
                <span>{appsumoError}</span>
              </div>
            )}

            <button
              onClick={handleRedeemAppSumo}
              disabled={appsumoLoading}
              className="btn-primary"
              style={{ width: '100%', opacity: appsumoLoading ? 0.7 : 1 }}
            >
              {appsumoLoading ? 'Redeeming code...' : 'Redeem AppSumo Code'}
            </button>
          </>
        ) : (
          <>
            <p
              style={{
                fontSize: '13.5px',
                color: 'var(--text-muted)',
                marginBottom: '18px',
                lineHeight: 1.5,
              }}
            >
              Paste the license key received in your Lemon Squeezy order email to unlock higher brand
              tracking limits and daily automated AI scans.
            </p>

            <div style={{ marginBottom: '16px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  marginBottom: '6px',
                }}
              >
                LICENSE KEY
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="e.g. 8A19B-4D2E-9C81-XXXX"
                  value={licenseKey}
                  onChange={(e) => setLicenseKey(e.target.value)}
                  className="field-input" style={{ fontFamily: 'var(--font-mono)' }}
                />
              </div>
            </div>

            {error && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  color: 'var(--accent-danger-text)',
                  fontSize: '13px',
                  marginBottom: '16px',
                }}
              >
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={() => handleActivate()}
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', opacity: loading ? 0.7 : 1, marginBottom: '20px' }}
            >
              {loading ? 'Validating via Lemon Squeezy...' : user ? 'Link Key to My Account' : 'Activate License'}
            </button>

            {/* Development / Demo Quick Test Keys */}
            <div
              style={{
                borderTop: '1px solid var(--border-subtle)',
                paddingTop: '16px',
                marginTop: '8px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: 'var(--accent-primary)',
                  textTransform: 'uppercase',
                  marginBottom: '8px',
                }}
              >
                <Sparkles size={12} />
                <span>Demo / Test License Keys</span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setLicenseKey('TEST-PRO-DEMO-2026');
                    handleActivate('TEST-PRO-DEMO-2026');
                  }}
                  className="btn-secondary"
                  style={{ flex: 1, fontSize: '11px', padding: '6px' }}
                >
                  ⚡ Test Pro Key
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLicenseKey('TEST-AGENCY-DEMO-2026');
                    handleActivate('TEST-AGENCY-DEMO-2026');
                  }}
                  className="btn-secondary"
                  style={{ flex: 1, fontSize: '11px', padding: '6px' }}
                >
                  💎 Test Agency Key
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

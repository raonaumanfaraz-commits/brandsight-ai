'use client';

import React, { useState } from 'react';
import { Key, X, CheckCircle2, AlertCircle, Sparkles, ShieldCheck } from 'lucide-react';

interface LicenseModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export default function LicenseModal({ onClose, onSuccess }: LicenseModalProps) {
  const [licenseKey, setLicenseKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successTier, setSuccessTier] = useState<string | null>(null);

  const handleActivate = async (keyToUse?: string) => {
    const key = (keyToUse || licenseKey).trim();
    if (!key) {
      setError('Please provide a valid Lemon Squeezy license key.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/license/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ license_key: key }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Activation failed');
      }

      setSuccessTier(data.tier);
      if (onSuccess) onSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Activation error';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(4, 13, 24, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '20px',
    }}>
      <div className="glass-panel" style={{
        maxWidth: '480px',
        width: '100%',
        padding: '28px',
        position: 'relative',
        boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
      }}>
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
          }}
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: 'rgba(201, 164, 92, 0.15)',
            border: '1px solid rgba(201, 164, 92, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--gold-primary)',
          }}>
            <Key size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#FFF' }}>
              Activate Lemon Squeezy License
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              1 activation per license (ViralSplice protocol)
            </p>
          </div>
        </div>

        {successTier ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '2px solid #10B981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              color: '#10B981',
            }}>
              <CheckCircle2 size={32} />
            </div>
            <h4 style={{ fontSize: '18px', fontWeight: 700, color: '#FFF', marginBottom: '8px' }}>
              License Successfully Activated!
            </h4>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Your account is now unlocked with full <strong style={{ color: 'var(--gold-primary)' }}>{successTier.toUpperCase()}</strong> privileges.
            </p>
            <button
              onClick={() => {
                onClose();
                window.location.href = '/dashboard';
              }}
              className="btn-gold"
              style={{ width: '100%' }}
            >
              Go to Dashboard
            </button>
          </div>
        ) : (
          <>
            <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', marginBottom: '18px', lineHeight: 1.5 }}>
              Paste the license key received in your Lemon Squeezy order email to upgrade your brand tracking limits and enable daily checks.
            </p>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                LICENSE KEY
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="e.g. 8A19B-4D2E-9C81-XXXX"
                  value={licenseKey}
                  onChange={(e) => setLicenseKey(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    background: 'rgba(8, 25, 46, 0.7)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: '8px',
                    color: '#FFF',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '13px',
                  }}
                />
              </div>
            </div>

            {error && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                padding: '10px 12px',
                borderRadius: '6px',
                color: '#F87171',
                fontSize: '13px',
                marginBottom: '16px',
              }}>
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={() => handleActivate()}
              disabled={loading}
              className="btn-gold"
              style={{ width: '100%', opacity: loading ? 0.7 : 1, marginBottom: '20px' }}
            >
              {loading ? 'Validating via Lemon Squeezy...' : 'Activate License'}
            </button>

            {/* Offline QA quick test keys */}
            <div style={{
              borderTop: '1px solid var(--border-subtle)',
              paddingTop: '16px',
              marginTop: '8px',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--gold-primary)',
                textTransform: 'uppercase',
                marginBottom: '8px',
              }}>
                <Sparkles size={12} />
                <span>Local Development / Demo Test Keys</span>
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

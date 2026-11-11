'use client';

import React, { useState } from 'react';
import { Building2, X, Plus, AlertCircle, Sparkles } from 'lucide-react';
import { PlanTier } from '@/types';
import { useAuth } from '@/context/AuthContext';

interface AddBrandModalProps {
  planTier: PlanTier;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddBrandModal({ planTier, onClose, onSuccess }: AddBrandModalProps) {
  const { authFetch } = useAuth();
  const [name, setName] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [industry, setIndustry] = useState('Technology & SaaS');
  const [competitors, setCompetitors] = useState('');
  const [frequency, setFrequency] = useState<'weekly' | 'daily'>(planTier === 'free' ? 'weekly' : 'daily');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !websiteUrl) {
      setError('Please provide brand name and website URL.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const compList = competitors
        .split(',')
        .map((c) => c.trim())
        .filter((c) => c.length > 0);

      const res = await authFetch('/api/brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          website_url: websiteUrl.trim(),
          industry,
          known_competitors: compList,
          check_frequency: frequency,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create brand');
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error creating brand';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="m3-card modal-panel" style={{
        maxWidth: '520px',
        width: '100%',
        padding: '28px',
        position: 'relative',
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
          <div className="icon-tile">
            <Building2 size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)' }}>
              Add New Brand
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Configure your brand profile and competitor monitoring
            </p>
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
            color: 'var(--accent-danger-text)',
            fontSize: '13px',
            marginBottom: '16px',
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '14px' }}>
            <label className="field-label">
              BRAND NAME *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. ViralSplice"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="field-input"
            />
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label className="field-label">
              OFFICIAL WEBSITE URL *
            </label>
            <input
              type="url"
              required
              placeholder="https://viralsplice.com"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              className="field-input"
            />
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label className="field-label">
              INDUSTRY / NICHE
            </label>
            <input
              type="text"
              placeholder="e.g. AI Video Editor, E-commerce, B2B SaaS"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="field-input"
            />
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label className="field-label">
              KNOWN COMPETITORS (Comma-separated)
            </label>
            <input
              type="text"
              placeholder="e.g. Opus Clip, Munch, Klap, CapCut"
              value={competitors}
              onChange={(e) => setCompetitors(e.target.value)}
              className="field-input"
            />
          </div>

          <div style={{ marginBottom: '22px' }}>
            <label className="field-label">
              CHECK FREQUENCY
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <label style={{
                flex: 1,
                padding: '10px',
                background: frequency === 'weekly' ? 'var(--accent-subtle)' : 'var(--bg-sunken)',
                border: frequency === 'weekly' ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                borderRadius: '8px',
                cursor: 'pointer',
                textAlign: 'center',
                fontSize: '13px',
              }}>
                <input
                  type="radio"
                  name="freq"
                  checked={frequency === 'weekly'}
                  onChange={() => setFrequency('weekly')}
                  style={{ display: 'none' }}
                />
                <span style={{ fontWeight: 600, color: frequency === 'weekly' ? 'var(--accent-primary)' : 'var(--text-main)' }}>
                  Weekly Check (All Plans)
                </span>
              </label>

              <label style={{
                flex: 1,
                padding: '10px',
                background: frequency === 'daily' ? 'var(--accent-subtle)' : 'var(--bg-sunken)',
                border: frequency === 'daily' ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                borderRadius: '8px',
                cursor: planTier === 'free' ? 'not-allowed' : 'pointer',
                opacity: planTier === 'free' ? 0.6 : 1,
                textAlign: 'center',
                fontSize: '13px',
              }}>
                <input
                  type="radio"
                  name="freq"
                  disabled={planTier === 'free'}
                  checked={frequency === 'daily'}
                  onChange={() => setFrequency('daily')}
                  style={{ display: 'none' }}
                />
                <span style={{ fontWeight: 600, color: frequency === 'daily' ? 'var(--accent-primary)' : 'var(--text-main)' }}>
                  Daily Check (Pro/Agency)
                </span>
              </label>
            </div>
            {planTier === 'free' && (
              <span style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px', display: 'block' }}>
                * Daily checks are unlocked on Pro ($19/mo) and Agency ($49/mo) plans.
              </span>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Saving Brand...' : 'Save Brand & Setup Prompts'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

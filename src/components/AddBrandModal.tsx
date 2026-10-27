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
        maxWidth: '520px',
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
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
            <Building2 size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#FFF' }}>
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
            color: '#F87171',
            fontSize: '13px',
            marginBottom: '16px',
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
              BRAND NAME *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. ViralSplice"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: 'rgba(8, 25, 46, 0.7)',
                border: '1px solid var(--border-medium)',
                borderRadius: '8px',
                color: '#FFF',
                fontSize: '14px',
              }}
            />
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
              OFFICIAL WEBSITE URL *
            </label>
            <input
              type="url"
              required
              placeholder="https://viralsplice.com"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: 'rgba(8, 25, 46, 0.7)',
                border: '1px solid var(--border-medium)',
                borderRadius: '8px',
                color: '#FFF',
                fontSize: '14px',
              }}
            />
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
              INDUSTRY / NICHE
            </label>
            <input
              type="text"
              placeholder="e.g. AI Video Editor, E-commerce, B2B SaaS"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: 'rgba(8, 25, 46, 0.7)',
                border: '1px solid var(--border-medium)',
                borderRadius: '8px',
                color: '#FFF',
                fontSize: '14px',
              }}
            />
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
              KNOWN COMPETITORS (Comma-separated)
            </label>
            <input
              type="text"
              placeholder="e.g. Opus Clip, Munch, Klap, CapCut"
              value={competitors}
              onChange={(e) => setCompetitors(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: 'rgba(8, 25, 46, 0.7)',
                border: '1px solid var(--border-medium)',
                borderRadius: '8px',
                color: '#FFF',
                fontSize: '14px',
              }}
            />
          </div>

          <div style={{ marginBottom: '22px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
              CHECK FREQUENCY
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <label style={{
                flex: 1,
                padding: '10px',
                background: frequency === 'weekly' ? 'rgba(201, 164, 92, 0.15)' : 'rgba(8, 25, 46, 0.5)',
                border: frequency === 'weekly' ? '1px solid var(--gold-primary)' : '1px solid var(--border-subtle)',
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
                <span style={{ fontWeight: 600, color: frequency === 'weekly' ? 'var(--gold-primary)' : '#FFF' }}>
                  Weekly Check (All Plans)
                </span>
              </label>

              <label style={{
                flex: 1,
                padding: '10px',
                background: frequency === 'daily' ? 'rgba(201, 164, 92, 0.15)' : 'rgba(8, 25, 46, 0.5)',
                border: frequency === 'daily' ? '1px solid var(--gold-primary)' : '1px solid var(--border-subtle)',
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
                <span style={{ fontWeight: 600, color: frequency === 'daily' ? 'var(--gold-primary)' : '#FFF' }}>
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
            <button type="submit" disabled={loading} className="btn-gold">
              {loading ? 'Saving Brand...' : 'Save Brand & Setup Prompts'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

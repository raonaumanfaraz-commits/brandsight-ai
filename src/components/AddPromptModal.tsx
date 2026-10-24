'use client';

import React, { useState } from 'react';
import { HelpCircle, X, Sparkles, AlertCircle, Plus } from 'lucide-react';
import { Brand } from '@/types';

interface AddPromptModalProps {
  brand: Brand;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddPromptModal({ brand, onClose, onSuccess }: AddPromptModalProps) {
  const [queryText, setQueryText] = useState('');
  const [category, setCategory] = useState('Product Recommendation');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const suggestedPrompts = [
    `best ${brand.industry || 'software'} for creators and businesses`,
    `top alternatives to ${brand.known_competitors[0] || 'market leader'} in 2026`,
    `fastest automated tool to solve ${brand.industry || 'productivity tasks'}`,
    `is ${brand.name} worth it compared to ${brand.known_competitors[1] || 'competitors'}?`,
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryText.trim()) {
      setError('Please enter a query or prompt to track.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand_id: brand.id,
          query_text: queryText.trim(),
          category,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to add prompt');
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error adding prompt';
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
            <HelpCircle size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#FFF' }}>
              Add Search Query for {brand.name}
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Queries that potential customers ask AI search engines
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
              SEARCH QUERY / QUESTION *
            </label>
            <textarea
              rows={3}
              required
              placeholder="e.g. best video editing tool for YouTubers"
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: 'rgba(8, 25, 46, 0.7)',
                border: '1px solid var(--border-medium)',
                borderRadius: '8px',
                color: '#FFF',
                fontSize: '14px',
                resize: 'none',
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
              QUERY CATEGORY
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: '#0D223B',
                border: '1px solid var(--border-medium)',
                borderRadius: '8px',
                color: '#FFF',
                fontSize: '13px',
              }}
            >
              <option value="Product Recommendation">Product Recommendation</option>
              <option value="Competitor Comparison">Competitor Comparison / Alternatives</option>
              <option value="Feature Specific">Feature Specific</option>
              <option value="General Brand Intent">General Brand Intent</option>
            </select>
          </div>

          {/* Quick Ideas */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '20px',
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
              <span>Suggested Query Ideas (Click to use)</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {suggestedPrompts.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setQueryText(p)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    textAlign: 'left',
                    color: '#94A3B8',
                    fontSize: '12px',
                    padding: '4px 6px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#FFF';
                    e.currentTarget.style.background = 'rgba(201, 164, 92, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#94A3B8';
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  &bull; {p}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-gold">
              {loading ? 'Adding Prompt...' : 'Add Search Query'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

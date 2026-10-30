'use client';

import React, { useState } from 'react';
import { Mail, X, Send, Eye, CheckCircle2, AlertCircle } from 'lucide-react';
import { Brand, BrandStats } from '@/types';

interface WeeklyReportModalProps {
  brand: Brand;
  stats: BrandStats;
  onClose: () => void;
}

export default function WeeklyReportModal({ brand, stats, onClose }: WeeklyReportModalProps) {
  const [recipientEmail, setRecipientEmail] = useState('founder@brandsight.ai');
  const [activeTab, setActiveTab] = useState<'preview' | 'send'>('preview');
  const [sending, setSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSend = async () => {
    if (!recipientEmail) return;
    setSending(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/reports/send-weekly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand_id: brand.id,
          recipient_email: recipientEmail,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to dispatch email');

      setIsSuccess(true);
      setStatusMessage(data.message || 'Weekly report dispatched successfully!');
    } catch (err: unknown) {
      setIsSuccess(false);
      const msg = err instanceof Error ? err.message : 'Error sending report';
      setStatusMessage(msg);
    } finally {
      setSending(false);
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
        maxWidth: '680px',
        width: '100%',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'rgba(201, 164, 92, 0.15)',
              border: '1px solid rgba(201, 164, 92, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--gold-primary)',
            }}>
              <Mail size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#FFF' }}>
                Weekly Executive AI Visibility Report
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {brand.name} &bull; Generated from live check history
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{ background: 'transparent', color: 'var(--text-muted)', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab switch */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '0 24px',
          gap: '16px',
        }}>
          <button
            onClick={() => setActiveTab('preview')}
            style={{
              padding: '12px 0',
              background: 'transparent',
              borderBottom: activeTab === 'preview' ? '2px solid var(--gold-primary)' : '2px solid transparent',
              color: activeTab === 'preview' ? 'var(--gold-primary)' : 'var(--text-muted)',
              fontSize: '13px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Eye size={15} />
            <span>Interactive HTML Preview</span>
          </button>

          <button
            onClick={() => setActiveTab('send')}
            style={{
              padding: '12px 0',
              background: 'transparent',
              borderBottom: activeTab === 'send' ? '2px solid var(--gold-primary)' : '2px solid transparent',
              color: activeTab === 'send' ? 'var(--gold-primary)' : 'var(--text-muted)',
              fontSize: '13px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Send size={15} />
            <span>Send Email via Resend / SMTP</span>
          </button>
        </div>

        {/* Content Area */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          {activeTab === 'preview' ? (
            <div style={{
              background: '#08192E',
              border: '1px solid rgba(201, 164, 92, 0.3)',
              borderRadius: '10px',
              padding: '24px',
            }}>
              <div style={{
                borderBottom: '2px solid #C9A45C',
                paddingBottom: '16px',
                marginBottom: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <div>
                  <h4 style={{ color: '#C9A45C', fontSize: '18px', fontWeight: 800 }}>
                    ⚡ BrandSight AI Report
                  </h4>
                  <span style={{ fontSize: '13px', color: '#94A3B8' }}>
                    Weekly Search Visibility Audit: <strong>{brand.name}</strong>
                  </span>
                </div>
                <span className="badge-green">▲ +8% vs last week</span>
              </div>

              {/* KPI cards */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '12px',
                marginBottom: '20px',
              }}>
                <div style={{ background: 'rgba(14, 34, 56, 0.8)', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: '#C9A45C' }}>
                    {stats.mentionRate}%
                  </div>
                  <div style={{ fontSize: '11px', color: '#94A3B8', textTransform: 'uppercase' }}>Mention Rate</div>
                </div>
                <div style={{ background: 'rgba(14, 34, 56, 0.8)', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: '#FFF' }}>
                    #{stats.avgPosition > 0 ? stats.avgPosition : '1.0'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#94A3B8', textTransform: 'uppercase' }}>Avg Position</div>
                </div>
                <div style={{ background: 'rgba(14, 34, 56, 0.8)', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: '#FFF' }}>
                    {stats.totalChecks}
                  </div>
                  <div style={{ fontSize: '11px', color: '#94A3B8', textTransform: 'uppercase' }}>Checks Run</div>
                </div>
              </div>

              {/* Engines summary */}
              <div style={{ marginBottom: '18px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#C9A45C', textTransform: 'uppercase', marginBottom: '8px' }}>
                  AI Engine Breakdown
                </div>
                <div style={{ fontSize: '13px', color: '#CBD5E1', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px' }}>
                    <span>ChatGPT (gpt-4o-mini)</span>
                    <strong style={{ color: '#C9A45C' }}>{stats.providerBreakdown.openai.rate}% mention rate</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px' }}>
                    <span>Google Gemini (Free tier)</span>
                    <strong style={{ color: '#C9A45C' }}>{stats.providerBreakdown.gemini.rate}% mention rate</strong>
                  </div>
                  {stats.providerBreakdown.deepseek.total > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px' }}>
                      <span>DeepSeek (deepseek-chat)</span>
                      <strong style={{ color: '#C9A45C' }}>{stats.providerBreakdown.deepseek.rate}% mention rate</strong>
                    </div>
                  )}
                </div>
              </div>

              {/* GEO Tip */}
              <div style={{
                background: 'rgba(201, 164, 92, 0.08)',
                borderLeft: '3px solid #C9A45C',
                padding: '12px',
                borderRadius: '4px',
                fontSize: '12px',
                color: '#CBD5E1',
              }}>
                <strong style={{ color: '#C9A45C', display: 'block', marginBottom: '4px' }}>
                  Generative Engine Optimization (GEO) Recommendation:
                </strong>
                AI search models synthesize answers primarily from authoritative listicles and product comparison pages. Ensuring your domain is referenced on citing hubs like {stats.topSources[0]?.url || 'Tech blogs'} will reinforce your presence in AI answers.
              </div>
            </div>
          ) : (
            <div>
              <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', marginBottom: '18px', lineHeight: 1.5 }}>
                Send this weekly summary directly to stakeholders, founders, or clients. Emails are dispatched via Resend or your configured SMTP provider.
              </p>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  RECIPIENT EMAIL ADDRESS
                </label>
                <input
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="founder@example.com"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    background: 'rgba(8, 25, 46, 0.7)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: '8px',
                    color: '#FFF',
                    fontSize: '14px',
                  }}
                />
              </div>

              {statusMessage && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: isSuccess ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  border: isSuccess ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                  padding: '12px',
                  borderRadius: '6px',
                  color: isSuccess ? '#34D399' : '#F87171',
                  fontSize: '13px',
                  marginBottom: '16px',
                }}>
                  {isSuccess ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  <span>{statusMessage}</span>
                </div>
              )}

              <button
                onClick={handleSend}
                disabled={sending}
                className="btn-gold"
                style={{ width: '100%', padding: '12px' }}
              >
                {sending ? 'Sending Weekly Report...' : 'Send Weekly Report Now'}
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'flex-end',
        }}>
          <button onClick={onClose} className="btn-secondary" style={{ fontSize: '13px' }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

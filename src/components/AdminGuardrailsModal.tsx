'use client';

import React, { useState, useEffect } from 'react';
import { DollarSign, ShieldCheck, X, Cpu, Clock, Layers, RefreshCw } from 'lucide-react';
import { TokenLog } from '@/types';

interface UsageSummary {
  totalTokens: number;
  totalCost: number;
  totalChecks: number;
  providerUsage: Record<string, { tokens: number; cost: number; checks: number }>;
}

interface AdminGuardrailsModalProps {
  onClose: () => void;
}

export default function AdminGuardrailsModal({ onClose }: AdminGuardrailsModalProps) {
  const [summary, setSummary] = useState<UsageSummary | null>(null);
  const [logs, setLogs] = useState<TokenLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsage = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/usage');
      const data = await res.json();
      if (res.ok) {
        setSummary(data.summary);
        setLogs(data.recentLogs || []);
      }
    } catch (err) {
      console.error('Error fetching usage stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsage();
  }, []);

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
        maxWidth: '820px',
        width: '100%',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'rgba(201, 164, 92, 0.15)',
              border: '1px solid rgba(201, 164, 92, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--gold-primary)',
            }}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#FFF' }}>
                Admin Cost & Token Usage Guardrails
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Real-time API spend accounting & 24h cache efficiency
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={fetchUsage}
              className="btn-secondary"
              style={{ padding: '6px 12px', fontSize: '12px' }}
              title="Refresh Stats"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
            <button
              onClick={onClose}
              style={{ background: 'transparent', color: 'var(--text-muted)', padding: '4px' }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          {/* Top KPI row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '14px',
            marginBottom: '24px',
          }}>
            <div className="glass-panel-subtle" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--gold-primary)', marginBottom: '8px' }}>
                <DollarSign size={16} />
                <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>Total Estimated Spend</span>
              </div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: '#FFF' }}>
                ${summary ? summary.totalCost.toFixed(4) : '0.0000'}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>
                Strict cost control with gpt-4o-mini & free Gemini
              </div>
            </div>

            <div className="glass-panel-subtle" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#60A5FA', marginBottom: '8px' }}>
                <Cpu size={16} />
                <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>Total Tokens Tracked</span>
              </div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: '#FFF' }}>
                {summary ? summary.totalTokens.toLocaleString() : '0'}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>
                Across prompt & completion calls
              </div>
            </div>

            <div className="glass-panel-subtle" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#34D399', marginBottom: '8px' }}>
                <Clock size={16} />
                <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>24h Cache Engine</span>
              </div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: '#34D399' }}>
                Active (24h TTL)
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>
                Prevents duplicate API calls within 24 hours
              </div>
            </div>
          </div>

          {/* Provider breakdown */}
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#FFF', marginBottom: '12px' }}>
              Provider Breakdown & Pricing Model
            </h4>
            <div style={{
              background: 'rgba(8, 25, 46, 0.6)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              overflow: 'hidden',
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid var(--border-subtle)' }}>
                    <th style={{ padding: '10px 14px', color: 'var(--text-muted)' }}>Provider / Model</th>
                    <th style={{ padding: '10px 14px', color: 'var(--text-muted)' }}>Pricing Rate</th>
                    <th style={{ padding: '10px 14px', color: 'var(--text-muted)' }}>Checks Run</th>
                    <th style={{ padding: '10px 14px', color: 'var(--text-muted)' }}>Tokens</th>
                    <th style={{ padding: '10px 14px', color: 'var(--text-muted)' }}>Cost ($)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '10px 14px', fontWeight: 600 }}>OpenAI (gpt-4o-mini)</td>
                    <td style={{ padding: '10px 14px', color: 'var(--gold-primary)' }}>$0.15/1M in &bull; $0.60/1M out</td>
                    <td style={{ padding: '10px 14px' }}>{summary?.providerUsage?.openai?.checks || 0}</td>
                    <td style={{ padding: '10px 14px' }}>{summary?.providerUsage?.openai?.tokens?.toLocaleString() || 0}</td>
                    <td style={{ padding: '10px 14px', fontWeight: 600 }}>${(summary?.providerUsage?.openai?.cost || 0).toFixed(6)}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '10px 14px', fontWeight: 600 }}>Google Gemini (1.5 Flash)</td>
                    <td style={{ padding: '10px 14px', color: '#34D399' }}>Free Tier ($0.00)</td>
                    <td style={{ padding: '10px 14px' }}>{summary?.providerUsage?.gemini?.checks || 0}</td>
                    <td style={{ padding: '10px 14px' }}>{summary?.providerUsage?.gemini?.tokens?.toLocaleString() || 0}</td>
                    <td style={{ padding: '10px 14px', color: '#34D399', fontWeight: 600 }}>$0.000000</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px 14px', fontWeight: 600 }}>Perplexity (Sonar)</td>
                    <td style={{ padding: '10px 14px', color: 'var(--text-muted)' }}>~$0.005/req (Key optional)</td>
                    <td style={{ padding: '10px 14px' }}>{summary?.providerUsage?.perplexity?.checks || 0}</td>
                    <td style={{ padding: '10px 14px' }}>{summary?.providerUsage?.perplexity?.tokens?.toLocaleString() || 0}</td>
                    <td style={{ padding: '10px 14px', fontWeight: 600 }}>${(summary?.providerUsage?.perplexity?.cost || 0).toFixed(6)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Token Logs */}
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#FFF', marginBottom: '12px' }}>
              Recent Check Token Logs
            </h4>
            <div style={{
              background: 'rgba(8, 25, 46, 0.6)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              maxHeight: '220px',
              overflowY: 'auto',
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid var(--border-subtle)' }}>
                    <th style={{ padding: '8px 12px', color: 'var(--text-muted)' }}>Timestamp</th>
                    <th style={{ padding: '8px 12px', color: 'var(--text-muted)' }}>Brand</th>
                    <th style={{ padding: '8px 12px', color: 'var(--text-muted)' }}>Provider</th>
                    <th style={{ padding: '8px 12px', color: 'var(--text-muted)' }}>Prompt Tokens</th>
                    <th style={{ padding: '8px 12px', color: 'var(--text-muted)' }}>Completion</th>
                    <th style={{ padding: '8px 12px', color: 'var(--text-muted)' }}>Total</th>
                    <th style={{ padding: '8px 12px', color: 'var(--text-muted)' }}>Cost ($)</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.length > 0 ? (
                    logs.map((log) => (
                      <tr key={log.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                        <td style={{ padding: '8px 12px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                          {new Date(log.created_at).toLocaleTimeString()}
                        </td>
                        <td style={{ padding: '8px 12px', fontWeight: 600 }}>{log.brand_name || 'Brand'}</td>
                        <td style={{ padding: '8px 12px' }}>
                          <span className={log.provider === 'openai' ? 'badge-amber' : log.provider === 'gemini' ? 'badge-blue' : 'badge-purple'}>
                            {log.provider}
                          </span>
                        </td>
                        <td style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)' }}>{log.prompt_tokens}</td>
                        <td style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)' }}>{log.completion_tokens}</td>
                        <td style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{log.total_tokens}</td>
                        <td style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)', color: 'var(--gold-primary)' }}>
                          ${log.estimated_cost.toFixed(6)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No check logs recorded yet. Run a check to view real-time token tracking.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
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

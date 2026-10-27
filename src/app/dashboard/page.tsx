'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import TrendChart from '@/components/TrendChart';
import AddBrandModal from '@/components/AddBrandModal';
import AddPromptModal from '@/components/AddPromptModal';
import WeeklyReportModal from '@/components/WeeklyReportModal';
import AdminGuardrailsModal from '@/components/AdminGuardrailsModal';
import LicenseModal from '@/components/LicenseModal';
import { useAuth } from '@/context/AuthContext';
import {
  Building2,
  Plus,
  Play,
  RotateCw,
  Mail,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ChevronDown,
  Trash2,
  Search,
  Sparkles,
  Zap,
  TrendingUp,
  Cpu,
  Clock,
  Layers,
  ArrowUpRight,
  ArrowRight,
  Key,
  LogIn,
} from 'lucide-react';
import { Brand, PromptItem, CheckResult, BrandStats, UserProfile, AIProvider } from '@/types';

export default function DashboardPage() {
  const { user, profile: authProfile, authFetch, openAuthModal, linkLicenseKey } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrandId, setSelectedBrandId] = useState<string>('');
  const [prompts, setPrompts] = useState<PromptItem[]>([]);
  const [checks, setChecks] = useState<CheckResult[]>([]);
  const [stats, setStats] = useState<BrandStats | null>(null);

  const [loading, setLoading] = useState(true);
  const [runningCheck, setRunningCheck] = useState(false);
  const [forceRefresh, setForceRefresh] = useState(false);
  const [selectedProviderFilter, setSelectedProviderFilter] = useState<'all' | AIProvider>('all');

  // Modals state
  const [showAddBrand, setShowAddBrand] = useState(false);
  const [showAddPrompt, setShowAddPrompt] = useState(false);
  const [showWeeklyReport, setShowWeeklyReport] = useState(false);
  const [showGuardrails, setShowGuardrails] = useState(false);
  const [showLicenseModal, setShowLicenseModal] = useState(false);

  // Unlinked Key state (if user has active key in browser but account is on free tier)
  const [unlinkedKey, setUnlinkedKey] = useState<string | null>(null);
  const [linkingKey, setLinkingKey] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedKey = localStorage.getItem('brandsight_license_key');
      const activeTier = authProfile?.plan_tier || profile?.plan_tier || 'free';
      if (storedKey && user && activeTier === 'free') {
        setUnlinkedKey(storedKey);
      } else {
        setUnlinkedKey(null);
      }
    }
  }, [user, authProfile, profile]);

  const handleLinkDetectedKey = async () => {
    if (!unlinkedKey) return;
    setLinkingKey(true);
    const res = await linkLicenseKey(unlinkedKey);
    setLinkingKey(false);
    if (res.success) {
      setUnlinkedKey(null);
      await loadBrandsAndProfile();
    } else {
      alert(res.error || 'Failed to link license key');
    }
  };

  // Fetch initial profile & brands
  const loadBrandsAndProfile = async () => {
    try {
      const res = await authFetch('/api/brands');
      const data = await res.json();
      if (res.ok) {
        const brandList: Brand[] = data.brands || [];
        setBrands(brandList);
        setProfile(data.profile || authProfile || null);

        if (brandList.length > 0) {
          // If previous selection is still in list, keep it; otherwise select first
          setSelectedBrandId((prev) =>
            brandList.some((b) => b.id === prev) ? prev : brandList[0].id
          );
        } else {
          setSelectedBrandId('');
          setPrompts([]);
          setChecks([]);
          setStats(null);
        }
      }
    } catch (err) {
      console.error('Error loading initial data:', err);
    }
  };

  // Fetch brand specific data (prompts, checks, stats)
  const loadBrandDetails = async (brandId: string) => {
    if (!brandId) return;
    setLoading(true);
    try {
      const res = await authFetch(`/api/brands/${brandId}`);
      const data = await res.json();
      if (res.ok) {
        setPrompts(data.prompts || []);
        setChecks(data.checks || []);
        setStats(data.stats || null);
      }
    } catch (err) {
      console.error('Error fetching brand details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBrandsAndProfile();
  }, [user]);

  useEffect(() => {
    if (selectedBrandId) {
      loadBrandDetails(selectedBrandId);
    }
  }, [selectedBrandId]);

  const selectedBrand = brands.find((b) => b.id === selectedBrandId) || brands[0];

  // Open Add Brand Modal (guarded by login)
  const handleOpenAddBrand = () => {
    if (!user) {
      openAuthModal('signup', 'Create a free account or sign in to add and track your brand.');
      return;
    }
    setShowAddBrand(true);
  };

  // Open Add Prompt Modal (guarded by login)
  const handleOpenAddPrompt = () => {
    if (!user) {
      openAuthModal('signup', 'Create a free account or sign in to add custom search queries.');
      return;
    }
    setShowAddPrompt(true);
  };

  // Execute manual AI check (guarded by login)
  const handleRunChecks = async (promptId?: string) => {
    if (!user) {
      openAuthModal('signup', 'Create a free account or sign in to run live AI visibility checks.');
      return;
    }
    if (!selectedBrand) return;
    setRunningCheck(true);

    try {
      const res = await authFetch('/api/checks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand_id: selectedBrand.id,
          prompt_id: promptId,
          force_refresh: forceRefresh,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        // Refresh brand details
        await loadBrandDetails(selectedBrand.id);
      } else {
        alert(data.error || 'Failed to complete check');
      }
    } catch (err) {
      console.error('Error running check:', err);
      alert('Network error executing AI check');
    } finally {
      setRunningCheck(false);
    }
  };

  // Delete Prompt
  const handleDeletePrompt = async (promptId: string) => {
    if (!user) {
      openAuthModal('login', 'Please sign in to manage prompts.');
      return;
    }
    if (!confirm('Are you sure you want to remove this query from tracking?')) return;
    try {
      const res = await authFetch(`/api/prompts?id=${promptId}`, { method: 'DELETE' });
      if (res.ok && selectedBrand) {
        loadBrandDetails(selectedBrand.id);
      }
    } catch (err) {
      console.error('Error deleting prompt:', err);
    }
  };

  // Filter checks by provider
  const filteredChecks = checks.filter((c) => {
    if (selectedProviderFilter === 'all') return true;
    return c.provider === selectedProviderFilter;
  });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main style={{ maxWidth: '1240px', width: '100%', margin: '0 auto', padding: '32px 24px', flex: 1 }}>
        {/* GUEST DEMO MODE BANNER */}
        {!user && (
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(8, 25, 46, 0.95) 0%, rgba(13, 34, 59, 0.95) 100%)',
              border: '1px solid rgba(201, 164, 92, 0.35)',
              borderRadius: '12px',
              padding: '16px 20px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              flexWrap: 'wrap',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '8px',
                  background: 'rgba(201, 164, 92, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--gold-primary)',
                  flexShrink: 0,
                }}
              >
                <Sparkles size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '14px', color: '#FFF' }}>
                  Previewing BrandSight AI in Guest Demo Mode
                </div>
                <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                  You are exploring sample data. Sign in or create a free account to track your own brands and run live AI search audits.
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                onClick={() => openAuthModal('login')}
                className="btn-secondary"
                style={{ fontSize: '12.5px', padding: '7px 14px' }}
              >
                <LogIn size={14} />
                <span>Sign In</span>
              </button>
              <button
                onClick={() => openAuthModal('signup', 'Create a free account to track your brand.')}
                className="btn-gold"
                style={{ fontSize: '12.5px', padding: '7px 16px' }}
              >
                <span>Create Free Account</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* UNLINKED LICENSE KEY BANNER */}
        {user && unlinkedKey && (
          <div
            style={{
              background: 'rgba(201, 164, 92, 0.15)',
              border: '1px solid rgba(201, 164, 92, 0.45)',
              borderRadius: '10px',
              padding: '14px 18px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '14px',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Key size={18} style={{ color: 'var(--gold-primary)' }} />
              <div style={{ fontSize: '13px', color: '#FFF' }}>
                Active license key found on this browser (<strong>{unlinkedKey.slice(0, 8)}...</strong>). Link it now to activate Pro on your account across all devices.
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={handleLinkDetectedKey}
                disabled={linkingKey}
                className="btn-gold"
                style={{ fontSize: '12px', padding: '6px 14px' }}
              >
                {linkingKey ? 'Linking...' : 'Link to My Account'}
              </button>
              <button
                onClick={() => {
                  try {
                    localStorage.removeItem('brandsight_license_key');
                  } catch {
                    // ignore
                  }
                  setUnlinkedKey(null);
                }}
                className="btn-secondary"
                style={{ fontSize: '12px', padding: '6px 10px' }}
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* TOP DASHBOARD CONTROL BAR */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '28px',
        }}>
          {/* Brand Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {brands.length > 0 ? (
                  <select
                    value={selectedBrandId}
                    onChange={(e) => setSelectedBrandId(e.target.value)}
                    style={{
                      background: '#0D223B',
                      color: '#FFF',
                      fontWeight: 700,
                      fontSize: '18px',
                      border: '1px solid var(--border-medium)',
                      borderRadius: '8px',
                      padding: '6px 12px',
                      cursor: 'pointer',
                    }}
                  >
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.website_url.replace(/^https?:\/\//i, '').split('/')[0]})
                      </option>
                    ))}
                  </select>
                ) : (
                  <span style={{ fontSize: '18px', fontWeight: 700, color: '#FFF' }}>
                    No Brand Added
                  </span>
                )}

                <button
                  onClick={handleOpenAddBrand}
                  className="btn-secondary"
                  style={{ padding: '6px 10px', fontSize: '12px' }}
                  title="Add Another Brand"
                >
                  <Plus size={14} />
                  <span>Add Brand</span>
                </button>
              </div>

              <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '4px' }}>
                Frequency: <strong>{selectedBrand?.check_frequency?.toUpperCase() || 'WEEKLY'}</strong> &bull;{' '}
                Last checked: {selectedBrand?.last_checked_at ? new Date(selectedBrand.last_checked_at).toLocaleString() : 'Not checked yet'}
              </div>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Force refresh toggle */}
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              color: forceRefresh ? 'var(--gold-primary)' : 'var(--text-muted)',
              cursor: 'pointer',
              background: 'rgba(255, 255, 255, 0.03)',
              padding: '6px 10px',
              borderRadius: '6px',
              border: '1px solid var(--border-subtle)',
            }}>
              <input
                type="checkbox"
                checked={forceRefresh}
                onChange={(e) => setForceRefresh(e.target.checked)}
              />
              <span>Force Re-check (Bypass 24h Cache)</span>
            </label>

            {/* Run check now */}
            <button
              onClick={() => handleRunChecks()}
              disabled={runningCheck || !selectedBrand}
              className="btn-gold"
              style={{ fontSize: '13px', padding: '8px 16px' }}
            >
              <Play size={14} className={runningCheck ? 'animate-spin' : ''} />
              <span>{runningCheck ? 'Running Checks...' : 'Run Check Now'}</span>
            </button>

            {/* Weekly Email Report */}
            {selectedBrand && stats && (
              <button
                onClick={() => setShowWeeklyReport(true)}
                className="btn-secondary"
                style={{ fontSize: '13px', padding: '8px 14px' }}
              >
                <Mail size={14} style={{ color: 'var(--gold-primary)' }} />
                <span>Weekly Report</span>
              </button>
            )}

            {/* Admin Cost Guardrails */}
            <button
              onClick={() => setShowGuardrails(true)}
              className="btn-secondary"
              style={{ fontSize: '13px', padding: '8px 14px' }}
              title="View API Token and Cost Logs"
            >
              <ShieldCheck size={14} style={{ color: '#34D399' }} />
              <span>Cost Guardrails</span>
            </button>

            {/* Plan Tier Badge */}
            <button
              onClick={() => setShowLicenseModal(true)}
              className="badge-gold"
              style={{ padding: '6px 12px', cursor: 'pointer', fontSize: '12px' }}
              title="Click to activate Lemon Squeezy license"
            >
              <span>PLAN: {profile?.plan_tier?.toUpperCase() || 'FREE'}</span>
            </button>
          </div>
        </div>

        {/* METRIC KPI CARDS */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px',
          marginBottom: '28px',
        }}>
          {/* Card 1: Mention Rate */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                AI Mention Rate
              </span>
              <span className="badge-green">▲ +8% W/W</span>
            </div>
            <div style={{ fontSize: '36px', fontWeight: 800, color: 'var(--gold-primary)' }}>
              {stats ? `${stats.mentionRate}%` : '0%'}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '4px' }}>
              Brand present in {stats?.totalMentions || 0} of {stats?.totalChecks || 0} checks
            </div>
          </div>

          {/* Card 2: Average Position */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Average List Rank
              </span>
              <span className="badge-gold">Top Recommended</span>
            </div>
            <div style={{ fontSize: '36px', fontWeight: 800, color: '#FFF' }}>
              #{stats && stats.avgPosition > 0 ? stats.avgPosition : '1.0'}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '4px' }}>
              Position among recommended solutions
            </div>
          </div>

          {/* Card 3: Cited Sources */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Citing Domains
              </span>
              <span className="badge-blue">GEO Citations</span>
            </div>
            <div style={{ fontSize: '36px', fontWeight: 800, color: '#FFF' }}>
              {stats ? stats.citedSourcesCount : 0}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '4px' }}>
              Distinct authority URLs cited in AI answers
            </div>
          </div>

          {/* Card 4: Prompts Monitored */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Tracked Queries
              </span>
              <span className="badge-purple">Capacity: {profile?.prompts_limit || 5}</span>
            </div>
            <div style={{ fontSize: '36px', fontWeight: 800, color: '#FFF' }}>
              {prompts.length} <span style={{ fontSize: '18px', color: 'var(--text-dim)' }}>/ {profile?.prompts_limit || 5}</span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '4px' }}>
              Commercial intent prompts active
            </div>
          </div>
        </div>

        {/* TREND CHART & ENGINE BREAKDOWN SECTION */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '24px',
          marginBottom: '32px',
        }}>
          {/* Trend Chart Panel */}
          <div className="glass-panel" style={{ padding: '24px', gridColumn: 'span 2' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
            }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#FFF' }}>
                  Visibility History & Mention Trend
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Percentage of AI responses featuring {selectedBrand?.name} over time
                </p>
              </div>
              <span style={{ fontSize: '12px', color: 'var(--gold-primary)', fontWeight: 600 }}>
                ● Mention Rate % &bull; 7-Day Trend
              </span>
            </div>

            <TrendChart data={stats?.trendHistory || []} />
          </div>

          {/* AI Providers Breakdown */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#FFF', marginBottom: '16px' }}>
              AI Engine Comparison
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* OpenAI */}
              <div style={{
                background: 'rgba(8, 25, 46, 0.7)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '12px 14px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#FFF' }}>ChatGPT (gpt-4o-mini)</span>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--gold-primary)' }}>
                    {stats?.providerBreakdown.openai.rate || 0}%
                  </span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${stats?.providerBreakdown.openai.rate || 0}%`, height: '100%', background: 'var(--gold-primary)' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>
                  <span>{stats?.providerBreakdown.openai.mentions || 0} mentions</span>
                  <span>{stats?.providerBreakdown.openai.total || 0} checks</span>
                </div>
              </div>

              {/* Gemini */}
              <div style={{
                background: 'rgba(8, 25, 46, 0.7)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '12px 14px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#FFF' }}>Google Gemini (1.5 Flash)</span>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#38BDF8' }}>
                    {stats?.providerBreakdown.gemini.rate || 0}%
                  </span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${stats?.providerBreakdown.gemini.rate || 0}%`, height: '100%', background: '#38BDF8' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>
                  <span>{stats?.providerBreakdown.gemini.mentions || 0} mentions</span>
                  <span>Free Tier Active</span>
                </div>
              </div>

              {/* Perplexity */}
              <div style={{
                background: 'rgba(8, 25, 46, 0.7)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '12px 14px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#FFF' }}>Perplexity AI (Sonar)</span>
                  <span className="badge-purple">Coming Soon / Key Optional</span>
                </div>
                <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Add <code>PERPLEXITY_API_KEY</code> in <code>.env.local</code> to activate live Sonar search.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* PROMPT SET MANAGER SECTION */}
        <div className="glass-panel" style={{ padding: '24px', marginBottom: '32px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            marginBottom: '18px',
          }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#FFF' }}>
                Monitored Prompts for {selectedBrand?.name}
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Questions and comparison queries evaluated across AI engines
              </p>
            </div>

            <button
              onClick={handleOpenAddPrompt}
              className="btn-gold"
              style={{ fontSize: '13px', padding: '8px 14px' }}
            >
              <Plus size={14} />
              <span>Add Query Prompt</span>
            </button>
          </div>

          {/* Prompts list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {prompts.length > 0 ? (
              prompts.map((p) => {
                // Find most recent check for this prompt
                const lastCheck = checks.find((c) => c.prompt_id === p.id);
                return (
                  <div
                    key={p.id}
                    style={{
                      background: 'rgba(8, 25, 46, 0.6)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '8px',
                      padding: '14px 18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '12px',
                    }}
                  >
                    <div style={{ flex: 1, minWidth: '260px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span className="badge-gold">{p.category || 'General'}</span>
                        <strong style={{ fontSize: '14px', color: '#FFF' }}>
                          &ldquo;{p.query_text}&rdquo;
                        </strong>
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
                        Status:{' '}
                        {lastCheck ? (
                          lastCheck.brand_mentioned ? (
                            <span style={{ color: '#34D399', fontWeight: 600 }}>
                              Mentioned (Rank #{lastCheck.mention_position || 1}) via {lastCheck.provider}
                            </span>
                          ) : (
                            <span style={{ color: '#F87171' }}>Missing in last check ({lastCheck.provider})</span>
                          )
                        ) : (
                          <span>Pending first run</span>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        onClick={() => handleRunChecks(p.id)}
                        disabled={runningCheck}
                        className="btn-secondary"
                        style={{ fontSize: '12px', padding: '6px 10px' }}
                        title="Run check on this specific prompt"
                      >
                        <Play size={12} />
                        <span>Check Prompt</span>
                      </button>

                      <button
                        onClick={() => handleDeletePrompt(p.id)}
                        style={{
                          background: 'transparent',
                          color: 'var(--text-dim)',
                          padding: '6px',
                          borderRadius: '4px',
                        }}
                        title="Delete Prompt"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                <p style={{ marginBottom: '12px' }}>No search queries added yet for this brand.</p>
                <button onClick={() => setShowAddPrompt(true)} className="btn-gold" style={{ fontSize: '13px' }}>
                  <Plus size={14} />
                  <span>Add First Query</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* CHECKS HISTORY AUDIT TABLE */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            marginBottom: '18px',
          }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#FFF' }}>
                AI Check Audit Log
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Detailed responses, ranking positions, competitor mentions, and citations
              </p>
            </div>

            {/* Provider Filter Tabs */}
            <div style={{ display: 'flex', gap: '6px' }}>
              {(['all', 'openai', 'gemini', 'perplexity'] as const).map((prov) => (
                <button
                  key={prov}
                  onClick={() => setSelectedProviderFilter(prov)}
                  style={{
                    background: selectedProviderFilter === prov ? 'rgba(201, 164, 92, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                    color: selectedProviderFilter === prov ? 'var(--gold-primary)' : 'var(--text-muted)',
                    border: selectedProviderFilter === prov ? '1px solid var(--gold-primary)' : '1px solid var(--border-subtle)',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                  }}
                >
                  {prov}
                </button>
              ))}
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid var(--border-subtle)' }}>
                  <th style={{ padding: '12px', color: 'var(--text-muted)' }}>Timestamp</th>
                  <th style={{ padding: '12px', color: 'var(--text-muted)' }}>Engine</th>
                  <th style={{ padding: '12px', color: 'var(--text-muted)' }}>Query</th>
                  <th style={{ padding: '12px', color: 'var(--text-muted)' }}>Mention Rank</th>
                  <th style={{ padding: '12px', color: 'var(--text-muted)' }}>Competitors Detected</th>
                  <th style={{ padding: '12px', color: 'var(--text-muted)' }}>Cited Sources</th>
                  <th style={{ padding: '12px', color: 'var(--text-muted)' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredChecks.length > 0 ? (
                  filteredChecks.map((c) => (
                    <tr key={c.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                      <td style={{ padding: '12px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', fontSize: '11px', whiteSpace: 'nowrap' }}>
                        {new Date(c.checked_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span className={c.provider === 'openai' ? 'badge-amber' : c.provider === 'gemini' ? 'badge-blue' : 'badge-purple'}>
                          {c.provider}
                        </span>
                      </td>
                      <td style={{ padding: '12px', maxWidth: '240px', color: '#FFF' }}>
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {c.prompt_text || 'Search Query'}
                        </div>
                        {c.mention_snippet && (
                          <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontStyle: 'italic', marginTop: '2px' }}>
                            {c.mention_snippet.slice(0, 90)}...
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '12px' }}>
                        {c.brand_mentioned ? (
                          <span className="badge-green">
                            <CheckCircle2 size={12} style={{ display: 'inline', marginRight: '4px' }} />
                            Rank #{c.mention_position || 1}
                          </span>
                        ) : (
                          <span style={{
                            background: 'rgba(239, 68, 68, 0.15)',
                            color: '#F87171',
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: '999px',
                          }}>
                            <XCircle size={12} style={{ display: 'inline', marginRight: '4px' }} />
                            Not Mentioned
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {c.competitors_mentioned && c.competitors_mentioned.length > 0 ? (
                            c.competitors_mentioned.map((comp) => (
                              <span key={comp} style={{ fontSize: '11px', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px' }}>
                                {comp}
                              </span>
                            ))
                          ) : (
                            <span style={{ color: 'var(--text-dim)', fontSize: '11px' }}>None</span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {c.cited_sources && c.cited_sources.length > 0 ? (
                            c.cited_sources.slice(0, 2).map((url) => (
                              <a
                                key={url}
                                href={url}
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                  fontSize: '11px',
                                  color: 'var(--gold-primary)',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '3px',
                                }}
                              >
                                <ExternalLink size={10} />
                                {url.replace(/^https?:\/\//i, '').split('/')[0]}
                              </a>
                            ))
                          ) : (
                            <span style={{ color: 'var(--text-dim)', fontSize: '11px' }}>No URLs</span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '12px' }}>
                        {c.is_cached ? (
                          <span className="badge-blue" title="Served from 24h cache (0 cost)">
                            24h Cached
                          </span>
                        ) : (
                          <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                            ${c.estimated_cost?.toFixed(5) || '0.00000'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No checks recorded yet for this provider. Click &ldquo;Run Check Now&rdquo; above.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* MODALS */}
      {showAddBrand && (
        <AddBrandModal
          planTier={profile?.plan_tier || 'free'}
          onClose={() => setShowAddBrand(false)}
          onSuccess={() => loadBrandsAndProfile()}
        />
      )}

      {showAddPrompt && selectedBrand && (
        <AddPromptModal
          brand={selectedBrand}
          onClose={() => setShowAddPrompt(false)}
          onSuccess={() => loadBrandDetails(selectedBrand.id)}
        />
      )}

      {showWeeklyReport && selectedBrand && stats && (
        <WeeklyReportModal
          brand={selectedBrand}
          stats={stats}
          onClose={() => setShowWeeklyReport(false)}
        />
      )}

      {showGuardrails && (
        <AdminGuardrailsModal onClose={() => setShowGuardrails(false)} />
      )}

      {showLicenseModal && (
        <LicenseModal
          onClose={() => setShowLicenseModal(false)}
          onSuccess={() => loadBrandsAndProfile()}
        />
      )}
    </div>
  );
}

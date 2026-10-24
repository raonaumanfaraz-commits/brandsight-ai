import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import { getAllPosts } from '@/lib/blog';
import { Sparkles, Calendar, ArrowRight, BookOpen } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Blog — Generative Engine Optimization (GEO) & AI Search Insights | BrandSight AI',
  description:
    'Guides, research, and strategies on Generative Engine Optimization (GEO), AI search visibility, and tracking brand recommendations across ChatGPT, Gemini, and Perplexity.',
  alternates: {
    canonical: 'https://brandsight-ai.coderao.com/blog',
  },
};

export default function BlogIndexPage() {
  const posts = getAllPosts();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main style={{ maxWidth: '1100px', width: '100%', margin: '0 auto', padding: '60px 24px 80px', flex: 1 }}>
        {/* Header Header */}
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <span className="badge-gold">
              <Sparkles size={12} />
              GEO & AI Search Intelligence
            </span>
          </div>

          <h1 style={{
            fontSize: 'clamp(32px, 4.5vw, 48px)',
            fontWeight: 800,
            lineHeight: 1.2,
            letterSpacing: '-0.5px',
            color: '#FFF',
            marginBottom: '16px',
          }}>
            BrandSight AI <span className="gold-text-gradient">Blog & Insights</span>
          </h1>

          <p style={{
            fontSize: '16px',
            color: 'var(--text-muted)',
            maxWidth: '680px',
            margin: '0 auto',
            lineHeight: 1.6,
          }}>
            The definitive resource for Generative Engine Optimization (GEO), AI search ranking dynamics,
            and brand citation strategies for the post-traditional SEO era.
          </p>
        </div>

        {/* Posts Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px',
          marginBottom: '60px',
        }}>
          {posts.map((post) => (
            <article
              key={post.slug}
              className="glass-panel"
              style={{
                padding: '32px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 0.2s ease, border-color 0.2s ease',
              }}
            >
              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '12px',
                  color: 'var(--gold-primary)',
                  marginBottom: '12px',
                  fontFamily: 'var(--font-mono)',
                }}>
                  <Calendar size={13} />
                  <time dateTime={post.date}>
                    {new Date(post.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </time>
                </div>

                <h2 style={{
                  fontSize: '20px',
                  fontWeight: 700,
                  lineHeight: 1.35,
                  color: '#FFF',
                  marginBottom: '12px',
                }}>
                  <Link
                    href={`/blog/${post.slug}`}
                    style={{ color: '#FFF', transition: 'color 0.15s ease' }}
                  >
                    {post.title}
                  </Link>
                </h2>

                <p style={{
                  fontSize: '14px',
                  color: 'var(--text-muted)',
                  lineHeight: 1.6,
                  marginBottom: '24px',
                }}>
                  {post.excerpt}
                </p>
              </div>

              <div>
                <Link
                  href={`/blog/${post.slug}`}
                  className="btn-outline-gold"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <span>Read Article</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </article>
          ))}
        </div>

        {/* Bottom CTA Block */}
        <div className="glass-panel" style={{
          padding: '40px',
          textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(14, 34, 56, 0.95) 0%, rgba(8, 25, 46, 0.98) 100%)',
          border: '1px solid rgba(201, 164, 92, 0.4)',
        }}>
          <h3 style={{ fontSize: '24px', fontWeight: 800, color: '#FFF', marginBottom: '10px' }}>
            Is ChatGPT Recommending Your Brand?
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto 24px' }}>
            Track your mention rate, recommendation rankings, and cited sources across OpenAI, Google Gemini, and Perplexity in real-time.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <Link href="/dashboard" className="btn-gold" style={{ fontSize: '14px', padding: '12px 24px' }}>
              <span>Launch Free Brand Setup</span>
              <ArrowRight size={15} />
            </Link>
            <Link href="/#pricing" className="btn-secondary" style={{ fontSize: '14px', padding: '12px 20px' }}>
              <span>View Pricing Plans</span>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid rgba(201, 164, 92, 0.2)',
        background: '#040E1B',
        padding: '40px 24px',
      }}>
        <div style={{
          maxWidth: '1100px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <strong style={{ fontSize: '16px', color: '#FFF' }}>BrandSight AI</strong>
              <span className="badge-gold">CodeRao</span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-dim)' }}>
              Generative Engine Optimization (GEO) Tracker &bull; https://brandsight-ai.coderao.com
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', fontSize: '13px', color: 'var(--text-muted)' }}>
            <Link href="/">Home</Link>
            <Link href="/blog">Blog</Link>
            <Link href="/#pricing">Pricing</Link>
            <Link href="/dashboard">Dashboard</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

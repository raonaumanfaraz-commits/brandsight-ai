import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import { getPostBySlug, getAllPostSlugs } from '@/lib/blog';
import { Calendar, ArrowLeft, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  const slugs = getAllPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    return {
      title: 'Article Not Found | BrandSight AI',
    };
  }

  const canonicalUrl = `https://brandsight-ai.coderao.com/blog/${params.slug}`;

  return {
    title: `${post.title} | BrandSight AI Blog`,
    description: post.excerpt,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${post.title} | BrandSight AI`,
      description: post.excerpt,
      url: canonicalUrl,
      type: 'article',
      publishedTime: post.date,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main style={{ maxWidth: '840px', width: '100%', margin: '0 auto', padding: '40px 24px 80px', flex: 1 }}>
        {/* Breadcrumb / Back Link */}
        <div style={{ marginBottom: '28px' }}>
          <Link
            href="/blog"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              color: 'var(--gold-primary)',
              fontWeight: 600,
            }}
          >
            <ArrowLeft size={14} />
            <span>Back to All Articles</span>
          </Link>
        </div>

        {/* Article Header */}
        <header style={{ marginBottom: '36px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '24px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            color: 'var(--gold-primary)',
            marginBottom: '14px',
            fontFamily: 'var(--font-mono)',
          }}>
            <Calendar size={14} />
            <time dateTime={post.date}>
              {new Date(post.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
            <span>&bull;</span>
            <span>By BrandSight AI Research</span>
          </div>

          <h1 style={{
            fontSize: 'clamp(28px, 4vw, 42px)',
            fontWeight: 800,
            lineHeight: 1.25,
            letterSpacing: '-0.5px',
            color: '#FFF',
            marginBottom: '16px',
          }}>
            {post.title}
          </h1>

          <p style={{
            fontSize: '17px',
            color: 'var(--text-muted)',
            lineHeight: 1.6,
          }}>
            {post.excerpt}
          </p>
        </header>

        {/* Article HTML Body */}
        <div
          className="blog-prose"
          dangerouslySetInnerHTML={{ __html: post.contentHtml }}
        />

        {/* Closing CTA Block */}
        <div
          className="glass-panel"
          style={{
            marginTop: '60px',
            padding: '36px',
            background: 'linear-gradient(135deg, rgba(14, 34, 56, 0.95) 0%, rgba(8, 25, 46, 0.98) 100%)',
            border: '1px solid rgba(201, 164, 92, 0.4)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <Sparkles size={18} style={{ color: 'var(--gold-primary)' }} />
            <span className="badge-gold">Audit Your Brand</span>
          </div>

          <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#FFF', marginBottom: '8px' }}>
            Track Your Brand in ChatGPT, Gemini & Perplexity
          </h3>

          <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '20px' }}>
            BrandSight AI automatically tracks your mention rate %, list ranking position, and cited reference sources across top AI engines with strict cost guardrails.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '10px',
            marginBottom: '24px',
            fontSize: '13px',
            color: '#CBD5E1',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={15} style={{ color: '#10B981' }} />
              <span><strong>Free Plan:</strong> 1 Brand, 5 Prompts</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={15} style={{ color: 'var(--gold-primary)' }} />
              <span><strong>Pro ($19/mo):</strong> 5 Brands, Daily checks</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={15} style={{ color: '#C084FC' }} />
              <span><strong>Agency ($49/mo):</strong> 20 Brands + Reports</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link
              href="https://brandsight-ai.coderao.com"
              className="btn-gold"
              style={{ fontSize: '14px', padding: '12px 22px' }}
            >
              <span>Get Started Free on BrandSight AI</span>
              <ArrowRight size={15} />
            </Link>

            <Link
              href="https://brandsight-ai.coderao.com/#pricing"
              className="btn-secondary"
              style={{ fontSize: '14px', padding: '12px 18px' }}
            >
              <span>View Full Pricing</span>
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
          maxWidth: '840px',
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
              Generative Engine Optimization (GEO) &bull; https://brandsight-ai.coderao.com
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

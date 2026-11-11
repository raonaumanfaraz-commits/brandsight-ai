import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/react';
import { AuthProvider } from '@/context/AuthContext';
import AuthModal from '@/components/AuthModal';
import './globals.css';

export const metadata: Metadata = {
  title: 'BrandSight AI — Generative AI Search Visibility Tracker (GEO)',
  description:
    'Track your brand visibility, ranking position, and cited reference sources across ChatGPT, Google Gemini, and DeepSeek. Prevent losing search traffic to AI Overviews.',
  keywords: [
    'AI Search Visibility',
    'GEO Tracker',
    'Generative Engine Optimization',
    'ChatGPT Brand Tracker',
    'Google Gemini AI Overviews',
    'DeepSeek Brand Tracking',
  ],
  authors: [{ name: 'CodeRao' }],
};

/**
 * Apply the saved theme before first paint so the page never flashes
 * the wrong theme. Default is Premium Dark Mode.
 */
const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem('brandsight-theme')||'dark';var r=t==='system'?(window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'):t;document.documentElement.setAttribute('data-theme',r);}catch(e){document.documentElement.setAttribute('data-theme','dark');}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#0a0f1e" />
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body>
        <AuthProvider>
          {children}
          <AuthModal />
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}

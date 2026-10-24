import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BrandSight AI — Generative AI Search Visibility Tracker (GEO)',
  description:
    'Track your brand visibility, ranking position, and cited reference sources across ChatGPT, Google Gemini, and Perplexity. Prevent losing search traffic to AI Overviews.',
  keywords: [
    'AI Search Visibility',
    'GEO Tracker',
    'Generative Engine Optimization',
    'ChatGPT Brand Tracker',
    'Google Gemini AI Overviews',
    'Perplexity Citations',
  ],
  authors: [{ name: 'CodeRao' }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#08192E" />
      </head>
      <body>{children}</body>
    </html>
  );
}

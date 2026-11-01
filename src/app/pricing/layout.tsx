import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing | BrandSight AI',
  description:
    'BrandSight AI pricing: Free $0, Pro $19/month, Agency $49/month. Track your brand across ChatGPT, Google Gemini, and DeepSeek.',
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

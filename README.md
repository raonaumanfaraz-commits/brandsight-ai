# ⚡ BrandSight AI — Generative Engine Optimization (GEO) Tracker

> **AI Search Visibility Tracker**: Monitor your brand's presence, list rank position, and cited reference sources across **ChatGPT (OpenAI)**, **Google Gemini**, and **DeepSeek**.

---

## 🌟 Key Features

1. **Brand & Prompt Setup**:
   - Track brand name, website URL, industry, and known competitors.
   - Configure 5–10 high-intent search queries per brand (e.g. *"best video editing tool for YouTubers"*).
2. **Multi-Engine AI Checks**:
   - **OpenAI API** (`gpt-4o-mini`): Ultra cost-effective default model.
   - **Google Gemini API** (`gemini-1.5-flash`): Generous free tier integration with Google search grounding.
   - **DeepSeek API** (`deepseek-chat`): OpenAI-compatible, low cost. Same prompts, mention detection, 24h cache and token/cost logging. If `DEEPSEEK_API_KEY` is not set, it safely displays as *"Coming Soon"* without interrupting the other engines.
3. **Mention & Citation Detection**:
   - Detects whether the brand was mentioned (exact & domain matching).
   - Identifies recommendation ranking position (Rank #1, #2, etc.).
   - Extracts competitor tools mentioned in the answers.
   - Gathers all cited reference URLs and authority domains.
4. **Interactive Dashboard & Trend Charts**:
   - Historical mention rate percentage & average position over time.
   - Clean, lightweight SVG trend visualization with zero hydration errors.
   - Audit table logging every check with timestamps, responses, and token stats.
5. **Strict Cost Guardrails**:
   - **24-Hour Cache Layer**: Prompts run within 24 hours are served from cache at **$0.00** unless force-refreshed.
   - **Token Usage Accounting**: Every call logs prompt tokens, completion tokens, and exact cost in USD.
   - **Plan Frequency Control**: Free plan restricted to weekly checks; daily checks unlocked on Pro/Agency.
6. **Freemium & Lemon Squeezy Licensing**:
   - **Free Plan**: 1 Brand, 5 Prompts, Weekly Check.
   - **Pro Plan ($19/mo)**: 5 Brands, 50 Prompts, Daily Check.
   - **Agency Plan ($49/mo)**: 20 Brands, 200 Prompts, Daily Check + White-label Reports.
   - Lemon Squeezy license key verification with single-device activation limit (matching ViralSplice architecture).
   - Offline test keys available for immediate local QA (`TEST-PRO-DEMO-2026`, `TEST-AGENCY-DEMO-2026`).
7. **Weekly Executive Email Reports**:
   - Automated HTML email digest tracking week-over-week mention growth (▲ +8%).
   - Integrated with Resend API or previewable directly in the dashboard.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: Vanilla CSS Design System with CodeRao Navy (`#08192E`) and Gold (`#C9A45C`) branding
- **Database**: PostgreSQL (Supabase schema provided) + zero-setup local persistent fallback (`.data/store.json`)
- **AI Providers**: OpenAI (`gpt-4o-mini`), Google Gemini (`gemini-1.5-flash`), DeepSeek (`deepseek-chat`)
- **Payment & Licensing**: Lemon Squeezy API
- **Email**: Resend API / Responsive HTML templates

---

## 🚀 Quickstart (Local Development)

### 1. Clone & Install Dependencies

```bash
cd BrandSight
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Open `.env.local` and add your API keys:

```ini
# Base Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# AI Provider API Keys
OPENAI_API_KEY=sk-proj-your-openai-api-key
GEMINI_API_KEY=AIzaSy-your-google-gemini-key
DEEPSEEK_API_KEY=your-deepseek-key  # Server-side only. If omitted, UI shows "Coming soon"

# Supabase (Optional for local testing; app includes built-in persistent local fallback)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Lemon Squeezy
LEMONSQUEEZY_API_KEY=your-lemonsqueezy-api-key
LEMONSQUEEZY_STORE_ID=your-store-id
NEXT_PUBLIC_LEMON_PRO_CHECKOUT_URL=https://yourstore.lemonsqueezy.com/buy/pro-id
NEXT_PUBLIC_LEMON_AGENCY_CHECKOUT_URL=https://yourstore.lemonsqueezy.com/buy/agency-id

# Email Reports
RESEND_API_KEY=re_your-resend-key
REPORT_FROM_EMAIL=reports@brandsight.ai
```

> **Note on Zero-Friction Local Testing**: The app runs immediately without entering Supabase or Lemon Squeezy keys! It ships preloaded with realistic demo data in `.data/store.json` and supports instant license testing with `TEST-PRO-DEMO-2026`.

### 3. Run the Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the landing page and interactive scanner, or [http://localhost:3000/dashboard](http://localhost:3000/dashboard) to view the analytics tracker.

---

## 🗄️ Supabase Database Setup

When you are ready to connect a cloud Supabase project:

1. Create a new project in [Supabase Dashboard](https://supabase.com).
2. Go to the **SQL Editor** in your Supabase project.
3. Open `supabase/schema.sql` from this repository, paste the entire contents into the SQL Editor, and click **Run**.
4. The script creates:
   - `profiles` (Plan tiers, limits, license keys)
   - `brands` (User brands and frequency settings)
   - `prompts` (Queries tracked per brand)
   - `checks` (Check results, mentions, citations, token costs)
   - `token_logs` (Financial auditing)
   - `prompt_cache` (24-hour cache table)
   - `licenses` (Lemon Squeezy activations)
   - Complete Row Level Security (RLS) policies and performance indexes.
5. Copy your **Project URL** and **Anon Key** into `.env.local`.
6. **Existing databases**: run `supabase/migration_deepseek_provider.sql` once so the `checks.provider` constraint accepts `deepseek` (it also removes legacy rows of the retired provider).

---

## 🍋 Lemon Squeezy Product Configuration

To configure the freemium tiers with single-device license activations:

1. Log into your [Lemon Squeezy Dashboard](https://app.lemonsqueezy.com).
2. Create Product #1: **BrandSight AI Pro**
   - Price: `$19.00 / month` subscription.
   - Under **Files & Licenses**, enable **Generate License Keys**.
   - Set **Activation Limit** to `1` (matching ViralSplice model).
3. Create Product #2: **BrandSight AI Agency**
   - Price: `$49.00 / month` subscription.
   - Under **Files & Licenses**, enable **Generate License Keys** with limit `1`.
4. Copy the checkout URLs into:
   - `NEXT_PUBLIC_LEMON_PRO_CHECKOUT_URL`
   - `NEXT_PUBLIC_LEMON_AGENCY_CHECKOUT_URL`
5. **Configure Webhook for Automatic Plan Upgrades**:
   - In Lemon Squeezy Dashboard, go to **Settings** &rarr; **Webhooks**.
   - Click **Add Webhook**.
   - Set **Callback URL** to: `https://brandsight-ai.vercel.app/api/webhooks/lemonsqueezy`
   - Enter a **Signing Secret** and select events:
     - `order_created`
     - `subscription_created`
     - `subscription_updated`
     - `subscription_cancelled`
     - `subscription_expired`
   - Copy the signing secret into `LEMONSQUEEZY_WEBHOOK_SECRET` in your Vercel project environment variables.
6. Test license key activation in the app using the **Activate Key** modal or via test webhook.

---

## ☁️ Deploying to Vercel

1. Push this repository to GitHub or GitLab.
2. Go to [Vercel](https://vercel.com) and click **Add New Project**.
3. Select your repository.
4. In the **Environment Variables** section, copy the variables from `.env.local`.
   - **`DEEPSEEK_API_KEY`** must be added to the **Production** environment (Project Settings -> Environment Variables -> tick *Production*). Never prefix it with `NEXT_PUBLIC_` and never commit its value; it is read server-side only. Redeploy after adding it.
5. Click **Deploy**. Vercel will build and deploy your Next.js application globally.

---

## 🔒 Security & Code Integrity

- **Isolated Scope**: All files and operations are strictly contained within `projects/BrandSight`. No external project files have been touched.
- **Cost Guardrails**: Built-in 24h caching and model economy safeguards protect your API budget against runaway costs.

---

## Provider Change Note

Perplexity has been **removed** from BrandSight AI (paid API). The supported engines are now exactly three: **OpenAI, Google Gemini and DeepSeek**. `PERPLEXITY_API_KEY` is no longer read anywhere and can be deleted from your environment.

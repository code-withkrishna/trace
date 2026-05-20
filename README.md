# Trace — Batch Sustainability Tracker

> One honest number per production batch. Built for Indian SME manufacturers.

Trace turns scattered operational data (water bills, electricity readings, fuel receipts, waste logs) into a single auditable sustainability score per production batch — with a printable A4 Report Card.

---

## Quick Setup (5 minutes)

### 1. Clone & install

```bash
git clone https://github.com/YOUR_USERNAME/trace.git
cd trace
npm install
```

Replace the URL with your fork or the official hackathon repo link.

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) → New project
2. Note your **Project URL** and **anon key** (Settings → API)
3. Also note the **service role key** (same page — keep this secret)

### 3. Run the database schema

1. In Supabase dashboard → SQL Editor
2. Paste the contents of `supabase/schema.sql`
3. Click **Run**

### 4. Set environment variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 6. Load demo data

- Go to the **Demo** tab
- Click **Load Demo Factory**
- 25 batches from Shakti Textiles (Tiruppur) will be seeded

---

## Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Add the same 3 environment variables in Vercel dashboard → Settings → Environment Variables.

---

## Scoring Formula

Start at **100**. Deduct:

| Criterion | Deduction |
|-----------|-----------|
| Water > 50 L/unit | 1 point per 10 L above threshold, max 20 |
| Electricity > 2 kWh/unit | 1 point per 0.5 kWh above threshold, max 20 |
| Any fuel used | −10 |
| Waste: landfill or unknown | −15 |
| Waste: recycler | −5 |
| Waste: composted / zero | 0 |
| Tanker water used | −10 |

**Final score clamped to 0–100.**

Logic lives exclusively in `lib/scoring/calculateScore.ts` — never in UI components.

---

## Project Structure

```
app/
├── page.tsx                    # Landing page
├── batches/
│   ├── page.tsx                # Batch list
│   ├── new/page.tsx            # Create batch form
│   └── [id]/page.tsx           # Batch detail + resource logging
├── report/[id]/page.tsx        # Report Card + PDF
├── trends/page.tsx             # Trend dashboard
├── demo/page.tsx               # Demo factory (Shakti Textiles)
├── about/page.tsx              # About + scoring formula
└── api/
    ├── batches/complete/[id]/  # Complete batch, save report
    └── demo/reset/             # Seed demo data

lib/
├── scoring/
│   ├── calculateScore.ts       # Core scoring engine (judges verify this)
│   ├── compareBatches.ts       # Comparison logic
│   ├── generateObservation.ts  # Template-based observation
│   └── types.ts                # TypeScript types
├── reports/generateReport.ts   # Report orchestrator
├── demo/
│   ├── demoData.ts             # 25 Shakti Textiles batches
│   └── seeder.ts               # Supabase seeder
├── supabase/client.ts          # Supabase client
└── utils/formatters.ts         # Display formatters

supabase/
└── schema.sql                  # All tables + indexes

components/
└── BottomNav.tsx               # 4-tab bottom navigation
```

---

## Features

- ✅ Batch creation (batch ID, product type, units, date, material)
- ✅ Resource logging: water, electricity, fuel, waste (multiple entries per batch)
- ✅ Scoring engine: exact formula, isolated in `lib/scoring/`
- ✅ Report Card: score + breakdown + metrics + comparison + observation
- ✅ PDF export: browser print → A4, clean layout, no canvas hacks
- ✅ Trends dashboard: line chart, top/bottom batches, recent activity
- ✅ Demo factory: 25 pre-loaded Shakti Textiles batches
- ✅ Mobile-first: works on 2GB RAM Android, 360px wide
- ✅ No login required

## Tech Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **Charts**: Recharts
- **Deployment**: Vercel
- **PDF**: HTML + `@media print` CSS (no canvas)

---

## Hackathon submission checklist

- Run `npm run build` and `npm run lint` locally before zipping or pushing.
- Do **not** commit `.env` or `.env.local` (real keys). Only share `.env.local.example`; judges copy it and add their own keys.
- Deploy to Vercel with `NEXT_PUBLIC_SUPABASE_*` and `SUPABASE_SERVICE_ROLE_KEY` set, and run `supabase/schema.sql` on your Supabase project.

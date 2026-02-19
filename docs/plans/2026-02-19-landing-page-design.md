# Landing Page Design: LeadForge-AI

**Date**: 2026-02-19
**Status**: Approved
**Author**: assadsharif

## Purpose

Marketing + signup conversion page. Public-facing, no auth required.
Primary goal: drive visitors to `/register` CTA. No backend API calls —
fully static server-rendered content.

## Visual Style

- Background: `#0a0a0f` (near-black)
- Accent: `indigo-500` / `violet-500` gradient
- Cards: `bg-white/5 backdrop-blur border-white/10` (glassmorphism)
- Typography: `white` headlines, `slate-400` body
- Icons: Lucide React
- Animations: Tailwind CSS transitions only — no Framer Motion, no new deps

## Sections (top to bottom)

### 1. Navbar
- Sticky positioned
- Transparent by default; `bg-black/80 backdrop-blur` on scroll
- Logo: "LeadForge" + "AI" in indigo
- Nav links: Features, Pricing, Docs (anchor/placeholder links)
- CTA button: "Get started free" → `/register`
- Scroll behavior requires `"use client"` — extracted to `NavbarClient`

### 2. Hero
- Full viewport height (`min-h-screen`)
- Subtle SVG dot-grid background overlay
- Indigo/violet radial gradient glow (CSS, no image)
- Headline: *"Capture and qualify leads — at AI speed"*
- Sub: *"LeadForge AI turns every form submission into a qualified
  opportunity. Enriched, scored, and pipeline-ready before your team
  even opens the CRM."*
- Two CTAs: "Get started free" (indigo filled) + "See how it works"
  (ghost, scrolls to #features)
- Trust badge: "No credit card required · Setup in 5 minutes"

### 3. Features
- id="features" anchor
- Section title: "Everything you need to convert faster"
- 3 glass cards in responsive grid (1 col mobile → 3 col desktop):
  1. **AI Enrichment** — Automatically enrich every lead with company
     data, intent signals, and fit score
  2. **Smart Capture** — Embeddable forms that qualify in real time
     before a lead even submits
  3. **Pipeline Ready** — Leads arrive pre-scored and prioritized,
     direct to your CRM

### 4. Stats
- Horizontal band with 3 stats:
  - 10,000+ leads captured
  - 3× faster qualification
  - 94% accuracy rate
- Light separator line above/below

### 5. Pricing
- id="pricing" anchor
- Section title: "Simple, transparent pricing"
- Annual/monthly toggle (`"use client"` wrapper for toggle state only)
- 3 tier cards:
  | Free | Pro (highlighted ring) | Enterprise |
  |---|---|---|
  | $0/mo | $49/mo ($39 annual) | Custom |
  | 5 leads/mo | Unlimited leads | All Pro |
  | Basic AI | AI qualify + score | SLA |
  | — | CRM export | API access |
  | — | Priority support | Dedicated CSM |
- CTA per card: "Get started", "Start free trial", "Contact sales"

### 6. CTA Band
- Full-width section, dark gradient (indigo → violet)
- Headline: "Start capturing smarter leads today"
- Sub: "Join 10,000+ teams already using LeadForge AI"
- Single CTA: "Get started free" → `/register`

### 7. Footer
- Logo + tagline
- 3 link columns: Product, Company, Legal (placeholder hrefs)
- Copyright line

## Component Architecture

| File | Type | Reason |
|---|---|---|
| `src/app/page.tsx` | Server | Root page, assembles all sections |
| `src/components/layout/Navbar.tsx` | Server | Renders shell |
| `src/components/layout/NavbarClient.tsx` | Client | Scroll state only |
| `src/components/landing/HeroSection.tsx` | Server | Static |
| `src/components/landing/FeaturesSection.tsx` | Server | Static |
| `src/components/landing/StatsSection.tsx` | Server | Static |
| `src/components/landing/PricingSection.tsx` | Server | Shell |
| `src/components/landing/PricingToggle.tsx` | Client | Toggle state |
| `src/components/landing/CtaBand.tsx` | Server | Static |
| `src/components/layout/Footer.tsx` | Server | Static |

## Constraints

- No new npm dependencies
- No images — icons via Lucide React
- TypeScript strict — all props explicitly typed
- WCAG 2.1 AA color contrast on all text
- All interactive elements keyboard-navigable
- `loading.tsx` and `error.tsx` already exist at app root — not needed
  for this static page
- Component files < 200 lines each (per constitution §5.1)

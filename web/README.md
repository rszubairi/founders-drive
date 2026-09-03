# Founders Drive — web

Next.js 16 (App Router) + Convex, implementing `../implementation_plan.md`.
Design direction: **Warm KL Minimal** — warm paper, a single ember accent,
Instrument Serif display over IBM Plex, SVG animation throughout.

## Run it

```bash
cd web
npm install

# 1. Start Convex (opens a browser once to create/link a project).
#    This writes NEXT_PUBLIC_CONVEX_URL + CONVEX_DEPLOYMENT into .env.local
#    and REPLACES convex/_generated/* with fully-typed bindings.
npx convex dev

# 2. In a second terminal, seed sample data (Malaysian ecosystem):
npx convex run seed:seed

# 3. Run the app:
npm run dev        # http://localhost:3000
```

`npm run build` works without Convex configured (pages render loading
states); real data needs steps 1–2 above.

## What's here

| Route | Notes |
|---|---|
| `/` | Home — the concept, Reality Check framework, 30/60/90 journey, You Said / We Did, ecosystem, poll teaser. Static. |
| `/roast-my-startup` | Flagship event — run of show, 6-pillar framework, **apply to pitch** + **RSVP** forms (Convex). |
| `/register` | 4-step startup registration wizard → `startups` + `founders` (+ optional pitch application). |
| `/directory` | Searchable/filterable startup directory (`listStartups`). |
| `/directory/[slug]` | Startup profile, Reality Check report, **Request an introduction**, live VC match scores. |
| `/capital-connect` | Investor / VC directory with filters. |
| `/perks` | Founder perks & opportunities. |
| `/poll` | **Live audience poll** — reactive. Score clarity / investibility / innovation 1–10, submit, watch the room average + composite verdict update live. Session-deduped, re-votable. |
| `/poll/admin` | Host console — move the "Active" spotlight between the 4 pitches. **No auth in v1** — gate this before a real event. |

## Backend (`convex/`)

`schema.ts` + one module per domain (`startups`, `investors`, `events`,
`polls`, `perks`) and `seed.ts`. `convex/_generated/*` are placeholder
stubs until `npx convex dev` regenerates them.

## Known v1 gaps / next steps

- **Auth** — none. Add Convex Auth or Clerk for founder accounts, profile
  claiming, and to gate `/poll/admin` (plan Phase 2).
- **Photography** — `public/assets/roast_stage.jpg` and `reality_check.jpg`
  (source copies in `../assets/`) are wired via `next/image` on `/` (stage band
  + You Said / We Did) and `/roast-my-startup` (hero + follow-through card).
  Swap the files in `public/assets/` to change them; add more alongside.
- Founder `email` is synthesised in the register flow — wire a real email
  field + verification with auth.
- Poll admin should be a real host dashboard (open/close, reveal, export).

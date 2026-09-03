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

## Deploy to Vercel

The git repo root is the parent folder, so the Next app is a **subdirectory**.

1. **Push** the repo to GitHub, then in Vercel: **New Project → import the repo →
   set _Root Directory_ to `web`.** Framework preset: Next.js (auto).
2. **Convex production deploy key** — Convex dashboard → your project →
   *Settings → Production → Generate Deploy Key*.
3. **Vercel → Project → Settings → Environment Variables**, add for
   *Production* and *Preview*:

   | Name | Value |
   |---|---|
   | `CONVEX_DEPLOY_KEY` | the key from step 2 (`prod:…`) |

   That is the only variable you set by hand. `vercel.json` overrides the build to
   `npx convex deploy --cmd 'npm run build'`, which pushes the Convex functions +
   schema to the production deployment and injects `NEXT_PUBLIC_CONVEX_URL` into
   the Next build automatically.
4. **Deploy.** The first build creates the production Convex deployment and its
   tables.
5. **Seed production once** (local machine, or the Convex dashboard's function
   runner against Production):

   ```bash
   npx convex run seed:seed --prod
   ```

`vercel.json` also pins serverless functions to `sin1` (Singapore) for the
Malaysian audience. `@vercel/analytics` + `@vercel/speed-insights` are wired in
`app/layout.tsx` and start reporting once deployed on Vercel.

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
| `/claim/verify` | Landing page for the "confirm your email" link in a profile-claim email. |
| `/admin/claims` | Review queue for profile claims that need a human. **No auth in v1.** |

## Email + profile claims

**Resend** sends transactional email from Convex actions (`convex/emails.ts`):

- **Founder welcome** — on `registerStartup`, scheduled to the founder's work email
  (now a required field in the wizard).
- **Profile claims** — on `/directory/[slug]` anyone can *Claim this profile* with a
  business email. `submitClaim` emails them a confirmation link; `/claim/verify`
  calls `verifyClaim`:
  - email domain **matches** the company website / a founder domain, and nobody
    owns the profile yet → **auto-approved**, `startups.claimedByEmail` is set, a
    founder row is added, "claim approved" email sent;
  - otherwise → status `verifying`, the current owner + `ADMIN_EMAIL` get a notice,
    and a human approves/rejects at `/admin/claims` (`decideClaim`) which emails
    the decision.

Without `RESEND_API_KEY` set, every send is logged and skipped — the flows still
work locally, you just don't get the emails. Set the Convex env vars from
`.env.example` (`npx convex env set NAME value [--prod]`).

## Backend (`convex/`)

`schema.ts` + one module per domain (`startups`, `investors`, `events`,
`polls`, `perks`) and `seed.ts`. `convex/_generated/*` is committed (regenerated
by `convex dev` / `convex deploy`). `convex/tsconfig.json` has `noEmit: true` —
do not remove it, or an IDE watcher will emit `convex/*.js` siblings that break
the Convex bundler.

## Known v1 gaps / next steps

- **Auth** — none. Add Convex Auth or Clerk for founder accounts and to gate
  `/poll/admin` + `/admin/claims` (plan Phase 2). Claim verification is
  email-possession only; add SSO / domain-verified orgs later.
- Resend **domain verification** — until your sending domain is verified in
  Resend, `EMAILS_FROM` must be `onboarding@resend.dev` and can only send to your
  own address.
- **Photography** — `public/assets/roast_stage.jpg` and `reality_check.jpg`
  (source copies in `../assets/`) are wired via `next/image` on `/` (stage band
  + You Said / We Did) and `/roast-my-startup` (hero + follow-through card).
  Swap the files in `public/assets/` to change them; add more alongside.
- Founder `email` is synthesised in the register flow — wire a real email
  field + verification with auth.
- Poll admin should be a real host dashboard (open/close, reveal, export).

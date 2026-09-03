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
2. **Production deploy key** — Convex dashboard → your project → **Settings**, pick
   the **Production** deployment in the deployment switcher (top of the page,
   *not* Development) → **Deploy Keys → Generate Production Deploy Key**. It looks
   like `prod:swift-otter-123|ey…`.
   ⚠️ A key generated on the **Development** deployment (`…beloved-armadillo-465…`)
   causes `401 MissingAccessToken` on Vercel — that is the error you just hit.
3. **Vercel → Project → Settings → Environment Variables**, for *Production* and
   *Preview*:

   | Name | Value |
   |---|---|
   | `CONVEX_DEPLOY_KEY` | the `prod:` key from step 2 |

   Then **delete `CONVEX_DEPLOYMENT` and `NEXT_PUBLIC_CONVEX_URL`** if the Convex
   Vercel integration (or an earlier attempt) added them — `convex deploy` sets
   the URL itself, and a stray `CONVEX_DEPLOYMENT` points the build at the wrong
   deployment.
4. **Deploy.** `vercel.json` runs `node scripts/vercel-build.mjs`, which checks
   the key, runs `convex deploy --cmd 'npm run build'` (pushes functions + schema
   to prod, injects `NEXT_PUBLIC_CONVEX_URL`), then builds Next. The first run
   creates the production Convex deployment and its tables.
5. **Seed production once** (local machine, or the Convex dashboard's function
   runner against the Production deployment):

   ```bash
   npx convex run seed:seed --prod
   ```
6. **Email in prod** — set the Convex env vars from `.env.example` against
   production: `npx convex env set RESEND_API_KEY re_… --prod` (likewise
   `EMAILS_FROM`, `SITE_URL` = your Vercel URL, `ADMIN_EMAIL`).

`vercel.json` also pins serverless functions to `sin1` (Singapore) for the
Malaysian audience. `@vercel/analytics` + `@vercel/speed-insights` are wired in
`app/layout.tsx` and start reporting once deployed on Vercel.

## What's here

| Route | Notes |
|---|---|
| `/` | Home — the concept, Reality Check framework, 30/60/90 journey, You Said / We Did, ecosystem, poll teaser. Static. |
| `/roast-my-startup` | Flagship event — run of show, framework, **Roast Me** (an approved startup's founder proposes for *this* event) + **RSVP** forms. |
| `/register` | 4-step registration wizard → `startups` (`status: "pending"`) + `founders`. Platform registration only. |
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

- **Registration received** — on `registerStartup`, to the founder's work email
  ("pending review").
- **Startup approved** — on `decideStartup(approve)` (first time), tells the founder
  the profile is live and to hit **Roast Me** on the event page to put it forward.

### Two-step Roast My Startup flow

1. `/register` → profile lands `status: "pending"`. **No** event application is created.
2. Admin approves at `/admin/startups` (`decideStartup`) → approval email.
3. On `/roast-my-startup`, the founder enters the profile email → picks an **approved**
   startup (`myStartupsForEmail`) → **Roast Me** (`proposeForRoast`, owner-email gated,
   rejects non-approved) creates one `pitchApplications` row for that event.
4. Admin picks the final four at `/admin/roast` (`selectForPitch` / `deselectFromPitch`).
- **Profile claims** — on `/directory/[slug]` anyone can *Claim this profile* with a
  business email. `submitClaim` emails them a confirmation link; `/claim/verify`
  calls `verifyClaim`:
  - email domain **matches** the company website / a founder domain, and nobody
    owns the profile yet → **auto-approved**, `startups.claimedByEmail` is set, a
    founder row is added, "claim approved" email sent;
  - otherwise → status `verifying`, the current owner + `ADMIN_EMAIL` get a notice,
    and a human approves/rejects at `/admin/claims` (`decideClaim`) which emails
    the decision.

**Every send attempt is written to the `emailLog` table** — status `sent` /
`skipped` (no API key) / `error` (provider rejected), with the Resend id or error
text. View it at **`/admin/emails`**, which also shows the current config and has
a **test send**. Or from the CLI: `npx convex run emails:sendTest '{"to":"…"}'`.

**If email isn't arriving:**
1. `RESEND_API_KEY` must be set **on the Convex deployment** (not Vercel):
   `npx convex env set RESEND_API_KEY re_… ` and again with `--prod`.
2. `EMAILS_FROM` must be a **Resend-verified domain**. The default
   `onboarding@resend.dev` only delivers to the address that owns the Resend
   account — mail to anyone else fails with a 403 (visible in `/admin/emails`).
   Verify a domain at resend.com/domains, then
   `npx convex env set EMAILS_FROM "Founders Drive <hello@yourdomain>" [--prod]`.

## Founder accounts & dashboard

Real login for founders (`convex/founderAuth.ts`, PBKDF2-hashed passwords,
30-day session tokens in httpOnly cookies).

- **`/founder/login`** — sign in / create account. Sign-up is only allowed if the
  email is already on a registered startup (founder email or claimed email).
- **`/dashboard`** — server component checks the `fd_founder` cookie, client
  renders from `founderAuth.me({ token })`. Per linked startup: edit the profile
  (`founderProfile.updateStartup`), **pitch materials** (3 business tags, 1-min
  founder video link, pitch-deck link or uploaded PDF — `media.setStartupDeck`),
  company logo, founder contact + photo (`founderProfile.updateFounderContact`),
  and **Roast Me** for the open event once approved.
- The approval email now points founders to `/founder/login?tab=signup`.
- `proxy.ts` guards `/dashboard` (cookie presence); `me` does the real validation.

Same caveat as admin: the underlying Convex mutations still accept a plain
`ownerEmail` — move to Convex Auth / Clerk before launch.

## Investor accounts & dashboard

`convex/investorAuth.ts` mirrors founder auth (`fd_vc` cookie). Sign-up gated to
the `contactEmail` on an `investors` profile.

- **`/vc/login`** → **`/vc/dashboard`** — edit the fund profile + logo
  (`investorProfile.updateFund` / `setFundLogoAuthed`), **post to `/news`**
  (`news.postNews` / `postEvent`), and read/reply to founder **outreach**.

## News & events (`/news`)

Two tabs — **Startup news** (`newsPosts`) and **Upcoming events**
(`ecosystemEvents`). Posted by signed-in funds (via the VC dashboard) or by admin
at **`/admin/news`** (which also hides/deletes fund posts). Seeded with a few
admin-authored items.

## Paid founder → VC outreach

`convex/outreach.ts` + `convex/stripe.ts` + `convex/http.ts`.

- Founder dashboard → **Reach out to investors**: pick a startup + a fund, write a
  note (the pitch-deck link is attached automatically), spend **1 intro credit**
  (`outreach.sendToInvestor`). Threads + replies both directions
  (`outreach.reply`, `thread`, `founderThreads` / `investorThreads`); the VC can
  mark a thread *interested* / *pass*.
- **Credits** are bought with **Stripe Checkout** (`stripe.createCheckout`,
  packs in `stripe.PACKS`, MYR). Fulfilment is the Convex HTTP webhook at
  **`/stripe/webhook`** (`convex/http.ts`) — verifies the signature, credits the
  account, idempotent on the Stripe event id.
- **Setup:** `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `SITE_URL` as Convex env
  vars; register the webhook at `https://<deployment>.convex.site/stripe/webhook`
  for `checkout.session.completed`. Without the keys, buying credits shows a clear
  error; everything else (send/reply once credited) works.

## Admin access

The `/admin/*` UI and `/poll/admin` are gated by `proxy.ts` (Next middleware) —
a single shared login, credentials from env:

| Var | |
|---|---|
| `ADMIN_EMAIL` | the login (default `admin`). Set the **same value** as a Convex env var too, for claim-notice emails. |
| `ADMIN_PASSWORD` | defaults to `Tool4life123!@#` — **override on Vercel**. |
| `ADMIN_AUTH_SECRET` | optional; change it to sign out every admin session. |

Sign in at `/admin/login`; the cookie lasts 8 hours. **This gates the UI only** —
the Convex `adminList*` / `decide*` functions are still callable by anyone with
the deployment URL. Add Convex Auth / Clerk before launch.

## Mentor Network

`convex/mentors.ts` — `/mentors` (directory, filter by category), `/mentors/[slug]`
(bio, categories, transparent rate breakdown, "book via Calendly" button),
`/mentors/apply` (public form → `status: "pending"`). Admin approves at
`/admin/mentors` (`decideMentor` → `sendMentorApproved` email).

**Pricing:** a mentor sets `hourlyRate` (what they receive). Startups are shown
`startupRate = ceil(hourlyRate × 1.20)` with the **20% Founders Drive fee**
itemised. Booking + payment happen on the mentor's Calendly; the FD fee is billed
separately (a Stripe-gated booking flow is a possible follow-up, like outreach
credits). Fee % is `mentors.PLATFORM_FEE_PCT`.

## Programmes, contributors & feedback

- **`/contributors`** + `/contributors/[slug]` — agencies, ministries, universities,
  corporates and programme-running VCs (`contributors` table; a `VC / accelerator`
  contributor can link to its `investors` row via `investorId`).
- **`/programmes`** + `/programmes/[slug]` — the grants and cohorts each contributor
  runs (`programmes` table). Detail page shows the offer, an aggregate rating
  (overall + mentorship / funding / network), the Founders Drive startups that went
  through it, and **anonymous** founder comments.
- **Startup profile → "Programmes & grants"** — a claimed profile can tag which
  programmes it went through (`startupProgrammes`, owner-email gated, `verified`
  flag set by admin) and rate them from the programme page.
- **Feedback is anonymous by construction**: `programmeFeedback` stores `startupId`
  for one-review-per-startup dedupe, but no query ever returns it or any email —
  only the ratings, comment and cohort label. Gate: you must have tagged the
  programme on your profile before you can rate it.

Convex: `contributors.ts`, `programmes.ts`, shared `authz.ts` (`requireStartupOwner`).
`submitContributor` / `submitProgramme` land as `reviewStatus: "pending"` for a
future admin queue (`adminList*` / `decide*` exist; no admin UI page yet).

## Images (logos, headshots, press)

Uploads go straight to **Convex file storage** (`convex/files.ts` →
`generateUploadUrl`, then `<ImageUpload>` POSTs the file and hands the `storageId`
to a mutation). Read queries resolve `logoId`/`photoId` → a `*.convex.cloud` URL,
falling back to any external `*Url` string. `next.config.ts` allows any `https`
image host for founder-supplied logo / press-image URLs.

- **Startup logo** + **founder photo** — set in the `/register` wizard; editable
  later once the profile is claimed (schema `startups.logoId`, `founders.photoId`).
- **Startup news** — `startupNews` table; shown as an "In the news" list on the
  profile. A claimed profile shows an **Add coverage** form gated by the owner
  email (`media.addStartupNews` / `deleteStartupNews`).
- **VC fund logo** — set in `/capital-connect/apply` (`investors.logoId`,
  `media.setInvestorLogo` — no email gate; also settable from `/admin/investors`).

Shown on: directory cards + profile header (startup logo), profile Team section
(founder avatars, initials-monogram fallback), Capital Connect cards (fund logo).

⚠️ v1: `generateUploadUrl` is unauthenticated — anyone can upload a blob to
storage (the *attach* mutations are gated). Add auth + size/type limits server-side
before launch.

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

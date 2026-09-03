import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Founders Drive — Convex data model.
 * Mirrors implementation_plan.md §1.
 */
export default defineSchema({
  startups: defineTable({
    name: v.string(),
    slug: v.string(),
    pitch: v.string(), // one-liner
    description: v.optional(v.string()),
    website: v.optional(v.string()),
    city: v.string(),
    sector: v.string(),
    stage: v.string(),
    teamSize: v.optional(v.string()),
    traction: v.optional(v.string()),
    metrics: v.optional(
      v.object({
        mrr: v.optional(v.string()),
        arr: v.optional(v.string()),
        gmv: v.optional(v.string()),
        pilots: v.optional(v.string()),
      }),
    ),
    fundingRaised: v.optional(v.string()),
    fundStatus: v.string(), // "Not raising" | "Raising now" | "Open to intros"
    targetAmount: v.optional(v.string()),
    helpWanted: v.array(v.string()),
    momentumScore: v.optional(v.number()),
    realityScore: v.optional(v.number()),
    featured: v.optional(v.boolean()),
    logoUrl: v.optional(v.string()), // external URL fallback
    logoId: v.optional(v.id("_storage")), // uploaded logo (preferred)
    // pitch materials
    tags: v.optional(v.array(v.string())), // up to 3 business tags
    founderVideoUrl: v.optional(v.string()), // 1-min founder intro video
    deckUrl: v.optional(v.string()), // pitch deck — external link
    deckId: v.optional(v.id("_storage")), // pitch deck — uploaded PDF (preferred)
    createdAt: v.number(),
    // profile ownership (set once a claim is approved)
    claimedByEmail: v.optional(v.string()),
    claimedAt: v.optional(v.number()),
    welcomeEmailSentAt: v.optional(v.number()),
    // moderation — gates visibility in the public directory
    status: v.optional(v.string()), // "pending" | "approved" | "rejected"
    reviewedAt: v.optional(v.number()),
  })
    .index("by_slug", ["slug"])
    .index("by_sector", ["sector"])
    .index("by_stage", ["stage"])
    .index("by_fundStatus", ["fundStatus"])
    .index("by_status", ["status"]),

  founders: defineTable({
    startupId: v.id("startups"),
    name: v.string(),
    role: v.string(),
    email: v.string(), // private — never returned by public queries
    linkedin: v.optional(v.string()),
    phone: v.optional(v.string()), // private
    bio: v.optional(v.string()),
    photoUrl: v.optional(v.string()), // external URL fallback
    photoId: v.optional(v.id("_storage")), // uploaded headshot (preferred)
    isPrimary: v.boolean(),
  }).index("by_startup", ["startupId"]),

  investors: defineTable({
    name: v.string(),
    fundName: v.string(),
    role: v.optional(v.string()),
    stagePreferences: v.array(v.string()),
    sectors: v.array(v.string()),
    ticketMin: v.optional(v.number()),
    ticketMax: v.optional(v.number()),
    geography: v.array(v.string()),
    thesis: v.optional(v.string()),
    leadPreference: v.optional(v.string()), // "Lead" | "Co-invest" | "Either"
    portfolioHighlights: v.array(v.string()),
    avatarUrl: v.optional(v.string()), // partner headshot
    logoUrl: v.optional(v.string()), // fund logo — external URL fallback
    logoId: v.optional(v.id("_storage")), // fund logo — uploaded (preferred)
    website: v.optional(v.string()),
    contactEmail: v.optional(v.string()), // private — never returned by public queries
    isVerified: v.boolean(),
    // moderation — gates visibility on Capital Connect
    status: v.optional(v.string()), // "pending" | "approved" | "rejected"
    reviewedAt: v.optional(v.number()),
  })
    .index("by_verified", ["isVerified"])
    .index("by_status", ["status"]),

  events: defineTable({
    title: v.string(),
    volume: v.string(),
    date: v.string(),
    doorsTime: v.optional(v.string()),
    startTime: v.optional(v.string()),
    venue: v.string(),
    totalSeats: v.number(),
    registeredCount: v.number(),
    status: v.string(), // "Upcoming" | "Live" | "Completed"
    pitchingStartups: v.array(v.id("startups")),
  }).index("by_status", ["status"]),

  eventRegistrations: defineTable({
    eventId: v.id("events"),
    fullName: v.string(),
    email: v.string(),
    roleType: v.string(), // Founder | Investor | Operator | Audience | Media
    companyName: v.optional(v.string()),
    registeredAt: v.number(),
  }).index("by_event", ["eventId"]),

  pitchApplications: defineTable({
    eventId: v.id("events"),
    startupId: v.optional(v.id("startups")),
    companyName: v.string(),
    founderName: v.string(),
    email: v.string(),
    oneLiner: v.string(),
    sector: v.string(),
    stage: v.string(),
    pitchDeckUrl: v.optional(v.string()),
    videoUrl: v.optional(v.string()),
    whyScrutinyReady: v.string(),
    helpWanted: v.array(v.string()),
    status: v.string(), // Pending | Shortlisted | Selected | Waitlisted | Rejected
    proposedByEmail: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_event", ["eventId"])
    .index("by_event_startup", ["eventId", "startupId"]),

  roastPolls: defineTable({
    eventId: v.id("events"),
    pitchNumber: v.number(), // 1..4
    startupId: v.optional(v.id("startups")),
    startupName: v.string(),
    tagline: v.string(),
    sector: v.optional(v.string()),
    stage: v.optional(v.string()),
    status: v.string(), // "Active" | "Queued" | "Closed"
  })
    .index("by_event", ["eventId"])
    .index("by_status", ["status"]),

  pollVotes: defineTable({
    pollId: v.id("roastPolls"),
    voterSessionId: v.string(),
    clarityScore: v.number(),
    investibilityScore: v.number(),
    innovationScore: v.number(),
    tags: v.array(v.string()),
    quickNote: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_poll", ["pollId"])
    .index("by_poll_session", ["pollId", "voterSessionId"]),

  realityCheckReports: defineTable({
    eventId: v.id("events"),
    startupId: v.id("startups"),
    score: v.number(), // 0..100
    criticalIssues: v.array(v.string()),
    importantIssues: v.array(v.string()),
    strengths: v.array(v.string()),
    top3Actions: v.array(
      v.object({
        why: v.string(),
        what: v.string(),
        how: v.string(),
        who: v.string(),
      }),
    ),
    matchedExperts: v.array(v.string()),
    targetDates: v.optional(v.string()),
  }).index("by_startup", ["startupId"]),

  actionPlans: defineTable({
    startupId: v.id("startups"),
    milestoneDay: v.number(), // 7 | 30 | 60 | 90
    title: v.string(),
    description: v.optional(v.string()),
    status: v.string(), // Implemented | Partially Implemented | Testing | Rejected
    evidence: v.optional(v.string()),
    updatedAt: v.number(),
  }).index("by_startup", ["startupId"]),

  founderPerks: defineTable({
    partner: v.string(),
    title: v.string(),
    category: v.string(),
    valueAmount: v.optional(v.string()),
    description: v.string(),
    claimInstructions: v.optional(v.string()),
    badge: v.optional(v.string()),
  }).index("by_category", ["category"]),

  // Ecosystem contributors: government agencies, ministries, and the VCs /
  // corporates / universities that run cohorts and grants.
  contributors: defineTable({
    name: v.string(),
    slug: v.string(),
    shortName: v.optional(v.string()), // "MDEC", "MRANTI"
    type: v.string(), // "Government agency" | "Ministry" | "VC / accelerator" | "Corporate" | "University" | "Foundation"
    description: v.optional(v.string()),
    website: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    logoId: v.optional(v.id("_storage")),
    focusAreas: v.array(v.string()),
    contactEmail: v.optional(v.string()), // private
    investorId: v.optional(v.id("investors")), // set when the contributor is also a fund in Capital Connect
    reviewStatus: v.optional(v.string()), // "pending" | "approved" | "rejected" (missing = approved, for seed)
    reviewedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_type", ["type"])
    .index("by_reviewStatus", ["reviewStatus"]),

  // A cohort / accelerator / grant / fellowship run by a contributor.
  programmes: defineTable({
    contributorId: v.id("contributors"),
    name: v.string(),
    slug: v.string(),
    kind: v.string(), // "Accelerator / cohort" | "Grant" | "Fellowship" | "Competition"
    summary: v.optional(v.string()),
    description: v.optional(v.string()),
    url: v.optional(v.string()),
    fundingAmount: v.optional(v.string()), // "Up to RM 500k"
    equity: v.optional(v.string()), // "Equity-free" | "Up to 8%"
    stageFocus: v.array(v.string()),
    sectorFocus: v.array(v.string()),
    cadence: v.optional(v.string()), // "Twice a year" | "Rolling"
    lifecycle: v.optional(v.string()), // "Open" | "Closed" | "Upcoming" | "Ongoing"
    logoUrl: v.optional(v.string()),
    reviewStatus: v.optional(v.string()),
    reviewedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_contributor", ["contributorId"])
    .index("by_kind", ["kind"])
    .index("by_reviewStatus", ["reviewStatus"]),

  // "This startup went through this programme" — a badge on the startup profile.
  startupProgrammes: defineTable({
    startupId: v.id("startups"),
    programmeId: v.id("programmes"),
    cohortLabel: v.optional(v.string()), // "Batch 7" | "2025 Cohort"
    year: v.optional(v.number()),
    outcome: v.optional(v.string()), // "Graduated" | "Awarded RM 250k grant"
    addedByEmail: v.optional(v.string()),
    verified: v.optional(v.boolean()), // contributor / admin confirmed
    createdAt: v.number(),
  })
    .index("by_startup", ["startupId"])
    .index("by_programme", ["programmeId"])
    .index("by_pair", ["startupId", "programmeId"]),

  // Ratings + anonymous free-text feedback from startups on a programme.
  // startupId is kept for dedupe/verification only — never returned publicly.
  programmeFeedback: defineTable({
    programmeId: v.id("programmes"),
    startupId: v.id("startups"),
    ratingOverall: v.number(), // 1..5
    ratingMentorship: v.optional(v.number()),
    ratingFunding: v.optional(v.number()),
    ratingNetwork: v.optional(v.number()),
    wouldRecommend: v.optional(v.boolean()),
    comment: v.optional(v.string()), // shown anonymously
    cohortLabel: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_programme", ["programmeId"])
    .index("by_pair", ["programmeId", "startupId"]),

  // Press / coverage links shown on a startup's public profile.
  startupNews: defineTable({
    startupId: v.id("startups"),
    title: v.string(),
    url: v.string(),
    source: v.optional(v.string()), // publication name
    publishedAt: v.optional(v.string()), // free-text date, e.g. "Mar 2026"
    summary: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_startup", ["startupId"]),

  introRequests: defineTable({
    startupId: v.id("startups"),
    requesterName: v.string(),
    requesterEmail: v.string(),
    requesterOrg: v.optional(v.string()),
    reason: v.string(),
    status: v.string(), // Pending | Accepted | Declined
    createdAt: v.number(),
  }).index("by_startup", ["startupId"]),

  // Founder accounts (email + password). A v1 auth layer — an account can
  // manage startups whose founder/claimed email matches its own.
  founderAccounts: defineTable({
    email: v.string(), // lower-cased
    passwordHash: v.string(), // pbkdf2$iterations$saltB64$hashB64
    name: v.optional(v.string()),
    createdAt: v.number(),
    lastLoginAt: v.optional(v.number()),
  }).index("by_email", ["email"]),

  founderSessions: defineTable({
    accountId: v.id("founderAccounts"),
    email: v.string(),
    token: v.string(),
    createdAt: v.number(),
    expiresAt: v.number(),
  }).index("by_token", ["token"]),

  // Investor accounts — sign in to manage the fund profile, post ecosystem
  // news/events, and read founder outreach.
  investorAccounts: defineTable({
    email: v.string(),
    passwordHash: v.string(),
    name: v.optional(v.string()),
    createdAt: v.number(),
    lastLoginAt: v.optional(v.number()),
  }).index("by_email", ["email"]),

  investorSessions: defineTable({
    accountId: v.id("investorAccounts"),
    email: v.string(),
    token: v.string(),
    createdAt: v.number(),
    expiresAt: v.number(),
  }).index("by_token", ["token"]),

  // Ecosystem news posts (tab 1 of /news). Posted by VCs or admin.
  newsPosts: defineTable({
    title: v.string(),
    url: v.optional(v.string()),
    source: v.optional(v.string()),
    summary: v.optional(v.string()),
    body: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    authorType: v.string(), // "vc" | "admin"
    authorName: v.string(),
    authorInvestorId: v.optional(v.id("investors")),
    publishedAt: v.optional(v.string()),
    status: v.string(), // "published" | "pending" | "hidden"
    createdAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_author", ["authorInvestorId"]),

  // Upcoming ecosystem events (tab 2 of /news). Posted by agencies/VCs.
  ecosystemEvents: defineTable({
    title: v.string(),
    date: v.string(), // free text, e.g. "14 Mar 2026"
    location: v.optional(v.string()),
    url: v.optional(v.string()),
    description: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    isSponsored: v.optional(v.boolean()),
    authorType: v.string(), // "vc" | "admin"
    authorName: v.string(),
    authorInvestorId: v.optional(v.id("investors")),
    status: v.string(), // "published" | "pending" | "hidden"
    createdAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_author", ["authorInvestorId"]),

  // Paid founder -> VC outreach.
  outreachCredits: defineTable({
    founderAccountId: v.id("founderAccounts"),
    balance: v.number(),
    updatedAt: v.number(),
  }).index("by_account", ["founderAccountId"]),

  outreachThreads: defineTable({
    founderAccountId: v.id("founderAccounts"),
    founderEmail: v.string(),
    startupId: v.id("startups"),
    startupName: v.string(),
    investorId: v.id("investors"),
    investorFund: v.string(),
    subject: v.string(),
    status: v.string(), // "sent" | "replied" | "declined" | "interested"
    createdAt: v.number(),
    lastMessageAt: v.number(),
    founderUnread: v.optional(v.number()),
    investorUnread: v.optional(v.number()),
  })
    .index("by_founder", ["founderAccountId"])
    .index("by_investor", ["investorId"])
    .index("by_pair", ["founderAccountId", "investorId", "startupId"]),

  outreachMessages: defineTable({
    threadId: v.id("outreachThreads"),
    from: v.string(), // "founder" | "investor"
    body: v.string(),
    deckUrl: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_thread", ["threadId"]),

  // Stripe webhook idempotency.
  stripeWebhookEvents: defineTable({
    eventId: v.string(),
    type: v.string(),
    createdAt: v.number(),
  }).index("by_event", ["eventId"]),

  stripeCheckouts: defineTable({
    sessionId: v.string(),
    founderAccountId: v.id("founderAccounts"),
    credits: v.number(),
    status: v.string(), // "pending" | "complete"
    createdAt: v.number(),
  }).index("by_session", ["sessionId"]),

  // Every transactional email attempt — sent, skipped (no API key), or errored.
  emailLog: defineTable({
    to: v.string(),
    subject: v.string(),
    kind: v.string(), // registration_received | startup_approved | claim_verification | ...
    status: v.string(), // "sent" | "skipped" | "error"
    reason: v.optional(v.string()), // why it was skipped, or the provider error
    providerId: v.optional(v.string()), // Resend email id
    meta: v.optional(v.string()), // small JSON blob of context
    createdAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_kind", ["kind"]),

  // Someone asserting they run a startup already in the directory. They verify
  // control of a business email; a domain match auto-approves, otherwise it
  // goes to manual review.
  profileClaims: defineTable({
    startupId: v.id("startups"),
    claimantName: v.string(),
    claimantEmail: v.string(), // business email, lower-cased
    claimantRole: v.string(),
    note: v.optional(v.string()),
    evidenceUrl: v.optional(v.string()),
    status: v.string(), // pending | verifying | approved | rejected
    verifyToken: v.string(),
    emailVerifiedAt: v.optional(v.number()),
    domainMatch: v.boolean(), // claimant email domain == company domain
    isFreeMail: v.boolean(), // gmail / yahoo / etc.
    decidedAt: v.optional(v.number()),
    decidedBy: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_startup", ["startupId"])
    .index("by_token", ["verifyToken"])
    .index("by_status", ["status"]),
});

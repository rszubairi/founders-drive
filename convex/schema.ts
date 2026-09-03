import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // 1. Malaysian Startups Directory
  startups: defineTable({
    name: v.string(),
    slug: v.string(),
    pitch: v.string(), // One-liner
    description: v.string(),
    website: v.string(),
    city: v.string(), // e.g. "Kuala Lumpur", "Penang", "Cyberjaya", "Johor Bahru"
    sector: v.string(), // "Fintech", "SaaS / B2B", "Deep Tech / AI", "Agritech", "Healthtech", "Marketplace", "Logistics", "Climate"
    stage: v.string(), // "Idea", "Pre-Seed", "Seed", "Pre-Series A", "Series A"
    teamSize: v.optional(v.string()),
    traction: v.string(), // e.g. "RM 45k MRR, 18 B2B clients, 32% MoM growth"
    mrr: v.optional(v.string()),
    fundingRaised: v.string(), // e.g. "Bootstrapped", "RM 250k Angel", "RM 1.2M Seed"
    fundStatus: v.string(), // "Not raising", "Raising now", "Open to intros"
    targetAmount: v.optional(v.string()),
    targetInvestors: v.optional(v.string()),
    helpWanted: v.array(v.string()), // ["Customer introductions", "Fundraising advice", "GTM mentoring", "Technical advice", "Hiring", "Partnerships", "International expansion", "VC introductions"]
    realityScore: v.optional(v.number()), // 0-100 Reality Check Score
    momentumScore: v.optional(v.number()), // 0-100 Execution & Momentum score
    status: v.string(), // "active", "verified", "roasted_alumni"
    logoUrl: v.optional(v.string()),
    pitchDeckUrl: v.optional(v.string()),
    videoUrl: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_sector", ["sector"])
    .index("by_stage", ["stage"])
    .index("by_fund_status", ["fundStatus"])
    .index("by_momentum", ["momentumScore"]),

  // 2. Founders & Leadership (Private fields protected by Controlled Introductions)
  founders: defineTable({
    startupId: v.id("startups"),
    name: v.string(),
    role: v.string(), // "Co-Founder & CEO", "CTO", etc.
    email: v.string(), // Private by default
    phone: v.optional(v.string()), // Private by default
    linkedin: v.optional(v.string()),
    bio: v.optional(v.string()),
    isPrimary: v.boolean(),
    isExited: v.optional(v.boolean()),
  }).index("by_startup", ["startupId"]),

  // 3. Investors & VCs Directory
  investors: defineTable({
    name: v.string(),
    fundName: v.string(),
    role: v.string(), // "General Partner", "Principal", "Investment Director"
    type: v.string(), // "VC Fund", "Angel Syndicate", "Family Office", "Corporate VC"
    status: v.string(), // "Actively deploying", "Selective", "Follow-on only"
    stagePreferences: v.array(v.string()), // ["Pre-Seed", "Seed", "Series A"]
    sectors: v.array(v.string()), // ["Fintech", "SaaS", "AI", "Agtech"]
    ticketMin: v.string(), // e.g. "RM 250k"
    ticketMax: v.string(), // e.g. "RM 2.5M"
    geography: v.string(), // e.g. "Malaysia & SEA"
    thesis: v.string(),
    leadPreference: v.string(), // "Lead", "Co-invest", "Either"
    portfolioHighlights: v.array(v.string()),
    avatarUrl: v.optional(v.string()),
    isVerified: v.boolean(),
    contactWorkflow: v.string(), // "Controlled warm intro via Founders Drive"
  }).index("by_fund", ["fundName"]),

  // 4. Roast My Startup Events
  events: defineTable({
    title: v.string(),
    volume: v.string(), // "Vol. 01", "Vol. 02"
    editionDate: v.string(), // "Thu 26 Jun 2026"
    doorsTime: v.string(), // "6:30 PM"
    startTime: v.string(), // "7:00 PM"
    venue: v.string(),
    city: v.string(),
    capacityFounders: v.number(), // 4 startups
    capacityAudience: v.number(), // 80 audience
    registeredCount: v.number(),
    status: v.string(), // "upcoming", "live", "completed"
    applicationsCloseDate: v.string(),
    theme: v.optional(v.string()),
  }).index("by_status", ["status"]),

  // 5. Event Registrations (Audience & Attendees)
  eventRegistrations: defineTable({
    eventId: v.id("events"),
    fullName: v.string(),
    email: v.string(),
    roleType: v.string(), // "Founder", "Investor", "Operator", "Mentor", "Ecosystem / Student"
    companyName: v.string(),
    ticketsCount: v.number(),
    registeredAt: v.number(),
  }).index("by_event", ["eventId"]),

  // 6. Pitch Applications for Roast My Startup
  pitchApplications: defineTable({
    eventId: v.id("events"),
    startupId: v.optional(v.id("startups")),
    companyName: v.string(),
    founderName: v.string(),
    email: v.string(),
    pitchOneLiner: v.string(),
    sector: v.string(),
    stage: v.string(),
    pitchDeckUrl: v.optional(v.string()),
    videoUrl: v.optional(v.string()),
    whyScrutinyReady: v.string(), // Why the founder wants honest challenge
    status: v.string(), // "pending", "shortlisted", "selected", "waitlist"
    submittedAt: v.number(),
  }).index("by_event", ["eventId"]),

  // 7. Live Audience Polling Sessions (Per Pitch during Roast My Startup)
  roastPolls: defineTable({
    eventId: v.id("events"),
    pitchNumber: v.number(), // 1, 2, 3, 4
    startupName: v.string(),
    oneLiner: v.string(),
    sector: v.string(),
    stage: v.string(),
    status: v.string(), // "active", "closed", "draft"
    totalVotes: v.number(),
  }).index("by_event_pitch", ["eventId", "pitchNumber"]),

  // 8. Individual Audience Poll Votes & Signals
  pollVotes: defineTable({
    pollId: v.id("roastPolls"),
    voterSessionId: v.string(),
    clarityScore: v.number(), // 1 - 10
    investibilityScore: v.number(), // 1 - 10
    innovationScore: v.number(), // 1 - 10
    tags: v.array(v.string()), // ["Crystal clear ICP", "Pricing too low", "High defensibility", "TAM needs proof", "Strong founder aura", "GTM needs focus"]
    audienceNote: v.optional(v.string()),
    submittedAt: v.number(),
  }).index("by_poll", ["pollId"]),

  // 9. Founders Drive Reality Check Reports
  realityCheckReports: defineTable({
    eventId: v.id("events"),
    startupId: v.id("startups"),
    startupName: v.string(),
    overallScore: v.number(), // /100
    audienceClarityAvg: v.number(), // e.g. 7.8
    audienceInvestibilityAvg: v.number(), // e.g. 6.4
    audienceInnovationAvg: v.number(), // e.g. 8.1
    criticalIssues: v.array(v.string()),
    importantIssues: v.array(v.string()),
    strengths: v.array(v.string()),
    // WHY -> WHAT -> HOW -> WHO structure
    top3Actions: v.array(
      v.object({
        why: v.string(),
        what: v.string(),
        how: v.string(),
        who: v.string(),
      })
    ),
    matchedExperts: v.array(v.string()),
    founderCommitmentDate: v.string(),
    stage: v.string(), // "Day 0 Verdict", "Day 7 Final Plan", "Day 30 Update", "Day 60 Update", "Day 90 Proof"
  }).index("by_startup", ["startupId"]),

  // 10. 30 / 60 / 90 Day Follow-Up & Action Plans ("You Said / We Did")
  actionPlans: defineTable({
    startupId: v.id("startups"),
    realityReportId: v.id("realityCheckReports"),
    dayMilestone: v.number(), // 7, 30, 60, 90
    itemTitle: v.string(),
    challengeRaised: v.string(), // What the panel challenged
    founderAction: v.string(), // What the founder did
    status: v.string(), // "Implemented", "Partially Implemented", "Testing", "Rejected"
    evidence: v.string(), // Concrete proof/metrics
    updatedAt: v.number(),
  }).index("by_startup_day", ["startupId", "dayMilestone"]),

  // 11. Controlled Introductions
  introRequests: defineTable({
    fromName: v.string(),
    fromOrg: v.string(),
    fromEmail: v.string(),
    targetStartupId: v.id("startups"),
    purpose: v.string(), // "Investment discussion", "Commercial pilot", "Partnership", "Mentorship"
    message: v.string(),
    status: v.string(), // "pending_founder_approval", "accepted", "declined"
    createdAt: v.number(),
  }).index("by_target_startup", ["targetStartupId"]),

  // 12. Founder Perks & Government Grants
  founderPerks: defineTable({
    partner: v.string(),
    title: v.string(),
    category: v.string(), // "Cloud & Infra", "Legal & Accounting", "Payments & Banking", "Government Grants & Programmes", "Growth & Marketing"
    valueAmount: v.string(), // e.g. "RM 100,000 credits", "25% discount"
    description: v.string(),
    eligibility: v.string(),
    claimWorkflow: v.string(),
    badge: v.optional(v.string()),
  }),
});

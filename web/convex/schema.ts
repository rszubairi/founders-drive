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
    logoUrl: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_sector", ["sector"])
    .index("by_stage", ["stage"])
    .index("by_fundStatus", ["fundStatus"]),

  founders: defineTable({
    startupId: v.id("startups"),
    name: v.string(),
    role: v.string(),
    email: v.string(), // private — never returned by public queries
    linkedin: v.optional(v.string()),
    phone: v.optional(v.string()), // private
    bio: v.optional(v.string()),
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
    avatarUrl: v.optional(v.string()),
    website: v.optional(v.string()),
    isVerified: v.boolean(),
  })
    .index("by_verified", ["isVerified"]),

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
    status: v.string(), // Pending | Shortlisted | Selected | Waitlisted
    createdAt: v.number(),
  }).index("by_event", ["eventId"]),

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

  introRequests: defineTable({
    startupId: v.id("startups"),
    requesterName: v.string(),
    requesterEmail: v.string(),
    requesterOrg: v.optional(v.string()),
    reason: v.string(),
    status: v.string(), // Pending | Accepted | Declined
    createdAt: v.number(),
  }).index("by_startup", ["startupId"]),
});

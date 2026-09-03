import { query, mutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

export const listStartups = query({
  args: {
    sector: v.optional(v.string()),
    stage: v.optional(v.string()),
    fundStatus: v.optional(v.string()),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let rows = await ctx.db.query("startups").collect();
    // Only approved profiles show up in the public directory.
    rows = rows.filter((r: any) => r.status === "approved");
    if (args.sector) rows = rows.filter((r: any) => r.sector === args.sector);
    if (args.stage) rows = rows.filter((r: any) => r.stage === args.stage);
    if (args.fundStatus) rows = rows.filter((r: any) => r.fundStatus === args.fundStatus);
    if (args.search) {
      const q = args.search.toLowerCase();
      rows = rows.filter(
        (r: any) =>
          r.name.toLowerCase().includes(q) ||
          r.pitch.toLowerCase().includes(q) ||
          r.sector.toLowerCase().includes(q),
      );
    }
    rows.sort((a: any, b: any) => (b.momentumScore ?? 0) - (a.momentumScore ?? 0));
    return rows.map(publicStartup);
  },
});

export const getStartupBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const startup = await ctx.db
      .query("startups")
      .withIndex("by_slug", (q: any) => q.eq("slug", args.slug))
      .unique();
    if (!startup) return null;
    const founders = await ctx.db
      .query("founders")
      .withIndex("by_startup", (q: any) => q.eq("startupId", startup._id))
      .collect();
    const report = await ctx.db
      .query("realityCheckReports")
      .withIndex("by_startup", (q: any) => q.eq("startupId", startup._id))
      .first();
    const plans = await ctx.db
      .query("actionPlans")
      .withIndex("by_startup", (q: any) => q.eq("startupId", startup._id))
      .collect();
    return {
      ...publicStartup(startup),
      claimed: !!startup.claimedByEmail,
      claimedAt: startup.claimedAt,
      founders: founders.map((f: any) => ({
        name: f.name,
        role: f.role,
        linkedin: f.linkedin,
        bio: f.bio,
        isPrimary: f.isPrimary,
        // email / phone intentionally omitted — controlled intros only
      })),
      report: report
        ? {
            score: report.score,
            criticalIssues: report.criticalIssues,
            importantIssues: report.importantIssues,
            strengths: report.strengths,
            top3Actions: report.top3Actions,
            matchedExperts: report.matchedExperts,
          }
        : null,
      actionPlans: plans.sort((a: any, b: any) => a.milestoneDay - b.milestoneDay),
    };
  },
});

export const registerStartup = mutation({
  args: {
    name: v.string(),
    pitch: v.string(),
    description: v.optional(v.string()),
    website: v.optional(v.string()),
    city: v.string(),
    sector: v.string(),
    stage: v.string(),
    teamSize: v.optional(v.string()),
    traction: v.optional(v.string()),
    fundingRaised: v.optional(v.string()),
    fundStatus: v.string(),
    targetAmount: v.optional(v.string()),
    helpWanted: v.array(v.string()),
    founderName: v.string(),
    founderRole: v.string(),
    founderEmail: v.string(),
    founderLinkedin: v.optional(v.string()),
    applyToRoast: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let slug = slugify(args.name);
    const clash = await ctx.db
      .query("startups")
      .withIndex("by_slug", (q: any) => q.eq("slug", slug))
      .unique();
    if (clash) slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;

    const startupId = await ctx.db.insert("startups", {
      name: args.name,
      slug,
      pitch: args.pitch,
      description: args.description,
      website: args.website,
      city: args.city,
      sector: args.sector,
      stage: args.stage,
      teamSize: args.teamSize,
      traction: args.traction,
      fundingRaised: args.fundingRaised,
      fundStatus: args.fundStatus,
      targetAmount: args.targetAmount,
      helpWanted: args.helpWanted,
      momentumScore: 50,
      featured: false,
      createdAt: Date.now(),
      status: "pending",
    });

    await ctx.db.insert("founders", {
      startupId,
      name: args.founderName,
      role: args.founderRole,
      email: args.founderEmail,
      linkedin: args.founderLinkedin,
      isPrimary: true,
    });

    if (args.applyToRoast) {
      const event = await ctx.db
        .query("events")
        .withIndex("by_status", (q: any) => q.eq("status", "Upcoming"))
        .first();
      if (event) {
        await ctx.db.insert("pitchApplications", {
          eventId: event._id,
          startupId,
          companyName: args.name,
          founderName: args.founderName,
          email: args.founderEmail,
          oneLiner: args.pitch,
          sector: args.sector,
          stage: args.stage,
          whyScrutinyReady: "Submitted via startup registration.",
          helpWanted: args.helpWanted,
          status: "Pending",
          createdAt: Date.now(),
        });
      }
    }

    await ctx.db.patch(startupId, { welcomeEmailSentAt: Date.now() });
    await ctx.scheduler.runAfter(0, internal.emails.sendFounderWelcome, {
      to: args.founderEmail,
      founderName: args.founderName,
      companyName: args.name,
      slug,
      appliedToRoast: !!args.applyToRoast,
    });

    return { startupId, slug };
  },
});

export const requestIntro = mutation({
  args: {
    slug: v.string(),
    requesterName: v.string(),
    requesterEmail: v.string(),
    requesterOrg: v.optional(v.string()),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const startup = await ctx.db
      .query("startups")
      .withIndex("by_slug", (q: any) => q.eq("slug", args.slug))
      .unique();
    if (!startup) throw new Error("Startup not found");
    await ctx.db.insert("introRequests", {
      startupId: startup._id,
      requesterName: args.requesterName,
      requesterEmail: args.requesterEmail,
      requesterOrg: args.requesterOrg,
      reason: args.reason,
      status: "Pending",
      createdAt: Date.now(),
    });
    return { ok: true };
  },
});

function publicStartup(r: any) {
  return {
    _id: r._id,
    name: r.name,
    slug: r.slug,
    pitch: r.pitch,
    description: r.description,
    website: r.website,
    city: r.city,
    sector: r.sector,
    stage: r.stage,
    teamSize: r.teamSize,
    traction: r.traction,
    metrics: r.metrics,
    fundingRaised: r.fundingRaised,
    fundStatus: r.fundStatus,
    targetAmount: r.targetAmount,
    helpWanted: r.helpWanted,
    momentumScore: r.momentumScore,
    realityScore: r.realityScore,
    featured: r.featured,
    logoUrl: r.logoUrl,
    status: r.status ?? "pending",
  };
}

// ---- Admin (startup approval queue) ----
// v1 has no authentication — see /admin for the same warning shown in-app.

export const adminListStartups = query({
  args: { status: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let rows = await ctx.db.query("startups").collect();
    if (args.status) rows = rows.filter((r: any) => (r.status ?? "pending") === args.status);
    rows.sort((a: any, b: any) => b.createdAt - a.createdAt);
    return Promise.all(
      rows.map(async (r: any) => {
        const founder = await ctx.db
          .query("founders")
          .withIndex("by_startup", (q: any) => q.eq("startupId", r._id))
          .first();
        return {
          ...r,
          status: r.status ?? "pending",
          founderName: founder?.name,
          founderEmail: founder?.email,
        };
      }),
    );
  },
});

export const decideStartup = mutation({
  args: { startupId: v.id("startups"), approve: v.boolean() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.startupId, {
      status: args.approve ? "approved" : "rejected",
      reviewedAt: Date.now(),
    });
    return { ok: true };
  },
});

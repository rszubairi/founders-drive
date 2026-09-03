import { mutation, query } from "convex/server";
import { v } from "convex/values";

export const getStartups = query({
  args: {
    sector: v.optional(v.string()),
    stage: v.optional(v.string()),
    fundStatus: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let list = await ctx.db.query("startups").collect();
    if (args.sector) {
      list = list.filter((s) => s.sector.toLowerCase() === args.sector?.toLowerCase());
    }
    if (args.stage) {
      list = list.filter((s) => s.stage.toLowerCase() === args.stage?.toLowerCase());
    }
    if (args.fundStatus) {
      list = list.filter((s) => s.fundStatus.toLowerCase() === args.fundStatus?.toLowerCase());
    }
    // Return sorted by momentum or creation date
    return list.sort((a, b) => (b.momentumScore ?? 0) - (a.momentumScore ?? 0));
  },
});

export const getStartupBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const startup = await ctx.db
      .query("startups")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
    if (!startup) return null;

    const founders = await ctx.db
      .query("founders")
      .withIndex("by_startup", (q) => q.eq("startupId", startup._id))
      .collect();

    const realityReport = await ctx.db
      .query("realityCheckReports")
      .withIndex("by_startup", (q) => q.eq("startupId", startup._id))
      .first();

    const actionPlans = await ctx.db
      .query("actionPlans")
      .withIndex("by_startup_day", (q) => q.eq("startupId", startup._id))
      .collect();

    return {
      startup,
      founders: founders.map((f) => ({
        name: f.name,
        role: f.role,
        linkedin: f.linkedin,
        bio: f.bio,
        isPrimary: f.isPrimary,
      })),
      realityReport,
      actionPlans,
    };
  },
});

export const registerStartup = mutation({
  args: {
    name: v.string(),
    pitch: v.string(),
    website: v.string(),
    city: v.string(),
    sector: v.string(),
    stage: v.string(),
    founderName: v.string(),
    founderRole: v.string(),
    founderEmail: v.string(),
    founderPhone: v.optional(v.string()),
    founderLinkedin: v.optional(v.string()),
    teamSize: v.optional(v.string()),
    traction: v.string(),
    fundingRaised: v.string(),
    fundStatus: v.string(),
    targetAmount: v.optional(v.string()),
    helpWanted: v.array(v.string()),
    applyRoastVol2: v.boolean(),
    pitchDeckUrl: v.optional(v.string()),
    whyScrutinyReady: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const slug = args.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const startupId = await ctx.db.insert("startups", {
      name: args.name,
      slug: `${slug}-${Date.now().toString(36)}`,
      pitch: args.pitch,
      description: args.pitch,
      website: args.website,
      city: args.city || "Kuala Lumpur",
      sector: args.sector,
      stage: args.stage,
      teamSize: args.teamSize || "2-5",
      traction: args.traction,
      fundingRaised: args.fundingRaised || "Bootstrapped",
      fundStatus: args.fundStatus,
      targetAmount: args.targetAmount,
      helpWanted: args.helpWanted,
      momentumScore: 65, // Initial baseline
      realityScore: undefined,
      status: "active",
      createdAt: Date.now(),
    });

    await ctx.db.insert("founders", {
      startupId,
      name: args.founderName,
      role: args.founderRole,
      email: args.founderEmail,
      phone: args.founderPhone,
      linkedin: args.founderLinkedin,
      isPrimary: true,
    });

    if (args.applyRoastVol2) {
      // Find upcoming event
      const upcomingEvent = await ctx.db
        .query("events")
        .withIndex("by_status", (q) => q.eq("status", "upcoming"))
        .first();

      if (upcomingEvent) {
        await ctx.db.insert("pitchApplications", {
          eventId: upcomingEvent._id,
          startupId,
          companyName: args.name,
          founderName: args.founderName,
          email: args.founderEmail,
          pitchOneLiner: args.pitch,
          sector: args.sector,
          stage: args.stage,
          pitchDeckUrl: args.pitchDeckUrl,
          whyScrutinyReady:
            args.whyScrutinyReady || "Ready for direct challenge on GTM and unit economics.",
          status: "pending",
          submittedAt: Date.now(),
        });
      }
    }

    return { startupId, success: true };
  },
});

export const requestControlledIntro = mutation({
  args: {
    startupId: v.id("startups"),
    fromName: v.string(),
    fromOrg: v.string(),
    fromEmail: v.string(),
    purpose: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("introRequests", {
      targetStartupId: args.startupId,
      fromName: args.fromName,
      fromOrg: args.fromOrg,
      fromEmail: args.fromEmail,
      purpose: args.purpose,
      message: args.message,
      status: "pending_founder_approval",
      createdAt: Date.now(),
    });
    return { introId: id, success: true };
  },
});

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

/** Uploaded storage id -> URL, else the external URL fallback. */
async function resolveImg(
  ctx: any,
  storageId: unknown,
  fallback: string | undefined,
): Promise<string | null> {
  if (storageId) {
    const u = await ctx.storage.getUrl(storageId);
    if (u) return u;
  }
  return fallback ?? null;
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
    return Promise.all(
      rows.map(async (r: any) => ({
        ...publicStartup(r),
        logoUrl: await resolveImg(ctx, r.logoId, r.logoUrl),
      })),
    );
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
    const news = await ctx.db
      .query("startupNews")
      .withIndex("by_startup", (q: any) => q.eq("startupId", startup._id))
      .collect();
    const progLinks = await ctx.db
      .query("startupProgrammes")
      .withIndex("by_startup", (q: any) => q.eq("startupId", startup._id))
      .collect();
    const programmes = (
      await Promise.all(
        progLinks.map(async (t) => {
          const p = await ctx.db.get(t.programmeId);
          if (!p || (p.reviewStatus && p.reviewStatus !== "approved")) return null;
          const c = await ctx.db.get(p.contributorId);
          return {
            linkId: t._id,
            programmeId: p._id,
            name: p.name,
            slug: p.slug,
            kind: p.kind,
            contributor: c ? (c.shortName ?? c.name) : null,
            contributorSlug: c ? c.slug : null,
            cohortLabel: t.cohortLabel ?? null,
            year: t.year ?? null,
            outcome: t.outcome ?? null,
            verified: !!t.verified,
          };
        }),
      )
    )
      .filter(Boolean)
      .sort((a: any, b: any) => (b.year ?? 0) - (a.year ?? 0));
    return {
      ...publicStartup(startup),
      logoUrl: await resolveImg(ctx, startup.logoId, startup.logoUrl),
      programmes,
      claimed: !!startup.claimedByEmail,
      claimedAt: startup.claimedAt,
      founders: await Promise.all(
        founders.map(async (f: any) => ({
          name: f.name,
          role: f.role,
          linkedin: f.linkedin,
          bio: f.bio,
          isPrimary: f.isPrimary,
          photoUrl: await resolveImg(ctx, f.photoId, f.photoUrl),
          // email / phone intentionally omitted — controlled intros only
        })),
      ),
      news: news
        .sort((a: any, b: any) => b.createdAt - a.createdAt)
        .map((n: any) => ({
          _id: n._id,
          title: n.title,
          url: n.url,
          source: n.source ?? null,
          publishedAt: n.publishedAt ?? null,
          summary: n.summary ?? null,
          imageUrl: n.imageUrl ?? null,
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

    // Registration only. The profile is reviewed by an admin; on approval the
    // founder gets an email and can then propose for a Roast My Startup event.
    await ctx.db.patch(startupId, { welcomeEmailSentAt: Date.now() });
    await ctx.scheduler.runAfter(0, internal.emails.sendRegistrationReceived, {
      to: args.founderEmail,
      founderName: args.founderName,
      companyName: args.name,
    });

    return { startupId, slug };
  },
});

/**
 * Approved startups an email is on (claimed email or a founder email).
 * Used by the "Roast Me" flow so a founder can pick which profile to put forward.
 */
export const myStartupsForEmail = query({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const e = email.trim().toLowerCase();
    if (!e.includes("@")) return [];
    const allStartups = await ctx.db.query("startups").collect();
    const founders = await ctx.db.query("founders").collect();
    const owned = new Set(
      founders
        .filter((f) => f.email.toLowerCase() === e)
        .map((f) => f.startupId as string),
    );
    return allStartups
      .filter(
        (s) =>
          owned.has(s._id as string) ||
          (s.claimedByEmail && s.claimedByEmail.toLowerCase() === e),
      )
      .map((s) => ({
        name: s.name,
        slug: s.slug,
        sector: s.sector,
        stage: s.stage,
        status: s.status ?? "pending",
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
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
    const startup = await ctx.db.get(args.startupId);
    if (!startup) throw new Error("Startup not found");
    const wasApproved = startup.status === "approved";

    await ctx.db.patch(args.startupId, {
      status: args.approve ? "approved" : "rejected",
      reviewedAt: Date.now(),
    });

    if (args.approve && !wasApproved) {
      const founders = await ctx.db
        .query("founders")
        .withIndex("by_startup", (q: any) => q.eq("startupId", args.startupId))
        .collect();
      const primary = founders.find((f: any) => f.isPrimary) ?? founders[0];
      const event =
        (await ctx.db
          .query("events")
          .withIndex("by_status", (q: any) => q.eq("status", "Live"))
          .first()) ??
        (await ctx.db
          .query("events")
          .withIndex("by_status", (q: any) => q.eq("status", "Upcoming"))
          .first());
      if (primary) {
        await ctx.scheduler.runAfter(0, internal.emails.sendStartupApproved, {
          to: primary.email,
          founderName: primary.name,
          companyName: startup.name,
          slug: startup.slug,
          eventTitle: event?.title,
        });
      }
    }
    return { ok: true };
  },
});

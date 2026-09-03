import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireStartupOwner, resolveImg } from "./authz";

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 70);
}
const listed = (r: any) => !r.reviewStatus || r.reviewStatus === "approved";
const clamp5 = (n: number) => Math.max(1, Math.min(5, Math.round(n)));

function aggregate(fb: any[]) {
  const n = fb.length;
  const avg = (k: string) => {
    const vals = fb.map((f) => f[k]).filter((x) => typeof x === "number");
    return vals.length ? vals.reduce((s, x) => s + x, 0) / vals.length : null;
  };
  const rec = fb.filter((f) => typeof f.wouldRecommend === "boolean");
  return {
    count: n,
    overall: n ? Number((avg("ratingOverall") ?? 0).toFixed(2)) : null,
    mentorship: avg("ratingMentorship") && Number(avg("ratingMentorship")!.toFixed(2)),
    funding: avg("ratingFunding") && Number(avg("ratingFunding")!.toFixed(2)),
    network: avg("ratingNetwork") && Number(avg("ratingNetwork")!.toFixed(2)),
    recommendPct: rec.length
      ? Math.round((rec.filter((f) => f.wouldRecommend).length / rec.length) * 100)
      : null,
  };
}

async function programmeCard(ctx: any, p: any) {
  const c = await ctx.db.get(p.contributorId);
  const fb = await ctx.db
    .query("programmeFeedback")
    .withIndex("by_programme", (q: any) => q.eq("programmeId", p._id))
    .collect();
  const tags = await ctx.db
    .query("startupProgrammes")
    .withIndex("by_programme", (q: any) => q.eq("programmeId", p._id))
    .collect();
  return {
    _id: p._id,
    name: p.name,
    slug: p.slug,
    kind: p.kind,
    summary: p.summary ?? null,
    fundingAmount: p.fundingAmount ?? null,
    equity: p.equity ?? null,
    cadence: p.cadence ?? null,
    lifecycle: p.lifecycle ?? null,
    stageFocus: p.stageFocus ?? [],
    sectorFocus: p.sectorFocus ?? [],
    url: p.url ?? null,
    logoUrl: await resolveImg(ctx, undefined, p.logoUrl ?? (c ? c.logoUrl : undefined)),
    contributor: c ? { name: c.name, slug: c.slug, shortName: c.shortName ?? null, type: c.type } : null,
    rating: aggregate(fb),
    startupCount: tags.length,
  };
}

export const listProgrammes = query({
  args: {
    kind: v.optional(v.string()),
    sector: v.optional(v.string()),
    stage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let rows = (await ctx.db.query("programmes").collect()).filter(listed);
    if (args.kind) rows = rows.filter((r: any) => r.kind === args.kind);
    if (args.sector)
      rows = rows.filter(
        (r: any) => r.sectorFocus.length === 0 || r.sectorFocus.includes(args.sector),
      );
    if (args.stage)
      rows = rows.filter(
        (r: any) => r.stageFocus.length === 0 || r.stageFocus.includes(args.stage),
      );
    rows.sort((a: any, b: any) => a.name.localeCompare(b.name));
    return Promise.all(rows.map((p: any) => programmeCard(ctx, p)));
  },
});

export const getProgrammeBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const p = await ctx.db
      .query("programmes")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    if (!p || !listed(p)) return null;

    const card = await programmeCard(ctx, p);

    const tags = await ctx.db
      .query("startupProgrammes")
      .withIndex("by_programme", (q) => q.eq("programmeId", p._id))
      .collect();
    const startups = (
      await Promise.all(
        tags.map(async (t) => {
          const s = await ctx.db.get(t.startupId);
          if (!s || s.status === "rejected") return null;
          return {
            name: s.name,
            slug: s.slug,
            sector: s.sector,
            stage: s.stage,
            logoUrl: await resolveImg(ctx, s.logoId, s.logoUrl),
            cohortLabel: t.cohortLabel ?? null,
            year: t.year ?? null,
            outcome: t.outcome ?? null,
            verified: !!t.verified,
          };
        }),
      )
    ).filter(Boolean);

    // anonymous — no startupId / email leaves the server
    const feedback = (
      await ctx.db
        .query("programmeFeedback")
        .withIndex("by_programme", (q) => q.eq("programmeId", p._id))
        .collect()
    )
      .sort((a: any, b: any) => b.createdAt - a.createdAt)
      .map((f: any) => ({
        ratingOverall: f.ratingOverall,
        ratingMentorship: f.ratingMentorship ?? null,
        ratingFunding: f.ratingFunding ?? null,
        ratingNetwork: f.ratingNetwork ?? null,
        wouldRecommend: f.wouldRecommend ?? null,
        comment: f.comment ?? null,
        cohortLabel: f.cohortLabel ?? null,
        createdAt: f.createdAt,
      }));

    return {
      ...card,
      description: p.description ?? null,
      startups,
      feedback,
    };
  },
});

/* --------------------- startup <-> programme tagging ---------------------- */

export const tagStartupProgramme = mutation({
  args: {
    startupSlug: v.string(),
    ownerEmail: v.string(),
    programmeId: v.id("programmes"),
    cohortLabel: v.optional(v.string()),
    year: v.optional(v.number()),
    outcome: v.optional(v.string()),
  },
  handler: async (ctx, a) => {
    const { startup } = await requireStartupOwner(ctx, a.startupSlug, a.ownerEmail);
    const programme = await ctx.db.get(a.programmeId);
    if (!programme) throw new Error("Programme not found");

    const existing = await ctx.db
      .query("startupProgrammes")
      .withIndex("by_pair", (q) =>
        q.eq("startupId", startup._id).eq("programmeId", a.programmeId),
      )
      .unique();

    const patch = {
      cohortLabel: a.cohortLabel?.trim() || undefined,
      year: a.year,
      outcome: a.outcome?.trim() || undefined,
    };
    if (existing) {
      await ctx.db.patch(existing._id, patch);
      return { ok: true, updated: true };
    }
    await ctx.db.insert("startupProgrammes", {
      startupId: startup._id,
      programmeId: a.programmeId,
      ...patch,
      addedByEmail: a.ownerEmail.trim().toLowerCase(),
      verified: false,
      createdAt: Date.now(),
    });
    return { ok: true, updated: false };
  },
});

export const untagStartupProgramme = mutation({
  args: { startupSlug: v.string(), ownerEmail: v.string(), linkId: v.id("startupProgrammes") },
  handler: async (ctx, a) => {
    const { startup } = await requireStartupOwner(ctx, a.startupSlug, a.ownerEmail);
    const link = await ctx.db.get(a.linkId);
    if (link && link.startupId === startup._id) await ctx.db.delete(a.linkId);
    return { ok: true };
  },
});

/* ------------------------------- feedback -------------------------------- */

export const submitProgrammeFeedback = mutation({
  args: {
    programmeId: v.id("programmes"),
    startupSlug: v.string(),
    ownerEmail: v.string(),
    ratingOverall: v.number(),
    ratingMentorship: v.optional(v.number()),
    ratingFunding: v.optional(v.number()),
    ratingNetwork: v.optional(v.number()),
    wouldRecommend: v.optional(v.boolean()),
    comment: v.optional(v.string()),
    cohortLabel: v.optional(v.string()),
  },
  handler: async (ctx, a) => {
    const { startup } = await requireStartupOwner(ctx, a.startupSlug, a.ownerEmail);
    const programme = await ctx.db.get(a.programmeId);
    if (!programme) throw new Error("Programme not found");

    // must have gone through it
    const link = await ctx.db
      .query("startupProgrammes")
      .withIndex("by_pair", (q) =>
        q.eq("startupId", startup._id).eq("programmeId", a.programmeId),
      )
      .unique();
    if (!link) {
      throw new Error(
        "Add this programme to your startup profile first — then you can rate it.",
      );
    }

    const row = {
      ratingOverall: clamp5(a.ratingOverall),
      ratingMentorship: a.ratingMentorship ? clamp5(a.ratingMentorship) : undefined,
      ratingFunding: a.ratingFunding ? clamp5(a.ratingFunding) : undefined,
      ratingNetwork: a.ratingNetwork ? clamp5(a.ratingNetwork) : undefined,
      wouldRecommend: a.wouldRecommend,
      comment: a.comment?.trim()?.slice(0, 1500) || undefined,
      cohortLabel: a.cohortLabel?.trim() || link.cohortLabel || undefined,
      updatedAt: Date.now(),
    };

    // one review per (programme, startup) — update in place, keeps it anonymous
    const existing = await ctx.db
      .query("programmeFeedback")
      .withIndex("by_pair", (q) =>
        q.eq("programmeId", a.programmeId).eq("startupId", startup._id),
      )
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, row);
      return { ok: true, updated: true };
    }
    await ctx.db.insert("programmeFeedback", {
      programmeId: a.programmeId,
      startupId: startup._id,
      ...row,
      createdAt: Date.now(),
    });
    return { ok: true, updated: false };
  },
});

/* --------------------------------- admin --------------------------------- */

export const submitProgramme = mutation({
  args: {
    contributorSlug: v.string(),
    name: v.string(),
    kind: v.string(),
    summary: v.optional(v.string()),
    url: v.optional(v.string()),
    fundingAmount: v.optional(v.string()),
    equity: v.optional(v.string()),
    stageFocus: v.array(v.string()),
    sectorFocus: v.array(v.string()),
    cadence: v.optional(v.string()),
  },
  handler: async (ctx, a) => {
    const c = await ctx.db
      .query("contributors")
      .withIndex("by_slug", (q) => q.eq("slug", a.contributorSlug))
      .unique();
    if (!c) throw new Error("Contributor not found");
    let slug = slugify(`${c.shortName ?? c.name}-${a.name}`);
    const clash = await ctx.db
      .query("programmes")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    if (clash) slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
    await ctx.db.insert("programmes", {
      contributorId: c._id,
      name: a.name.trim(),
      slug,
      kind: a.kind,
      summary: a.summary?.trim() || undefined,
      url: a.url?.trim() || undefined,
      fundingAmount: a.fundingAmount?.trim() || undefined,
      equity: a.equity?.trim() || undefined,
      stageFocus: a.stageFocus,
      sectorFocus: a.sectorFocus,
      cadence: a.cadence?.trim() || undefined,
      reviewStatus: "pending",
      createdAt: Date.now(),
    });
    return { ok: true, slug };
  },
});

export const adminListProgrammes = query({
  args: { reviewStatus: v.optional(v.string()) },
  handler: async (ctx, { reviewStatus }) => {
    let rows = await ctx.db.query("programmes").collect();
    if (reviewStatus)
      rows = rows.filter((r: any) => (r.reviewStatus ?? "approved") === reviewStatus);
    return Promise.all(
      rows
        .sort((a, b) => b.createdAt - a.createdAt)
        .map(async (p) => {
          const c = await ctx.db.get(p.contributorId);
          return { ...p, contributorName: c?.name ?? "—" };
        }),
    );
  },
});

export const decideProgramme = mutation({
  args: { programmeId: v.id("programmes"), approve: v.boolean() },
  handler: async (ctx, { programmeId, approve }) => {
    await ctx.db.patch(programmeId, {
      reviewStatus: approve ? "approved" : "rejected",
      reviewedAt: Date.now(),
    });
    return { ok: true };
  },
});

export const verifyStartupProgramme = mutation({
  args: { linkId: v.id("startupProgrammes"), verified: v.boolean() },
  handler: async (ctx, { linkId, verified }) => {
    await ctx.db.patch(linkId, { verified });
    return { ok: true };
  },
});

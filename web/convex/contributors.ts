import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { resolveImg } from "./authz";

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

const listed = (r: any) => !r.reviewStatus || r.reviewStatus === "approved";

async function publicContributor(ctx: any, r: any) {
  return {
    _id: r._id,
    name: r.name,
    slug: r.slug,
    shortName: r.shortName ?? null,
    type: r.type,
    description: r.description ?? null,
    website: r.website ?? null,
    focusAreas: r.focusAreas ?? [],
    logoUrl: await resolveImg(ctx, r.logoId, r.logoUrl),
  };
}

export const listContributors = query({
  args: { type: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let rows = (await ctx.db.query("contributors").collect()).filter(listed);
    if (args.type) rows = rows.filter((r: any) => r.type === args.type);
    rows.sort((a: any, b: any) => a.name.localeCompare(b.name));
    const out = await Promise.all(
      rows.map(async (r: any) => {
        const programmes = await ctx.db
          .query("programmes")
          .withIndex("by_contributor", (q: any) => q.eq("contributorId", r._id))
          .collect();
        return {
          ...(await publicContributor(ctx, r)),
          programmeCount: programmes.filter(listed).length,
        };
      }),
    );
    return out;
  },
});

export const getContributorBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const c = await ctx.db
      .query("contributors")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    if (!c || !listed(c)) return null;
    const programmes = (
      await ctx.db
        .query("programmes")
        .withIndex("by_contributor", (q) => q.eq("contributorId", c._id))
        .collect()
    ).filter(listed);
    return {
      ...(await publicContributor(ctx, c)),
      programmes: await Promise.all(
        programmes.map(async (p: any) => {
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
            lifecycle: p.lifecycle ?? null,
            startupCount: tags.length,
          };
        }),
      ),
    };
  },
});

/** Public submission — lands as pending for review. */
export const submitContributor = mutation({
  args: {
    name: v.string(),
    type: v.string(),
    shortName: v.optional(v.string()),
    description: v.optional(v.string()),
    website: v.optional(v.string()),
    focusAreas: v.array(v.string()),
    contactEmail: v.string(),
  },
  handler: async (ctx, a) => {
    let slug = slugify(a.name);
    const clash = await ctx.db
      .query("contributors")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    if (clash) slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
    await ctx.db.insert("contributors", {
      name: a.name.trim(),
      slug,
      shortName: a.shortName?.trim() || undefined,
      type: a.type,
      description: a.description?.trim() || undefined,
      website: a.website?.trim() || undefined,
      focusAreas: a.focusAreas,
      contactEmail: a.contactEmail.trim(),
      reviewStatus: "pending",
      createdAt: Date.now(),
    });
    return { ok: true, slug };
  },
});

/* ------------------------------- admin ------------------------------------- */

export const adminListContributors = query({
  args: { reviewStatus: v.optional(v.string()) },
  handler: async (ctx, { reviewStatus }) => {
    let rows = await ctx.db.query("contributors").collect();
    if (reviewStatus)
      rows = rows.filter((r: any) => (r.reviewStatus ?? "approved") === reviewStatus);
    return rows.sort((a: any, b: any) => b.createdAt - a.createdAt);
  },
});

export const decideContributor = mutation({
  args: { contributorId: v.id("contributors"), approve: v.boolean() },
  handler: async (ctx, { contributorId, approve }) => {
    await ctx.db.patch(contributorId, {
      reviewStatus: approve ? "approved" : "rejected",
      reviewedAt: Date.now(),
    });
    return { ok: true };
  },
});

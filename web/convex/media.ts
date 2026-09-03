import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireStartupOwner } from "./authz";

const requireOwner = requireStartupOwner;

/* ------------------------------- logos / photos ------------------------------ */

export const setStartupLogo = mutation({
  args: {
    slug: v.string(),
    ownerEmail: v.string(),
    storageId: v.optional(v.id("_storage")),
    logoUrl: v.optional(v.string()),
  },
  handler: async (ctx, a) => {
    const { startup } = await requireOwner(ctx, a.slug, a.ownerEmail);
    if (startup.logoId && startup.logoId !== a.storageId) {
      await ctx.storage.delete(startup.logoId).catch(() => {});
    }
    await ctx.db.patch(startup._id, {
      logoId: a.storageId,
      logoUrl: a.logoUrl ?? (a.storageId ? undefined : startup.logoUrl),
    });
    return { ok: true };
  },
});

export const setFounderPhoto = mutation({
  args: {
    slug: v.string(),
    ownerEmail: v.string(),
    founderEmail: v.string(),
    storageId: v.optional(v.id("_storage")),
    photoUrl: v.optional(v.string()),
  },
  handler: async (ctx, a) => {
    const { founders } = await requireOwner(ctx, a.slug, a.ownerEmail);
    const target = a.founderEmail.trim().toLowerCase();
    const founder = founders.find((f: any) => f.email.toLowerCase() === target);
    if (!founder) throw new Error("No founder with that email on this profile.");
    if (founder.photoId && founder.photoId !== a.storageId) {
      await ctx.storage.delete(founder.photoId).catch(() => {});
    }
    await ctx.db.patch(founder._id, {
      photoId: a.storageId,
      photoUrl: a.photoUrl ?? (a.storageId ? undefined : founder.photoUrl),
    });
    return { ok: true };
  },
});

/** No email gate — set from the investor apply flow or /admin/investors. */
export const setInvestorLogo = mutation({
  args: {
    investorId: v.id("investors"),
    storageId: v.optional(v.id("_storage")),
    logoUrl: v.optional(v.string()),
  },
  handler: async (ctx, a) => {
    const inv = await ctx.db.get(a.investorId);
    if (!inv) throw new Error("Investor not found");
    if (inv.logoId && inv.logoId !== a.storageId) {
      await ctx.storage.delete(inv.logoId).catch(() => {});
    }
    await ctx.db.patch(a.investorId, {
      logoId: a.storageId,
      logoUrl: a.logoUrl ?? (a.storageId ? undefined : inv.logoUrl),
    });
    return { ok: true };
  },
});

/* ---------------------------------- news ----------------------------------- */

export const listStartupNews = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const s = await ctx.db
      .query("startups")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    if (!s) return [];
    const rows = await ctx.db
      .query("startupNews")
      .withIndex("by_startup", (q) => q.eq("startupId", s._id))
      .collect();
    return rows
      .sort((a, b) => b.createdAt - a.createdAt)
      .map((n) => ({
        _id: n._id,
        title: n.title,
        url: n.url,
        source: n.source ?? null,
        publishedAt: n.publishedAt ?? null,
        summary: n.summary ?? null,
        imageUrl: n.imageUrl ?? null,
      }));
  },
});

export const addStartupNews = mutation({
  args: {
    slug: v.string(),
    ownerEmail: v.string(),
    title: v.string(),
    url: v.string(),
    source: v.optional(v.string()),
    publishedAt: v.optional(v.string()),
    summary: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, a) => {
    const { startup } = await requireOwner(ctx, a.slug, a.ownerEmail);
    if (!a.title.trim() || !/^https?:\/\//i.test(a.url.trim())) {
      throw new Error("A headline and a valid https link are required.");
    }
    await ctx.db.insert("startupNews", {
      startupId: startup._id,
      title: a.title.trim(),
      url: a.url.trim(),
      source: a.source?.trim() || undefined,
      publishedAt: a.publishedAt?.trim() || undefined,
      summary: a.summary?.trim() || undefined,
      imageUrl: a.imageUrl?.trim() || undefined,
      createdAt: Date.now(),
    });
    return { ok: true };
  },
});

export const deleteStartupNews = mutation({
  args: { slug: v.string(), ownerEmail: v.string(), newsId: v.id("startupNews") },
  handler: async (ctx, a) => {
    await requireOwner(ctx, a.slug, a.ownerEmail);
    const n = await ctx.db.get(a.newsId);
    if (n) await ctx.db.delete(a.newsId);
    return { ok: true };
  },
});

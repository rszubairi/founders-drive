import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { investorSessionEmail } from "./investorAuth";

async function investorFor(ctx: any, token: string) {
  const email = await investorSessionEmail(ctx, token);
  if (!email) throw new Error("Please sign in again.");
  const inv = (await ctx.db.query("investors").collect()).find(
    (r: any) => r.contactEmail && r.contactEmail.toLowerCase() === email,
  );
  if (!inv) throw new Error("No fund profile linked to your account.");
  return inv;
}

/* --------------------------------- news ---------------------------------- */

export const listNews = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    const rows = (await ctx.db.query("newsPosts").order("desc").take(limit ?? 60)).filter(
      (r) => r.status === "published",
    );
    return rows.map((r) => ({
      _id: r._id,
      title: r.title,
      url: r.url ?? null,
      source: r.source ?? null,
      summary: r.summary ?? null,
      body: r.body ?? null,
      imageUrl: r.imageUrl ?? null,
      tags: r.tags ?? [],
      authorName: r.authorName,
      publishedAt: r.publishedAt ?? null,
      createdAt: r.createdAt,
    }));
  },
});

export const postNews = mutation({
  args: {
    token: v.string(),
    title: v.string(),
    url: v.optional(v.string()),
    source: v.optional(v.string()),
    summary: v.optional(v.string()),
    body: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    publishedAt: v.optional(v.string()),
  },
  handler: async (ctx, a) => {
    const inv = await investorFor(ctx, a.token);
    if (!a.title.trim()) throw new Error("A headline is required.");
    await ctx.db.insert("newsPosts", {
      title: a.title.trim(),
      url: a.url?.trim() || undefined,
      source: a.source?.trim() || undefined,
      summary: a.summary?.trim() || undefined,
      body: a.body?.trim() || undefined,
      imageUrl: a.imageUrl?.trim() || undefined,
      tags: a.tags?.map((t) => t.trim()).filter(Boolean).slice(0, 4),
      authorType: "vc",
      authorName: inv.fundName,
      authorInvestorId: inv._id,
      publishedAt: a.publishedAt?.trim() || undefined,
      status: "published",
      createdAt: Date.now(),
    });
    return { ok: true };
  },
});

export const myPosts = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const email = await investorSessionEmail(ctx, token);
    if (!email) return null;
    const inv = (await ctx.db.query("investors").collect()).find(
      (r: any) => r.contactEmail && r.contactEmail.toLowerCase() === email,
    );
    if (!inv) return { news: [], events: [] };
    const news = (
      await ctx.db
        .query("newsPosts")
        .withIndex("by_author", (q) => q.eq("authorInvestorId", inv._id))
        .collect()
    ).sort((a, b) => b.createdAt - a.createdAt);
    const events = (
      await ctx.db
        .query("ecosystemEvents")
        .withIndex("by_author", (q) => q.eq("authorInvestorId", inv._id))
        .collect()
    ).sort((a, b) => b.createdAt - a.createdAt);
    return { news, events };
  },
});

export const deleteMyPost = mutation({
  args: { token: v.string(), kind: v.string(), id: v.string() },
  handler: async (ctx, a) => {
    const inv = await investorFor(ctx, a.token);
    const table = a.kind === "event" ? "ecosystemEvents" : "newsPosts";
    const row: any = await ctx.db.get(a.id as any);
    if (row && row.authorInvestorId === inv._id) await ctx.db.delete(row._id);
    return { ok: true };
  },
});

/* ------------------------------- events ---------------------------------- */

export const listEvents = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    const rows = (await ctx.db.query("ecosystemEvents").order("desc").take(limit ?? 60)).filter(
      (r) => r.status === "published",
    );
    return rows.map((r) => ({
      _id: r._id,
      title: r.title,
      date: r.date,
      location: r.location ?? null,
      url: r.url ?? null,
      description: r.description ?? null,
      imageUrl: r.imageUrl ?? null,
      tags: r.tags ?? [],
      isSponsored: !!r.isSponsored,
      authorName: r.authorName,
      createdAt: r.createdAt,
    }));
  },
});

export const postEvent = mutation({
  args: {
    token: v.string(),
    title: v.string(),
    date: v.string(),
    location: v.optional(v.string()),
    url: v.optional(v.string()),
    description: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    isSponsored: v.optional(v.boolean()),
  },
  handler: async (ctx, a) => {
    const inv = await investorFor(ctx, a.token);
    if (!a.title.trim() || !a.date.trim()) throw new Error("A title and date are required.");
    await ctx.db.insert("ecosystemEvents", {
      title: a.title.trim(),
      date: a.date.trim(),
      location: a.location?.trim() || undefined,
      url: a.url?.trim() || undefined,
      description: a.description?.trim() || undefined,
      imageUrl: a.imageUrl?.trim() || undefined,
      tags: a.tags?.map((t) => t.trim()).filter(Boolean).slice(0, 4),
      isSponsored: a.isSponsored ?? false,
      authorType: "vc",
      authorName: inv.fundName,
      authorInvestorId: inv._id,
      status: "published",
      createdAt: Date.now(),
    });
    return { ok: true };
  },
});

/* -------------------------- admin (Next-gated) --------------------------- */

export const adminListPosts = query({
  args: {},
  handler: async (ctx) => {
    const news = (await ctx.db.query("newsPosts").order("desc").take(200)).map((r) => ({
      ...r,
      kind: "news" as const,
    }));
    const events = (await ctx.db.query("ecosystemEvents").order("desc").take(200)).map((r) => ({
      ...r,
      kind: "event" as const,
    }));
    return [...news, ...events].sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const adminPost = mutation({
  args: {
    kind: v.string(), // "news" | "event"
    title: v.string(),
    url: v.optional(v.string()),
    source: v.optional(v.string()),
    summary: v.optional(v.string()),
    date: v.optional(v.string()),
    location: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, a) => {
    if (a.kind === "event") {
      await ctx.db.insert("ecosystemEvents", {
        title: a.title.trim(),
        date: (a.date ?? "").trim() || "TBC",
        location: a.location?.trim() || undefined,
        url: a.url?.trim() || undefined,
        description: a.summary?.trim() || undefined,
        imageUrl: a.imageUrl?.trim() || undefined,
        tags: a.tags,
        isSponsored: false,
        authorType: "admin",
        authorName: "Founders Drive",
        status: "published",
        createdAt: Date.now(),
      });
    } else {
      await ctx.db.insert("newsPosts", {
        title: a.title.trim(),
        url: a.url?.trim() || undefined,
        source: a.source?.trim() || undefined,
        summary: a.summary?.trim() || undefined,
        imageUrl: a.imageUrl?.trim() || undefined,
        tags: a.tags,
        authorType: "admin",
        authorName: "Founders Drive",
        status: "published",
        createdAt: Date.now(),
      });
    }
    return { ok: true };
  },
});

export const adminSetStatus = mutation({
  args: { kind: v.string(), id: v.string(), status: v.string() },
  handler: async (ctx, a) => {
    await ctx.db.patch(a.id as any, { status: a.status });
    return { ok: true };
  },
});

export const adminDelete = mutation({
  args: { id: v.string() },
  handler: async (ctx, a) => {
    await ctx.db.delete(a.id as any);
    return { ok: true };
  },
});

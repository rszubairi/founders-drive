import { query, mutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

/** Founders Drive fee added on top of the mentor's hourly rate. */
export const PLATFORM_FEE_PCT = 20;

export const MENTOR_CATEGORIES = [
  "Fundraising",
  "Go-to-market",
  "Product",
  "Growth & marketing",
  "Sales",
  "Hiring & team",
  "Technical / engineering",
  "Operations & finance",
  "Legal & compliance",
  "International expansion",
];

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 50);
}

function pricing(hourlyRate: number) {
  const startupRate = Math.ceil((hourlyRate * (100 + PLATFORM_FEE_PCT)) / 100);
  return {
    mentorRate: hourlyRate,
    startupRate,
    platformFee: startupRate - hourlyRate,
    feePct: PLATFORM_FEE_PCT,
  };
}

async function publicMentor(ctx: any, m: any) {
  let photoUrl = m.photoUrl ?? null;
  if (m.photoId) photoUrl = (await ctx.storage.getUrl(m.photoId)) ?? photoUrl;
  return {
    _id: m._id,
    name: m.name,
    slug: m.slug,
    title: m.title ?? null,
    bio: m.bio,
    categories: m.categories ?? [],
    linkedin: m.linkedin ?? null,
    calendlyUrl: m.calendlyUrl,
    currency: m.currency ?? "RM",
    photoUrl,
    ...pricing(m.hourlyRate),
  };
}

export const listMentors = query({
  args: { category: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let rows = (await ctx.db.query("mentors").collect()).filter((m: any) => m.status === "approved");
    if (args.category)
      rows = rows.filter((m: any) => m.categories.includes(args.category));
    rows.sort((a: any, b: any) => a.hourlyRate - b.hourlyRate);
    return Promise.all(rows.map((m: any) => publicMentor(ctx, m)));
  },
});

export const getMentorBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const m = await ctx.db
      .query("mentors")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    if (!m || m.status !== "approved") return null;
    return publicMentor(ctx, m);
  },
});

export const applyMentor = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    title: v.optional(v.string()),
    bio: v.string(),
    categories: v.array(v.string()),
    linkedin: v.optional(v.string()),
    calendlyUrl: v.string(),
    hourlyRate: v.number(),
    photoStorageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, a) => {
    if (!a.name.trim() || a.bio.trim().length < 40) {
      throw new Error("Add your name and a bio of at least a couple of sentences.");
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a.email.trim())) throw new Error("Enter a valid email.");
    if (!/^https?:\/\/(www\.)?calendly\.com\//i.test(a.calendlyUrl.trim())) {
      throw new Error("Enter your public Calendly scheduling link (calendly.com/…).");
    }
    if (a.categories.length === 0) throw new Error("Pick at least one area you can help with.");
    if (!(a.hourlyRate > 0) || a.hourlyRate > 100000) throw new Error("Enter a sensible hourly rate.");

    let slug = slugify(a.name);
    const clash = await ctx.db
      .query("mentors")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    if (clash) slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;

    await ctx.db.insert("mentors", {
      name: a.name.trim(),
      slug,
      email: a.email.trim().toLowerCase(),
      title: a.title?.trim() || undefined,
      bio: a.bio.trim(),
      categories: a.categories.slice(0, 6),
      linkedin: a.linkedin?.trim() || undefined,
      calendlyUrl: a.calendlyUrl.trim(),
      hourlyRate: Math.round(a.hourlyRate),
      currency: "RM",
      photoId: a.photoStorageId,
      status: "pending",
      createdAt: Date.now(),
    });
    return { ok: true, slug, pricing: pricing(Math.round(a.hourlyRate)) };
  },
});

/* ------------------------------- admin ----------------------------------- */

export const adminListMentors = query({
  args: { status: v.optional(v.string()) },
  handler: async (ctx, { status }) => {
    let rows = await ctx.db.query("mentors").collect();
    if (status) rows = rows.filter((m: any) => (m.status ?? "pending") === status);
    rows.sort((a: any, b: any) => b.createdAt - a.createdAt);
    return Promise.all(
      rows.map(async (m: any) => {
        let photoUrl = m.photoUrl ?? null;
        if (m.photoId) photoUrl = (await ctx.storage.getUrl(m.photoId)) ?? photoUrl;
        return { ...m, photoUrl, ...pricing(m.hourlyRate) };
      }),
    );
  },
});

export const decideMentor = mutation({
  args: { mentorId: v.id("mentors"), approve: v.boolean() },
  handler: async (ctx, { mentorId, approve }) => {
    const m = await ctx.db.get(mentorId);
    if (!m) throw new Error("Mentor not found");
    const wasApproved = m.status === "approved";
    await ctx.db.patch(mentorId, {
      status: approve ? "approved" : "rejected",
      reviewedAt: Date.now(),
    });
    if (approve && !wasApproved) {
      await ctx.scheduler.runAfter(0, internal.emails.sendMentorApproved, {
        to: m.email,
        name: m.name,
        slug: m.slug,
      });
    }
    return { ok: true };
  },
});

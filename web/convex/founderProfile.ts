import { mutation } from "./_generated/server";
import { v } from "convex/values";

/** Resolve a founder session token to its email, or throw. */
async function authed(ctx: any, token: string): Promise<string> {
  const s = await ctx.db
    .query("founderSessions")
    .withIndex("by_token", (q: any) => q.eq("token", token))
    .unique();
  if (!s || s.expiresAt < Date.now()) throw new Error("Please sign in again.");
  return s.email as string;
}

async function ownedStartup(ctx: any, email: string, slug: string) {
  const startup = await ctx.db
    .query("startups")
    .withIndex("by_slug", (q: any) => q.eq("slug", slug))
    .unique();
  if (!startup) throw new Error("Startup not found");
  const founders = await ctx.db
    .query("founders")
    .withIndex("by_startup", (q: any) => q.eq("startupId", startup._id))
    .collect();
  const ok =
    (startup.claimedByEmail && startup.claimedByEmail.toLowerCase() === email) ||
    founders.some((f: any) => f.email.toLowerCase() === email);
  if (!ok) throw new Error("That startup isn't linked to your account.");
  return { startup, founders };
}

const opt = <T>(x: T | undefined, current: T) => (x === undefined ? current : x);

export const updateStartup = mutation({
  args: {
    token: v.string(),
    slug: v.string(),
    pitch: v.optional(v.string()),
    description: v.optional(v.string()),
    website: v.optional(v.string()),
    city: v.optional(v.string()),
    sector: v.optional(v.string()),
    stage: v.optional(v.string()),
    teamSize: v.optional(v.string()),
    traction: v.optional(v.string()),
    fundingRaised: v.optional(v.string()),
    fundStatus: v.optional(v.string()),
    targetAmount: v.optional(v.string()),
    helpWanted: v.optional(v.array(v.string())),
    tags: v.optional(v.array(v.string())),
    founderVideoUrl: v.optional(v.string()),
    deckUrl: v.optional(v.string()),
  },
  handler: async (ctx, a) => {
    const email = await authed(ctx, a.token);
    const { startup } = await ownedStartup(ctx, email, a.slug);
    if (a.pitch !== undefined && !a.pitch.trim()) throw new Error("A one-liner is required.");
    await ctx.db.patch(startup._id, {
      pitch: opt(a.pitch?.trim(), startup.pitch),
      description: a.description === undefined ? startup.description : a.description.trim() || undefined,
      website: a.website === undefined ? startup.website : a.website.trim() || undefined,
      city: opt(a.city?.trim(), startup.city),
      sector: opt(a.sector, startup.sector),
      stage: opt(a.stage, startup.stage),
      teamSize: a.teamSize === undefined ? startup.teamSize : a.teamSize || undefined,
      traction: a.traction === undefined ? startup.traction : a.traction.trim() || undefined,
      fundingRaised:
        a.fundingRaised === undefined ? startup.fundingRaised : a.fundingRaised.trim() || undefined,
      fundStatus: opt(a.fundStatus, startup.fundStatus),
      targetAmount:
        a.targetAmount === undefined ? startup.targetAmount : a.targetAmount.trim() || undefined,
      helpWanted: opt(a.helpWanted, startup.helpWanted),
      tags:
        a.tags === undefined
          ? startup.tags
          : a.tags.map((t) => t.trim()).filter(Boolean).slice(0, 3),
      founderVideoUrl:
        a.founderVideoUrl === undefined
          ? startup.founderVideoUrl
          : a.founderVideoUrl.trim() || undefined,
      deckUrl: a.deckUrl === undefined ? startup.deckUrl : a.deckUrl.trim() || undefined,
    });
    return { ok: true };
  },
});

export const updateFounderContact = mutation({
  args: {
    token: v.string(),
    slug: v.string(),
    name: v.optional(v.string()),
    role: v.optional(v.string()),
    linkedin: v.optional(v.string()),
    bio: v.optional(v.string()),
  },
  handler: async (ctx, a) => {
    const email = await authed(ctx, a.token);
    const { founders } = await ownedStartup(ctx, email, a.slug);
    const mine = founders.find((f: any) => f.email.toLowerCase() === email);
    if (!mine) throw new Error("No founder record for your email on this profile.");
    await ctx.db.patch(mine._id, {
      name: opt(a.name?.trim(), mine.name),
      role: opt(a.role?.trim(), mine.role),
      linkedin: a.linkedin === undefined ? mine.linkedin : a.linkedin.trim() || undefined,
      bio: a.bio === undefined ? mine.bio : a.bio.trim() || undefined,
    });
    return { ok: true };
  },
});

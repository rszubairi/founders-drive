import { mutation } from "./_generated/server";
import { v } from "convex/values";

async function authed(ctx: any, token: string): Promise<string> {
  const s = await ctx.db
    .query("investorSessions")
    .withIndex("by_token", (q: any) => q.eq("token", token))
    .unique();
  if (!s || s.expiresAt < Date.now()) throw new Error("Please sign in again.");
  return s.email as string;
}

async function ownFund(ctx: any, email: string, investorId: string) {
  const inv = await ctx.db.get(investorId);
  if (!inv) throw new Error("Fund not found");
  if (!inv.contactEmail || inv.contactEmail.toLowerCase() !== email) {
    throw new Error("That fund isn't linked to your account.");
  }
  return inv;
}

const opt = <T>(x: T | undefined, current: T) => (x === undefined ? current : x);

export const updateFund = mutation({
  args: {
    token: v.string(),
    investorId: v.id("investors"),
    thesis: v.optional(v.string()),
    website: v.optional(v.string()),
    role: v.optional(v.string()),
    stagePreferences: v.optional(v.array(v.string())),
    sectors: v.optional(v.array(v.string())),
    geography: v.optional(v.array(v.string())),
    ticketMin: v.optional(v.number()),
    ticketMax: v.optional(v.number()),
    leadPreference: v.optional(v.string()),
    portfolioHighlights: v.optional(v.array(v.string())),
  },
  handler: async (ctx, a) => {
    const email = await authed(ctx, a.token);
    const inv = await ownFund(ctx, email, a.investorId);
    await ctx.db.patch(inv._id, {
      thesis: a.thesis === undefined ? inv.thesis : a.thesis.trim() || undefined,
      website: a.website === undefined ? inv.website : a.website.trim() || undefined,
      role: a.role === undefined ? inv.role : a.role.trim() || undefined,
      stagePreferences: opt(a.stagePreferences, inv.stagePreferences),
      sectors: opt(a.sectors, inv.sectors),
      geography: opt(a.geography, inv.geography),
      ticketMin: opt(a.ticketMin, inv.ticketMin),
      ticketMax: opt(a.ticketMax, inv.ticketMax),
      leadPreference:
        a.leadPreference === undefined ? inv.leadPreference : a.leadPreference || undefined,
      portfolioHighlights: opt(a.portfolioHighlights, inv.portfolioHighlights),
    });
    return { ok: true };
  },
});

export const setFundLogoAuthed = mutation({
  args: { token: v.string(), investorId: v.id("investors"), storageId: v.optional(v.id("_storage")) },
  handler: async (ctx, a) => {
    const email = await authed(ctx, a.token);
    const inv = await ownFund(ctx, email, a.investorId);
    if (inv.logoId && inv.logoId !== a.storageId) {
      await ctx.storage.delete(inv.logoId).catch(() => {});
    }
    await ctx.db.patch(inv._id, { logoId: a.storageId });
    return { ok: true };
  },
});

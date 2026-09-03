import {
  action,
  mutation,
  query,
  internalMutation,
  internalQuery,
} from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { hashPassword, verifyPassword, SESSION_MS, newSessionToken } from "./passwords";

async function emailOnInvestor(ctx: any, email: string) {
  const rows = await ctx.db.query("investors").collect();
  return rows.some((r: any) => r.contactEmail && r.contactEmail.toLowerCase() === email);
}

export const _emailOnInvestor = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, { email }) => emailOnInvestor(ctx, email.toLowerCase()),
});

export const _accountByEmail = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const a = await ctx.db
      .query("investorAccounts")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();
    return a ? { _id: a._id, passwordHash: a.passwordHash } : null;
  },
});

export const _createAccount = internalMutation({
  args: { email: v.string(), passwordHash: v.string(), name: v.optional(v.string()) },
  handler: async (ctx, a) => {
    const existing = await ctx.db
      .query("investorAccounts")
      .withIndex("by_email", (q) => q.eq("email", a.email))
      .unique();
    if (existing) throw new Error("An account with that email already exists — sign in instead.");
    const accountId = await ctx.db.insert("investorAccounts", {
      email: a.email,
      passwordHash: a.passwordHash,
      name: a.name,
      createdAt: Date.now(),
    });
    const token = newSessionToken();
    await ctx.db.insert("investorSessions", {
      accountId,
      email: a.email,
      token,
      createdAt: Date.now(),
      expiresAt: Date.now() + SESSION_MS,
    });
    return { token };
  },
});

export const _startSession = internalMutation({
  args: { accountId: v.id("investorAccounts"), email: v.string() },
  handler: async (ctx, a) => {
    await ctx.db.patch(a.accountId, { lastLoginAt: Date.now() });
    const token = newSessionToken();
    await ctx.db.insert("investorSessions", {
      accountId: a.accountId,
      email: a.email,
      token,
      createdAt: Date.now(),
      expiresAt: Date.now() + SESSION_MS,
    });
    return { token };
  },
});

export const signUp = action({
  args: { email: v.string(), password: v.string(), name: v.optional(v.string()) },
  handler: async (ctx, a): Promise<{ token: string }> => {
    const email = a.email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Enter a valid email.");
    if (a.password.length < 8) throw new Error("Use at least 8 characters for your password.");
    const ok: boolean = await ctx.runQuery(internal.investorAuth._emailOnInvestor, { email });
    if (!ok) {
      throw new Error(
        "That email isn't on a verified fund profile. Apply to Capital Connect first, then create your login once it's approved.",
      );
    }
    const passwordHash = await hashPassword(a.password);
    return await ctx.runMutation(internal.investorAuth._createAccount, {
      email,
      passwordHash,
      name: a.name?.trim() || undefined,
    });
  },
});

export const login = action({
  args: { email: v.string(), password: v.string() },
  handler: async (ctx, a): Promise<{ token: string }> => {
    const email = a.email.trim().toLowerCase();
    const account: { _id: any; passwordHash: string } | null = await ctx.runQuery(
      internal.investorAuth._accountByEmail,
      { email },
    );
    if (!account || !(await verifyPassword(a.password, account.passwordHash))) {
      throw new Error("Wrong email or password.");
    }
    return await ctx.runMutation(internal.investorAuth._startSession, {
      accountId: account._id,
      email,
    });
  },
});

export const logout = mutation({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const s = await ctx.db
      .query("investorSessions")
      .withIndex("by_token", (q) => q.eq("token", token))
      .unique();
    if (s) await ctx.db.delete(s._id);
    return { ok: true };
  },
});

/** email for a valid investor session token, else null */
export async function investorSessionEmail(ctx: any, token: string): Promise<string | null> {
  if (!token) return null;
  const s = await ctx.db
    .query("investorSessions")
    .withIndex("by_token", (q: any) => q.eq("token", token))
    .unique();
  if (!s || s.expiresAt < Date.now()) return null;
  return s.email;
}

export const me = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const email = await investorSessionEmail(ctx, token);
    if (!email) return null;
    const account = await ctx.db
      .query("investorAccounts")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();
    const investors = (await ctx.db.query("investors").collect()).filter(
      (r: any) => r.contactEmail && r.contactEmail.toLowerCase() === email,
    );
    const funds = await Promise.all(
      investors.map(async (inv: any) => {
        let logoUrl = inv.logoUrl ?? null;
        if (inv.logoId) logoUrl = (await ctx.storage.getUrl(inv.logoId)) ?? logoUrl;
        return {
          _id: inv._id,
          fundName: inv.fundName,
          name: inv.name,
          role: inv.role ?? "",
          status: inv.status ?? "pending",
          isVerified: !!inv.isVerified,
          thesis: inv.thesis ?? "",
          website: inv.website ?? "",
          stagePreferences: inv.stagePreferences ?? [],
          sectors: inv.sectors ?? [],
          geography: inv.geography ?? [],
          ticketMin: inv.ticketMin ?? null,
          ticketMax: inv.ticketMax ?? null,
          leadPreference: inv.leadPreference ?? "",
          portfolioHighlights: inv.portfolioHighlights ?? [],
          logoUrl,
        };
      }),
    );
    return { email, name: account?.name ?? null, funds };
  },
});

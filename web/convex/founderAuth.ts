import {
  action,
  mutation,
  query,
  internalMutation,
  internalQuery,
} from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import {
  hashPassword,
  verifyPassword,
  SESSION_MS,
  newSessionToken as newToken,
} from "./passwords";

/* ------------------------------ internal --------------------------------- */

export const _createAccount = internalMutation({
  args: { email: v.string(), passwordHash: v.string(), name: v.optional(v.string()) },
  handler: async (ctx, a) => {
    const existing = await ctx.db
      .query("founderAccounts")
      .withIndex("by_email", (q) => q.eq("email", a.email))
      .unique();
    if (existing) throw new Error("An account with that email already exists — sign in instead.");
    const accountId = await ctx.db.insert("founderAccounts", {
      email: a.email,
      passwordHash: a.passwordHash,
      name: a.name,
      createdAt: Date.now(),
    });
    const token = newToken();
    await ctx.db.insert("founderSessions", {
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
  args: { accountId: v.id("founderAccounts"), email: v.string() },
  handler: async (ctx, a) => {
    await ctx.db.patch(a.accountId, { lastLoginAt: Date.now() });
    const token = newToken();
    await ctx.db.insert("founderSessions", {
      accountId: a.accountId,
      email: a.email,
      token,
      createdAt: Date.now(),
      expiresAt: Date.now() + SESSION_MS,
    });
    return { token };
  },
});

/* ------------------------------- public ---------------------------------- */

async function emailIsOnAStartup(ctx: any, email: string) {
  const founders = await ctx.db.query("founders").collect();
  if (founders.some((f: any) => f.email.toLowerCase() === email)) return true;
  const startups = await ctx.db.query("startups").collect();
  return startups.some((s: any) => s.claimedByEmail && s.claimedByEmail.toLowerCase() === email);
}

export const signUp = action({
  args: { email: v.string(), password: v.string(), name: v.optional(v.string()) },
  handler: async (ctx, a): Promise<{ token: string }> => {
    const email = a.email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Enter a valid email.");
    if (a.password.length < 8) throw new Error("Use at least 8 characters for your password.");

    const onStartup: boolean = await ctx.runQuery(internal.founderAuth._emailOnStartup, { email });
    if (!onStartup) {
      throw new Error(
        "We don't have a startup registered with that email. Register your startup first — you can set up login once it's approved.",
      );
    }
    const passwordHash = await hashPassword(a.password);
    return await ctx.runMutation(internal.founderAuth._createAccount, {
      email,
      passwordHash,
      name: a.name?.trim() || undefined,
    });
  },
});

export const _emailOnStartup = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, { email }) => emailIsOnAStartup(ctx, email.toLowerCase()),
});

export const login = action({
  args: { email: v.string(), password: v.string() },
  handler: async (ctx, a): Promise<{ token: string }> => {
    const email = a.email.trim().toLowerCase();
    const account: { _id: any; passwordHash: string } | null = await ctx.runQuery(
      internal.founderAuth._accountByEmail,
      { email },
    );
    if (!account || !(await verifyPassword(a.password, account.passwordHash))) {
      throw new Error("Wrong email or password.");
    }
    return await ctx.runMutation(internal.founderAuth._startSession, {
      accountId: account._id,
      email,
    });
  },
});

export const _accountByEmail = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const a = await ctx.db
      .query("founderAccounts")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();
    return a ? { _id: a._id, passwordHash: a.passwordHash } : null;
  },
});

export const logout = mutation({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const s = await ctx.db
      .query("founderSessions")
      .withIndex("by_token", (q) => q.eq("token", token))
      .unique();
    if (s) await ctx.db.delete(s._id);
    return { ok: true };
  },
});

async function sessionEmail(ctx: any, token: string): Promise<string | null> {
  if (!token) return null;
  const s = await ctx.db
    .query("founderSessions")
    .withIndex("by_token", (q: any) => q.eq("token", token))
    .unique();
  if (!s || s.expiresAt < Date.now()) return null;
  return s.email;
}

/** Everything the founder dashboard needs. */
export const me = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const email = await sessionEmail(ctx, token);
    if (!email) return null;
    const account = await ctx.db
      .query("founderAccounts")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();

    const allFounders = await ctx.db.query("founders").collect();
    const allStartups = await ctx.db.query("startups").collect();
    const mineIds = new Set<string>();
    for (const f of allFounders)
      if (f.email.toLowerCase() === email) mineIds.add(f.startupId as string);
    for (const s of allStartups)
      if (s.claimedByEmail && s.claimedByEmail.toLowerCase() === email)
        mineIds.add(s._id as string);

    const event =
      (await ctx.db
        .query("events")
        .withIndex("by_status", (q) => q.eq("status", "Live"))
        .first()) ??
      (await ctx.db
        .query("events")
        .withIndex("by_status", (q) => q.eq("status", "Upcoming"))
        .first());

    const startups = await Promise.all(
      allStartups
        .filter((s) => mineIds.has(s._id as string))
        .map(async (s) => {
          const founder = allFounders.find(
            (f) => f.startupId === s._id && f.email.toLowerCase() === email,
          );
          let logoUrl = s.logoUrl ?? null;
          if (s.logoId) logoUrl = (await ctx.storage.getUrl(s.logoId)) ?? logoUrl;
          let deckUrl = s.deckUrl ?? null;
          if (s.deckId) deckUrl = (await ctx.storage.getUrl(s.deckId)) ?? deckUrl;
          let photoUrl = founder?.photoUrl ?? null;
          if (founder?.photoId)
            photoUrl = (await ctx.storage.getUrl(founder.photoId)) ?? photoUrl;

          let proposal: string | null = null;
          if (event) {
            const row = await ctx.db
              .query("pitchApplications")
              .withIndex("by_event_startup", (q) =>
                q.eq("eventId", event._id).eq("startupId", s._id),
              )
              .unique();
            proposal = row?.status ?? null;
          }

          return {
            name: s.name,
            slug: s.slug,
            status: s.status ?? "pending",
            pitch: s.pitch,
            description: s.description ?? "",
            website: s.website ?? "",
            city: s.city,
            sector: s.sector,
            stage: s.stage,
            teamSize: s.teamSize ?? "",
            traction: s.traction ?? "",
            fundingRaised: s.fundingRaised ?? "",
            fundStatus: s.fundStatus,
            targetAmount: s.targetAmount ?? "",
            helpWanted: s.helpWanted ?? [],
            tags: s.tags ?? [],
            founderVideoUrl: s.founderVideoUrl ?? "",
            deckUrl,
            deckIsUpload: !!s.deckId,
            logoUrl,
            founder: founder
              ? {
                  name: founder.name,
                  role: founder.role,
                  linkedin: founder.linkedin ?? "",
                  bio: founder.bio ?? "",
                  photoUrl,
                }
              : null,
            roastProposalStatus: proposal,
          };
        }),
    );

    return {
      email,
      name: account?.name ?? null,
      event: event ? { _id: event._id, title: event.title, volume: event.volume, date: event.date } : null,
      startups: startups.sort((a, b) => a.name.localeCompare(b.name)),
    };
  },
});

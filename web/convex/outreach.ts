import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { investorSessionEmail } from "./investorAuth";

async function founderCtx(ctx: any, token: string) {
  const s = await ctx.db
    .query("founderSessions")
    .withIndex("by_token", (q: any) => q.eq("token", token))
    .unique();
  if (!s || s.expiresAt < Date.now()) throw new Error("Please sign in again.");
  return { email: s.email as string, accountId: s.accountId };
}

async function investorRow(ctx: any, token: string) {
  const email = await investorSessionEmail(ctx, token);
  if (!email) throw new Error("Please sign in again.");
  const inv = (await ctx.db.query("investors").collect()).find(
    (r: any) => r.contactEmail && r.contactEmail.toLowerCase() === email,
  );
  if (!inv) throw new Error("No fund profile linked to your account.");
  return inv;
}

async function creditRow(ctx: any, founderAccountId: any) {
  return await ctx.db
    .query("outreachCredits")
    .withIndex("by_account", (q: any) => q.eq("founderAccountId", founderAccountId))
    .unique();
}

/* ------------------------------- credits --------------------------------- */

export const myCredits = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    let accountId;
    try {
      ({ accountId } = await founderCtx(ctx, token));
    } catch {
      return { balance: 0 };
    }
    const row = await creditRow(ctx, accountId);
    return { balance: row?.balance ?? 0 };
  },
});

export const _addCredits = internalMutation({
  args: { founderAccountId: v.id("founderAccounts"), credits: v.number() },
  handler: async (ctx, a) => {
    const row = await creditRow(ctx, a.founderAccountId);
    if (row) {
      await ctx.db.patch(row._id, { balance: row.balance + a.credits, updatedAt: Date.now() });
    } else {
      await ctx.db.insert("outreachCredits", {
        founderAccountId: a.founderAccountId,
        balance: a.credits,
        updatedAt: Date.now(),
      });
    }
  },
});

/* ------------------------------- sending --------------------------------- */

export const sendToInvestor = mutation({
  args: {
    token: v.string(),
    startupSlug: v.string(),
    investorId: v.id("investors"),
    subject: v.string(),
    body: v.string(),
  },
  handler: async (ctx, a) => {
    const { email, accountId } = await founderCtx(ctx, a.token);
    if (!a.subject.trim() || a.body.trim().length < 20) {
      throw new Error("Write a subject and at least a couple of sentences.");
    }

    const startup = await ctx.db
      .query("startups")
      .withIndex("by_slug", (q) => q.eq("slug", a.startupSlug))
      .unique();
    if (!startup) throw new Error("Startup not found");
    const founders = await ctx.db
      .query("founders")
      .withIndex("by_startup", (q) => q.eq("startupId", startup._id))
      .collect();
    const ownsIt =
      (startup.claimedByEmail && startup.claimedByEmail.toLowerCase() === email) ||
      founders.some((f) => f.email.toLowerCase() === email);
    if (!ownsIt) throw new Error("That startup isn't linked to your account.");
    if (startup.status !== "approved") {
      throw new Error("Your startup profile needs to be approved before you can reach out.");
    }

    const investor = await ctx.db.get(a.investorId);
    if (!investor) throw new Error("Fund not found");

    const dup = await ctx.db
      .query("outreachThreads")
      .withIndex("by_pair", (q) =>
        q.eq("founderAccountId", accountId).eq("investorId", a.investorId).eq("startupId", startup._id),
      )
      .unique();
    if (dup) {
      throw new Error("You already have a thread with this fund for this startup — reply in it instead.");
    }

    const credits = await creditRow(ctx, accountId);
    if (!credits || credits.balance < 1) {
      throw new Error("no_credits");
    }
    await ctx.db.patch(credits._id, { balance: credits.balance - 1, updatedAt: Date.now() });

    let deckUrl = startup.deckUrl ?? undefined;
    if (startup.deckId) deckUrl = (await ctx.storage.getUrl(startup.deckId)) ?? deckUrl;

    const now = Date.now();
    const threadId = await ctx.db.insert("outreachThreads", {
      founderAccountId: accountId,
      founderEmail: email,
      startupId: startup._id,
      startupName: startup.name,
      investorId: a.investorId,
      investorFund: investor.fundName,
      subject: a.subject.trim(),
      status: "sent",
      createdAt: now,
      lastMessageAt: now,
      founderUnread: 0,
      investorUnread: 1,
    });
    await ctx.db.insert("outreachMessages", {
      threadId,
      from: "founder",
      body: a.body.trim(),
      deckUrl,
      createdAt: now,
    });
    return { ok: true, threadId, creditsLeft: credits.balance - 1 };
  },
});

/* ------------------------------- threads --------------------------------- */

function threadCard(t: any) {
  return {
    _id: t._id,
    subject: t.subject,
    startupName: t.startupName,
    investorFund: t.investorFund,
    status: t.status,
    lastMessageAt: t.lastMessageAt,
    founderUnread: t.founderUnread ?? 0,
    investorUnread: t.investorUnread ?? 0,
  };
}

export const founderThreads = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    let accountId;
    try {
      ({ accountId } = await founderCtx(ctx, token));
    } catch {
      return [];
    }
    const rows = await ctx.db
      .query("outreachThreads")
      .withIndex("by_founder", (q) => q.eq("founderAccountId", accountId))
      .collect();
    return rows.sort((a, b) => b.lastMessageAt - a.lastMessageAt).map(threadCard);
  },
});

export const investorThreads = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    let inv;
    try {
      inv = await investorRow(ctx, token);
    } catch {
      return [];
    }
    const rows = await ctx.db
      .query("outreachThreads")
      .withIndex("by_investor", (q) => q.eq("investorId", inv._id))
      .collect();
    return rows.sort((a, b) => b.lastMessageAt - a.lastMessageAt).map(threadCard);
  },
});

async function sideForThread(ctx: any, token: string, thread: any) {
  // founder session?
  const fs = await ctx.db
    .query("founderSessions")
    .withIndex("by_token", (q: any) => q.eq("token", token))
    .unique();
  if (fs && fs.expiresAt > Date.now() && fs.accountId === thread.founderAccountId) return "founder";
  // investor session?
  const email = await investorSessionEmail(ctx, token);
  if (email) {
    const inv = await ctx.db.get(thread.investorId);
    if (inv && inv.contactEmail && inv.contactEmail.toLowerCase() === email) return "investor";
  }
  return null;
}

export const thread = query({
  args: { token: v.string(), threadId: v.id("outreachThreads") },
  handler: async (ctx, a) => {
    const t = await ctx.db.get(a.threadId);
    if (!t) return null;
    const side = await sideForThread(ctx, a.token, t);
    if (!side) return null;
    const messages = (
      await ctx.db
        .query("outreachMessages")
        .withIndex("by_thread", (q) => q.eq("threadId", a.threadId))
        .collect()
    ).sort((x, y) => x.createdAt - y.createdAt);
    return {
      side,
      subject: t.subject,
      startupName: t.startupName,
      investorFund: t.investorFund,
      status: t.status,
      messages: messages.map((m) => ({
        from: m.from,
        body: m.body,
        deckUrl: m.deckUrl ?? null,
        createdAt: m.createdAt,
      })),
    };
  },
});

export const reply = mutation({
  args: { token: v.string(), threadId: v.id("outreachThreads"), body: v.string() },
  handler: async (ctx, a) => {
    const t = await ctx.db.get(a.threadId);
    if (!t) throw new Error("Thread not found");
    const side = await sideForThread(ctx, a.token, t);
    if (!side) throw new Error("Not your thread.");
    if (a.body.trim().length < 2) throw new Error("Write a reply.");
    const now = Date.now();
    await ctx.db.insert("outreachMessages", {
      threadId: a.threadId,
      from: side,
      body: a.body.trim(),
      createdAt: now,
    });
    await ctx.db.patch(a.threadId, {
      lastMessageAt: now,
      status: side === "investor" && t.status === "sent" ? "replied" : t.status,
      founderUnread: (t.founderUnread ?? 0) + (side === "investor" ? 1 : 0),
      investorUnread: (t.investorUnread ?? 0) + (side === "founder" ? 1 : 0),
    });
    return { ok: true };
  },
});

export const investorSetStatus = mutation({
  args: { token: v.string(), threadId: v.id("outreachThreads"), status: v.string() },
  handler: async (ctx, a) => {
    const t = await ctx.db.get(a.threadId);
    if (!t) throw new Error("Thread not found");
    const side = await sideForThread(ctx, a.token, t);
    if (side !== "investor") throw new Error("Not allowed.");
    await ctx.db.patch(a.threadId, { status: a.status });
    return { ok: true };
  },
});

export const markRead = mutation({
  args: { token: v.string(), threadId: v.id("outreachThreads") },
  handler: async (ctx, a) => {
    const t = await ctx.db.get(a.threadId);
    if (!t) return { ok: true };
    const side = await sideForThread(ctx, a.token, t);
    if (side === "founder") await ctx.db.patch(a.threadId, { founderUnread: 0 });
    if (side === "investor") await ctx.db.patch(a.threadId, { investorUnread: 0 });
    return { ok: true };
  },
});

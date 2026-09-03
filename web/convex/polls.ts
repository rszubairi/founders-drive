import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/** The pitch currently open for scoring (Active), plus the running queue. */
export const getActivePoll = query({
  args: {},
  handler: async (ctx) => {
    const active = await ctx.db
      .query("roastPolls")
      .withIndex("by_status", (q: any) => q.eq("status", "Active"))
      .first();
    const all = await ctx.db.query("roastPolls").collect();
    all.sort((a: any, b: any) => a.pitchNumber - b.pitchNumber);
    return {
      active: active ?? null,
      lineup: all.map((p: any) => ({
        _id: p._id,
        pitchNumber: p.pitchNumber,
        startupName: p.startupName,
        status: p.status,
      })),
    };
  },
});

function aggregate(votes: any[]) {
  const n = votes.length;
  const avg = (key: string) =>
    n === 0 ? 0 : votes.reduce((s, v2) => s + v2[key], 0) / n;
  const clarity = avg("clarityScore");
  const investibility = avg("investibilityScore");
  const innovation = avg("innovationScore");
  const composite = n === 0 ? 0 : (clarity + investibility + innovation) / 3;

  const tagCounts: Record<string, number> = {};
  for (const vote of votes)
    for (const t of vote.tags ?? []) tagCounts[t] = (tagCounts[t] ?? 0) + 1;

  return {
    count: n,
    clarity: Number(clarity.toFixed(2)),
    investibility: Number(investibility.toFixed(2)),
    innovation: Number(innovation.toFixed(2)),
    composite: Number(composite.toFixed(2)),
    topTags: Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag, votes2]) => ({ tag, votes: votes2 })),
  };
}

/** Live, reactive results for a poll — recomputes on every new vote. */
export const getLiveResults = query({
  args: { pollId: v.id("roastPolls"), voterSessionId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const votes = await ctx.db
      .query("pollVotes")
      .withIndex("by_poll", (q: any) => q.eq("pollId", args.pollId))
      .collect();

    let mine = null;
    if (args.voterSessionId) {
      mine =
        votes.find((v2: any) => v2.voterSessionId === args.voterSessionId) ??
        null;
    }

    return {
      room: aggregate(votes),
      mine: mine
        ? {
            clarityScore: mine.clarityScore,
            investibilityScore: mine.investibilityScore,
            innovationScore: mine.innovationScore,
            tags: mine.tags,
          }
        : null,
    };
  },
});

export const submitVote = mutation({
  args: {
    pollId: v.id("roastPolls"),
    voterSessionId: v.string(),
    clarityScore: v.number(),
    investibilityScore: v.number(),
    innovationScore: v.number(),
    tags: v.array(v.string()),
    quickNote: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const poll = await ctx.db.get(args.pollId);
    if (!poll || poll.status !== "Active") {
      throw new Error("This pitch is not open for scoring right now.");
    }
    for (const s of [
      args.clarityScore,
      args.investibilityScore,
      args.innovationScore,
    ]) {
      if (s < 1 || s > 10) throw new Error("Scores must be between 1 and 10.");
    }

    const existing = await ctx.db
      .query("pollVotes")
      .withIndex("by_poll_session", (q: any) =>
        q.eq("pollId", args.pollId).eq("voterSessionId", args.voterSessionId),
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        clarityScore: args.clarityScore,
        investibilityScore: args.investibilityScore,
        innovationScore: args.innovationScore,
        tags: args.tags,
        quickNote: args.quickNote,
      });
      return { updated: true };
    }

    await ctx.db.insert("pollVotes", {
      ...args,
      createdAt: Date.now(),
    });
    return { updated: false };
  },
});

/** Host control — move the "Active" spotlight to another pitch. */
export const setActivePitch = mutation({
  args: { pollId: v.id("roastPolls") },
  handler: async (ctx, args) => {
    const target = await ctx.db.get(args.pollId);
    if (!target) throw new Error("Poll not found");
    const all = await ctx.db
      .query("roastPolls")
      .withIndex("by_event", (q: any) => q.eq("eventId", target.eventId))
      .collect();
    for (const p of all) {
      const status =
        p._id === args.pollId
          ? "Active"
          : p.status === "Active"
            ? "Closed"
            : p.status;
      if (status !== p.status) await ctx.db.patch(p._id, { status });
    }
    return { ok: true };
  },
});

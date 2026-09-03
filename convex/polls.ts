import { mutation, query } from "convex/server";
import { v } from "convex/values";

export const getActivePollsForEvent = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("roastPolls")
      .withIndex("by_event_pitch", (q) => q.eq("eventId", args.eventId))
      .collect();
  },
});

export const getPollLiveState = query({
  args: { pollId: v.id("roastPolls") },
  handler: async (ctx, args) => {
    const poll = await ctx.db.get(args.pollId);
    if (!poll) return null;

    const votes = await ctx.db
      .query("pollVotes")
      .withIndex("by_poll", (q) => q.eq("pollId", args.pollId))
      .collect();

    const count = votes.length;
    if (count === 0) {
      return {
        poll,
        voterCount: 0,
        clarityAvg: 0,
        investibilityAvg: 0,
        innovationAvg: 0,
        compositeScore: 0,
        tagFrequencies: {},
        recentNotes: [],
      };
    }

    const claritySum = votes.reduce((acc, v) => acc + v.clarityScore, 0);
    const investibilitySum = votes.reduce((acc, v) => acc + v.investibilityScore, 0);
    const innovationSum = votes.reduce((acc, v) => acc + v.innovationScore, 0);

    const clarityAvg = +(claritySum / count).toFixed(1);
    const investibilityAvg = +(investibilitySum / count).toFixed(1);
    const innovationAvg = +(innovationSum / count).toFixed(1);
    const compositeScore = +((clarityAvg + investibilityAvg + innovationAvg) / 3).toFixed(1);

    const tagFrequencies: Record<string, number> = {};
    votes.forEach((v) => {
      v.tags.forEach((t) => {
        tagFrequencies[t] = (tagFrequencies[t] || 0) + 1;
      });
    });

    const recentNotes = votes
      .filter((v) => v.audienceNote && v.audienceNote.trim().length > 0)
      .map((v) => v.audienceNote!)
      .slice(-6);

    return {
      poll,
      voterCount: count,
      clarityAvg,
      investibilityAvg,
      innovationAvg,
      compositeScore,
      tagFrequencies,
      recentNotes,
    };
  },
});

export const submitPollVote = mutation({
  args: {
    pollId: v.id("roastPolls"),
    voterSessionId: v.string(),
    clarityScore: v.number(), // 1 - 10
    investibilityScore: v.number(), // 1 - 10
    innovationScore: v.number(), // 1 - 10
    tags: v.array(v.string()),
    audienceNote: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if voter has already submitted for this poll
    const existing = await ctx.db
      .query("pollVotes")
      .withIndex("by_poll", (q) => q.eq("pollId", args.pollId))
      .filter((q) => q.eq(q.field("voterSessionId"), args.voterSessionId))
      .first();

    if (existing) {
      // Update existing vote
      await ctx.db.patch(existing._id, {
        clarityScore: args.clarityScore,
        investibilityScore: args.investibilityScore,
        innovationScore: args.innovationScore,
        tags: args.tags,
        audienceNote: args.audienceNote,
        submittedAt: Date.now(),
      });
      return { voteId: existing._id, updated: true };
    }

    const voteId = await ctx.db.insert("pollVotes", {
      pollId: args.pollId,
      voterSessionId: args.voterSessionId,
      clarityScore: args.clarityScore,
      investibilityScore: args.investibilityScore,
      innovationScore: args.innovationScore,
      tags: args.tags,
      audienceNote: args.audienceNote,
      submittedAt: Date.now(),
    });

    // Increment total vote count on poll
    const poll = await ctx.db.get(args.pollId);
    if (poll) {
      await ctx.db.patch(args.pollId, {
        totalVotes: poll.totalVotes + 1,
      });
    }

    return { voteId, updated: false };
  },
});

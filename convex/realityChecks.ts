import { mutation, query } from "convex/server";
import { v } from "convex/values";

export const getRealityReport = query({
  args: { startupId: v.id("startups") },
  handler: async (ctx, args) => {
    const report = await ctx.db
      .query("realityCheckReports")
      .withIndex("by_startup", (q) => q.eq("startupId", args.startupId))
      .first();

    if (!report) return null;

    const actionPlans = await ctx.db
      .query("actionPlans")
      .withIndex("by_startup_day", (q) => q.eq("startupId", args.startupId))
      .collect();

    return {
      report,
      actionPlans,
    };
  },
});

export const updateActionPlanStatus = mutation({
  args: {
    actionPlanId: v.id("actionPlans"),
    status: v.string(), // "Implemented", "Partially Implemented", "Testing", "Rejected"
    evidence: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.actionPlanId, {
      status: args.status,
      evidence: args.evidence,
      updatedAt: Date.now(),
    });
    return { success: true };
  },
});

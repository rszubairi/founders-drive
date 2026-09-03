import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getUpcomingEvent = query({
  args: {},
  handler: async (ctx) => {
    const event =
      (await ctx.db
        .query("events")
        .withIndex("by_status", (q: any) => q.eq("status", "Live"))
        .first()) ??
      (await ctx.db
        .query("events")
        .withIndex("by_status", (q: any) => q.eq("status", "Upcoming"))
        .first());
    if (!event) return null;

    const pitching = await Promise.all(
      event.pitchingStartups.map((id: any) => ctx.db.get(id)),
    );
    return {
      ...event,
      seatsLeft: Math.max(0, event.totalSeats - event.registeredCount),
      pitching: pitching.filter(Boolean).map((s: any) => ({
        name: s.name,
        slug: s.slug,
        pitch: s.pitch,
        sector: s.sector,
        stage: s.stage,
      })),
    };
  },
});

export const registerForEvent = mutation({
  args: {
    eventId: v.id("events"),
    fullName: v.string(),
    email: v.string(),
    roleType: v.string(),
    companyName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId);
    if (!event) throw new Error("Event not found");
    await ctx.db.insert("eventRegistrations", {
      eventId: args.eventId,
      fullName: args.fullName,
      email: args.email,
      roleType: args.roleType,
      companyName: args.companyName,
      registeredAt: Date.now(),
    });
    await ctx.db.patch(args.eventId, {
      registeredCount: event.registeredCount + 1,
    });
    return { ok: true };
  },
});

export const applyToPitch = mutation({
  args: {
    eventId: v.id("events"),
    companyName: v.string(),
    founderName: v.string(),
    email: v.string(),
    oneLiner: v.string(),
    sector: v.string(),
    stage: v.string(),
    pitchDeckUrl: v.optional(v.string()),
    videoUrl: v.optional(v.string()),
    whyScrutinyReady: v.string(),
    helpWanted: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("pitchApplications", {
      ...args,
      status: "Pending",
      createdAt: Date.now(),
    });
    return { ok: true };
  },
});

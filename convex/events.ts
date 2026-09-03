import { mutation, query } from "convex/server";
import { v } from "convex/values";

export const getUpcomingEvent = query({
  handler: async (ctx) => {
    const event = await ctx.db
      .query("events")
      .withIndex("by_status", (q) => q.eq("status", "upcoming"))
      .first();

    if (!event) return null;

    const registrations = await ctx.db
      .query("eventRegistrations")
      .withIndex("by_event", (q) => q.eq("eventId", event._id))
      .collect();

    const applications = await ctx.db
      .query("pitchApplications")
      .withIndex("by_event", (q) => q.eq("eventId", event._id))
      .collect();

    return {
      event,
      registeredCount: registrations.length + event.registeredCount,
      applicationsCount: applications.length,
      seatsRemaining: Math.max(0, event.capacityAudience - (registrations.length + event.registeredCount)),
    };
  },
});

export const registerForEvent = mutation({
  args: {
    eventId: v.id("events"),
    fullName: v.string(),
    email: v.string(),
    roleType: v.string(),
    companyName: v.string(),
    ticketsCount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId);
    if (!event) throw new Error("Event not found");

    const id = await ctx.db.insert("eventRegistrations", {
      eventId: args.eventId,
      fullName: args.fullName,
      email: args.email,
      roleType: args.roleType,
      companyName: args.companyName,
      ticketsCount: args.ticketsCount || 1,
      registeredAt: Date.now(),
    });

    return { registrationId: id, success: true };
  },
});

export const applyToPitch = mutation({
  args: {
    eventId: v.id("events"),
    companyName: v.string(),
    founderName: v.string(),
    email: v.string(),
    pitchOneLiner: v.string(),
    sector: v.string(),
    stage: v.string(),
    pitchDeckUrl: v.optional(v.string()),
    videoUrl: v.optional(v.string()),
    whyScrutinyReady: v.string(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("pitchApplications", {
      eventId: args.eventId,
      companyName: args.companyName,
      founderName: args.founderName,
      email: args.email,
      pitchOneLiner: args.pitchOneLiner,
      sector: args.sector,
      stage: args.stage,
      pitchDeckUrl: args.pitchDeckUrl,
      videoUrl: args.videoUrl,
      whyScrutinyReady: args.whyScrutinyReady,
      status: "pending",
      submittedAt: Date.now(),
    });

    return { applicationId: id, success: true };
  },
});

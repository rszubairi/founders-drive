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

export const getPastEvents = query({
  args: {},
  handler: async (ctx) => {
    const events = await ctx.db
      .query("events")
      .withIndex("by_status", (q: any) => q.eq("status", "Completed"))
      .collect();
    events.sort((a: any, b: any) => b._creationTime - a._creationTime);

    return Promise.all(
      events.map(async (event: any) => {
        const pitching = await Promise.all(
          event.pitchingStartups.map((id: any) => ctx.db.get(id)),
        );
        return {
          ...event,
          pitching: pitching.filter(Boolean).map((s: any) => ({
            name: s.name,
            slug: s.slug,
            pitch: s.pitch,
            sector: s.sector,
            stage: s.stage,
            logoUrl: s.logoUrl,
          })),
        };
      }),
    );
  },
});

const MAX_PITCHING = 4;

// ---- Admin (Roast My Startup pitch-slot picker) ----
// v1 has no authentication — see /admin for the same warning shown in-app.

export const adminGetPitchApplications = query({
  args: { eventId: v.optional(v.id("events")) },
  handler: async (ctx, args) => {
    const event =
      (args.eventId && (await ctx.db.get(args.eventId))) ??
      (await ctx.db
        .query("events")
        .withIndex("by_status", (q: any) => q.eq("status", "Live"))
        .first()) ??
      (await ctx.db
        .query("events")
        .withIndex("by_status", (q: any) => q.eq("status", "Upcoming"))
        .first());
    if (!event) return null;

    const apps = await ctx.db
      .query("pitchApplications")
      .withIndex("by_event", (q: any) => q.eq("eventId", event._id))
      .collect();
    apps.sort((a: any, b: any) => a.createdAt - b.createdAt);

    const selectedCount = apps.filter((a: any) => a.status === "Selected").length;

    return {
      event: { _id: event._id, title: event.title, volume: event.volume, date: event.date },
      selectedCount,
      maxPitching: MAX_PITCHING,
      applications: apps,
    };
  },
});

export const selectForPitch = mutation({
  args: { applicationId: v.id("pitchApplications") },
  handler: async (ctx, args) => {
    const app = await ctx.db.get(args.applicationId);
    if (!app) throw new Error("Application not found");
    if (app.status === "Selected") return { ok: true };

    const event = await ctx.db.get(app.eventId);
    if (!event) throw new Error("Event not found");
    if (event.pitchingStartups.length >= MAX_PITCHING) {
      throw new Error(`Only ${MAX_PITCHING} startups can be selected — deselect one first.`);
    }

    await ctx.db.patch(args.applicationId, { status: "Selected" });
    if (app.startupId && !event.pitchingStartups.includes(app.startupId)) {
      await ctx.db.patch(event._id, {
        pitchingStartups: [...event.pitchingStartups, app.startupId],
      });
    }
    return { ok: true };
  },
});

export const deselectFromPitch = mutation({
  args: { applicationId: v.id("pitchApplications") },
  handler: async (ctx, args) => {
    const app = await ctx.db.get(args.applicationId);
    if (!app) throw new Error("Application not found");

    const event = await ctx.db.get(app.eventId);
    if (event && app.startupId) {
      await ctx.db.patch(event._id, {
        pitchingStartups: event.pitchingStartups.filter(
          (id: any) => id !== app.startupId,
        ),
      });
    }
    await ctx.db.patch(args.applicationId, { status: "Pending" });
    return { ok: true };
  },
});

export const setPitchApplicationStatus = mutation({
  args: {
    applicationId: v.id("pitchApplications"),
    status: v.string(), // "Pending" | "Shortlisted" | "Waitlisted" | "Rejected"
  },
  handler: async (ctx, args) => {
    const app = await ctx.db.get(args.applicationId);
    if (!app) throw new Error("Application not found");
    if (app.status === "Selected") {
      throw new Error("Deselect the startup from the pitch lineup first.");
    }
    await ctx.db.patch(args.applicationId, { status: args.status });
    return { ok: true };
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

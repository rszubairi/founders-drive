import { internalMutation, query } from "./_generated/server";
import { v } from "convex/values";

/** Called by the email helper after every send attempt. */
export const record = internalMutation({
  args: {
    to: v.string(),
    subject: v.string(),
    kind: v.string(),
    status: v.string(),
    reason: v.optional(v.string()),
    providerId: v.optional(v.string()),
    meta: v.optional(v.string()),
  },
  handler: async (ctx, a) => {
    await ctx.db.insert("emailLog", { ...a, createdAt: Date.now() });
  },
});

/** Admin — the email log, newest first. v1 has no auth on this. */
export const listEmailLog = query({
  args: {
    status: v.optional(v.string()),
    kind: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, a) => {
    let rows = await ctx.db
      .query("emailLog")
      .order("desc")
      .take(Math.min(a.limit ?? 200, 500));
    if (a.status) rows = rows.filter((r) => r.status === a.status);
    if (a.kind) rows = rows.filter((r) => r.kind === a.kind);
    return rows.map((r) => ({
      _id: r._id,
      to: r.to,
      subject: r.subject,
      kind: r.kind,
      status: r.status,
      reason: r.reason ?? null,
      providerId: r.providerId ?? null,
      meta: r.meta ?? null,
      createdAt: r.createdAt,
    }));
  },
});

export const emailLogStats = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query("emailLog").collect();
    const n = (s: string) => rows.filter((r) => r.status === s).length;
    return { total: rows.length, sent: n("sent"), skipped: n("skipped"), error: n("error") };
  },
});

/** What the deployment thinks its email config is (reads process.env). */
export const emailConfig = query({
  args: {},
  handler: async () => {
    const from = process.env.EMAILS_FROM ?? null;
    return {
      hasApiKey: !!process.env.RESEND_API_KEY,
      from: from ?? "onboarding@resend.dev",
      usingTestSender: !from || /@resend\.dev\s*>?$/.test(from),
      siteUrl: process.env.SITE_URL ?? null,
      adminEmail: process.env.ADMIN_EMAIL ?? null,
    };
  },
});

import { action, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

/**
 * Stripe Checkout for outreach credit packs. No SDK — raw form-encoded calls.
 *
 * Convex env vars:
 *   STRIPE_SECRET_KEY       sk_test_… / sk_live_…
 *   STRIPE_WEBHOOK_SECRET   whsec_… (from the webhook endpoint you create for
 *                           <your Convex site URL>/stripe/webhook)
 *   SITE_URL                used for success/cancel redirects
 */

export const PACKS: Record<string, { credits: number; amount: number; label: string }> = {
  starter: { credits: 5, amount: 9900, label: "Starter — 5 intros" },
  growth: { credits: 20, amount: 34900, label: "Growth — 20 intros" },
  scale: { credits: 50, amount: 74900, label: "Scale — 50 intros" },
};
const CURRENCY = "myr";

function form(obj: Record<string, string | number>) {
  return Object.entries(obj)
    .map(([k, val]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(val))}`)
    .join("&");
}

export const _founderAccountForToken = internalQuery({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const s = await ctx.db
      .query("founderSessions")
      .withIndex("by_token", (q) => q.eq("token", token))
      .unique();
    if (!s || s.expiresAt < Date.now()) return null;
    return { accountId: s.accountId, email: s.email };
  },
});

export const _recordCheckout = internalMutation({
  args: {
    sessionId: v.string(),
    founderAccountId: v.id("founderAccounts"),
    credits: v.number(),
  },
  handler: async (ctx, a) => {
    await ctx.db.insert("stripeCheckouts", {
      sessionId: a.sessionId,
      founderAccountId: a.founderAccountId,
      credits: a.credits,
      status: "pending",
      createdAt: Date.now(),
    });
  },
});

export const createCheckout = action({
  args: { token: v.string(), pack: v.string() },
  handler: async (ctx, a): Promise<{ url: string }> => {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("Payments aren't set up yet (STRIPE_SECRET_KEY missing).");
    const pack = PACKS[a.pack];
    if (!pack) throw new Error("Unknown pack.");

    const who: { accountId: string; email: string } | null = await ctx.runQuery(
      internal.stripe._founderAccountForToken,
      { token: a.token },
    );
    if (!who) throw new Error("Please sign in again.");

    const base = (process.env.SITE_URL ?? "http://localhost:3000").replace(/\/+$/, "");
    const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: form({
        mode: "payment",
        "line_items[0][price_data][currency]": CURRENCY,
        "line_items[0][price_data][product_data][name]": `Founders Drive — ${pack.label}`,
        "line_items[0][price_data][unit_amount]": pack.amount,
        "line_items[0][quantity]": 1,
        success_url: `${base}/dashboard?purchase=success`,
        cancel_url: `${base}/dashboard?purchase=cancelled`,
        customer_email: who.email,
        "metadata[founderAccountId]": who.accountId,
        "metadata[credits]": pack.credits,
      }),
    });
    const json = (await res.json()) as { id?: string; url?: string; error?: { message: string } };
    if (!res.ok || !json.url || !json.id) {
      throw new Error(json.error?.message ?? "Stripe checkout failed.");
    }
    await ctx.runMutation(internal.stripe._recordCheckout, {
      sessionId: json.id,
      founderAccountId: who.accountId as never,
      credits: pack.credits,
    });
    return { url: json.url };
  },
});

/* ------------------------- webhook fulfilment --------------------------- */

export const _fulfilCheckout = internalMutation({
  args: { eventId: v.string(), sessionId: v.string() },
  handler: async (ctx, a) => {
    const seen = await ctx.db
      .query("stripeWebhookEvents")
      .withIndex("by_event", (q) => q.eq("eventId", a.eventId))
      .unique();
    if (seen) return { ok: true, duplicate: true };
    await ctx.db.insert("stripeWebhookEvents", {
      eventId: a.eventId,
      type: "checkout.session.completed",
      createdAt: Date.now(),
    });

    const checkout = await ctx.db
      .query("stripeCheckouts")
      .withIndex("by_session", (q) => q.eq("sessionId", a.sessionId))
      .unique();
    if (!checkout || checkout.status === "complete") return { ok: true };

    await ctx.db.patch(checkout._id, { status: "complete" });
    await ctx.runMutation(internal.outreach._addCredits, {
      founderAccountId: checkout.founderAccountId,
      credits: checkout.credits,
    });
    return { ok: true };
  },
});

import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

const http = httpRouter();

async function hmacHex(secret: string, message: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

http.route({
  path: "/stripe/webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    const sigHeader = request.headers.get("stripe-signature");
    const payload = await request.text();

    if (!secret || !sigHeader) {
      return new Response("not configured", { status: 400 });
    }
    const parts = Object.fromEntries(
      sigHeader.split(",").map((p) => {
        const i = p.indexOf("=");
        return [p.slice(0, i), p.slice(i + 1)];
      }),
    );
    const expected = await hmacHex(secret, `${parts.t}.${payload}`);
    const v1s = sigHeader
      .split(",")
      .filter((p) => p.startsWith("v1="))
      .map((p) => p.slice(3));
    if (!v1s.some((s) => s === expected)) {
      return new Response("bad signature", { status: 400 });
    }

    let event: any;
    try {
      event = JSON.parse(payload);
    } catch {
      return new Response("bad json", { status: 400 });
    }

    if (event.type === "checkout.session.completed") {
      await ctx.runMutation(internal.stripe._fulfilCheckout, {
        eventId: event.id,
        sessionId: event.data.object.id,
      });
    }
    return new Response("ok", { status: 200 });
  }),
});

export default http;

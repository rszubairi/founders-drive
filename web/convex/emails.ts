import { internalAction, action } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

/**
 * Transactional email via the Resend REST API. Every attempt is written to the
 * `emailLog` table (see /admin/emails).
 *
 * Convex env vars (set with `npx convex env set NAME value [--prod]`, or the dashboard):
 *   RESEND_API_KEY   required to actually send — unset = log "skipped", nothing sent
 *   EMAILS_FROM      e.g. "Founders Drive <hello@yourdomain.my>" — must be a
 *                    Resend-verified domain. The default onboarding@resend.dev
 *                    only delivers to the Resend account owner's own address.
 *   SITE_URL         base URL for links in emails (prod: your Vercel domain)
 *   ADMIN_EMAIL      where profile-claim notices are also sent
 */

const RESEND_ENDPOINT = "https://api.resend.com/emails";

async function send(
  ctx: { runMutation: (ref: any, args: any) => Promise<unknown> },
  opts: {
    to: string | string[];
    subject: string;
    html: string;
    kind: string;
    meta?: Record<string, string>;
    replyTo?: string;
  },
) {
  const toStr = Array.isArray(opts.to) ? opts.to.join(", ") : opts.to;
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAILS_FROM ?? "Founders Drive <onboarding@resend.dev>";
  const logBase = {
    to: toStr,
    subject: opts.subject,
    kind: opts.kind,
    meta: opts.meta ? JSON.stringify(opts.meta) : undefined,
  };
  const log = (extra: Record<string, unknown>) =>
    ctx.runMutation(internal.emailLog.record, { ...logBase, ...extra });

  if (!key) {
    console.warn(`[emails] RESEND_API_KEY not set — skipped "${opts.subject}" -> ${toStr}`);
    await log({ status: "skipped", reason: "RESEND_API_KEY not set on this deployment" });
    return { id: null, skipped: true };
  }

  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: opts.to,
        subject: opts.subject,
        html: opts.html,
        reply_to: opts.replyTo,
      }),
    });
    const text = await res.text();
    if (!res.ok) {
      await log({ status: "error", reason: `Resend ${res.status}: ${text.slice(0, 400)}` });
      throw new Error(`Resend ${res.status}: ${text}`);
    }
    const json = JSON.parse(text) as { id: string };
    await log({ status: "sent", providerId: json.id });
    return json;
  } catch (e) {
    const msg = (e as Error).message ?? String(e);
    if (!msg.startsWith("Resend ")) {
      await log({ status: "error", reason: msg.slice(0, 400) });
    }
    throw e;
  }
}

function site() {
  return (process.env.SITE_URL ?? "http://localhost:3000").replace(/\/+$/, "");
}

function shell(title: string, inner: string) {
  return `<!doctype html><html><body style="margin:0;background:#f4ece0;padding:32px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1a1512">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
<table role="presentation" width="520" cellpadding="0" cellspacing="0" style="max-width:520px;background:#fffdf9;border:1px solid rgba(26,21,18,.1);border-radius:16px;overflow:hidden">
<tr><td style="background:#17120e;padding:18px 28px;color:#fbf7f1;font-size:15px;letter-spacing:.03em">FOUNDERS&nbsp;DRIVE</td></tr>
<tr><td style="padding:28px">
<h1 style="margin:0 0 14px;font-size:21px;font-weight:600;letter-spacing:-.01em">${title}</h1>
${inner}
</td></tr>
<tr><td style="padding:16px 28px;border-top:1px solid rgba(26,21,18,.08);color:#9b8e7f;font-size:12px">Founders Drive &middot; The Malaysian startup ecosystem &middot; Kuala Lumpur</td></tr>
</table></td></tr></table></body></html>`;
}

function btn(href: string, label: string) {
  return `<a href="${href}" style="display:inline-block;background:#c6410a;color:#fff7f0;text-decoration:none;padding:12px 22px;border-radius:999px;font-size:14px;font-weight:500">${label}</a>`;
}
const p = (t: string) =>
  `<p style="margin:0 0 14px;font-size:15px;line-height:1.6">${t}</p>`;

/* ------------------------------------------------------------------ */

export const sendRegistrationReceived = internalAction({
  args: {
    to: v.string(),
    founderName: v.string(),
    companyName: v.string(),
  },
  handler: async (ctx, a) => {
    await send(ctx, {
      kind: "registration_received",
      meta: { company: a.companyName },
      to: a.to,
      subject: `We've got ${a.companyName}'s registration`,
      html: shell(
        `Thanks, ${a.founderName}.`,
        p(`<b>${a.companyName}</b> is registered on Founders Drive and is now with the team for review — we check new profiles within a few working days.`) +
          p(`You'll get an email the moment it's approved. That email also explains how to put your startup forward for the next <b>Roast My Startup</b>.`) +
          p(`<span style="color:#9b8e7f;font-size:13px">Your contact details stay private either way.</span>`),
      ),
    });
  },
});

export const sendStartupApproved = internalAction({
  args: {
    to: v.string(),
    founderName: v.string(),
    companyName: v.string(),
    slug: v.string(),
    eventTitle: v.optional(v.string()),
  },
  handler: async (ctx, a) => {
    const profile = `${site()}/directory/${a.slug}`;
    const roast = `${site()}/roast-my-startup`;
    await send(ctx, {
      kind: "startup_approved",
      meta: { company: a.companyName, slug: a.slug },
      to: a.to,
      subject: `${a.companyName} is approved on Founders Drive`,
      html: shell(
        `You're in, ${a.founderName}.`,
        p(`<b>${a.companyName}</b> is now live in the Malaysian startup directory. Add your logo, team photos, press and the programmes you've been through from the profile.`) +
          `<p style="margin:6px 0 16px">${btn(profile, "Open your profile")}</p>` +
          p(`<b>Want to pitch at ${a.eventTitle ?? "Roast My Startup"}?</b> On the event page, hit <b>Roast Me</b> to put your startup forward. The team picks the four founders who go on stage.`) +
          `<p style="margin:6px 0 0">${btn(roast, "Go to the event page")}</p>`,
      ),
    });
  },
});

export const sendClaimVerification = internalAction({
  args: {
    to: v.string(),
    claimantName: v.string(),
    companyName: v.string(),
    token: v.string(),
  },
  handler: async (ctx, a) => {
    const url = `${site()}/claim/verify?token=${a.token}`;
    await send(ctx, {
      kind: "claim_verification",
      meta: { company: a.companyName },
      to: a.to,
      subject: `Confirm your claim to ${a.companyName}`,
      html: shell(
        `Confirm this email address`,
        p(`${a.claimantName}, you asked to manage the <b>${a.companyName}</b> profile on Founders Drive. Confirm you control this email address to continue.`) +
          `<p style="margin:6px 0 14px">${btn(url, "Confirm my email")}</p>` +
          p(`<span style="color:#9b8e7f;font-size:13px">If this wasn&rsquo;t you, ignore this email &mdash; nothing changes.</span>`),
      ),
    });
  },
});

export const sendClaimNotice = internalAction({
  args: {
    ownerEmail: v.optional(v.string()),
    companyName: v.string(),
    slug: v.string(),
    claimantName: v.string(),
    claimantEmail: v.string(),
    claimantRole: v.string(),
    note: v.optional(v.string()),
    evidenceUrl: v.optional(v.string()),
  },
  handler: async (ctx, a) => {
    const admin = process.env.ADMIN_EMAIL;
    const to = [a.ownerEmail, admin].filter(Boolean) as string[];
    if (to.length === 0) return;
    const review = `${site()}/admin/claims`;
    try {
      await send(ctx, {
        kind: "claim_notice",
        meta: { company: a.companyName },
        to,
        replyTo: a.claimantEmail,
        subject: `Profile claim: ${a.companyName}`,
        html: shell(
          `Someone wants to manage ${a.companyName}`,
          p(`<b>${a.claimantName}</b> (${a.claimantRole}) &mdash; ${a.claimantEmail}`) +
            (a.note ? p(`&ldquo;${a.note}&rdquo;`) : "") +
            (a.evidenceUrl ? p(`Evidence: <a href="${a.evidenceUrl}">${a.evidenceUrl}</a>`) : "") +
            p(`They&rsquo;ve verified their email. It did not match the company domain, so it needs a human decision.`) +
            `<p style="margin:6px 0 0">${btn(review, "Review claims")}</p>`,
        ),
      });
    } catch (e) {
      console.error("[emails] claim notice failed:", (e as Error).message);
    }
  },
});

export const sendClaimDecision = internalAction({
  args: {
    to: v.string(),
    claimantName: v.string(),
    companyName: v.string(),
    approved: v.boolean(),
    slug: v.string(),
  },
  handler: async (ctx, a) => {
    const url = `${site()}/directory/${a.slug}`;
    try {
      await send(ctx, {
        kind: a.approved ? "claim_approved" : "claim_rejected",
        meta: { company: a.companyName },
        to: a.to,
        subject: a.approved
          ? `You now manage ${a.companyName} on Founders Drive`
          : `Update on your claim to ${a.companyName}`,
        html: a.approved
          ? shell(
              `Claim approved`,
              p(`${a.claimantName}, you&rsquo;re now the verified contact for <b>${a.companyName}</b>. Introduction requests will come to you.`) +
                `<p style="margin:6px 0 0">${btn(url, "Open the profile")}</p>`,
            )
          : shell(
              `Claim not approved`,
              p(`We couldn&rsquo;t verify your connection to <b>${a.companyName}</b> right now. Reply to this email with more detail (a company email address, or a colleague who can vouch) and we&rsquo;ll take another look.`),
            ),
      });
    } catch (e) {
      console.error("[emails] claim decision failed:", (e as Error).message);
    }
  },
});

/**
 * Fire a test email to check Resend + domain wiring.
 *   npx convex run emails:sendTest '{"to":"you@example.com"}' [--prod]
 * Also called from /admin/emails.
 */
export const sendTest = action({
  args: { to: v.string() },
  handler: async (ctx, { to }) => {
    const res = await send(ctx, {
      kind: "test",
      to,
      subject: "Founders Drive — test email",
      html: shell(
        "It works.",
        p("If this landed in your inbox, Resend and your sending domain are wired correctly."),
      ),
    });
    return res;
  },
});

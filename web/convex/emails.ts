import { internalAction } from "./_generated/server";
import { v } from "convex/values";

/**
 * Transactional email via the Resend REST API.
 *
 * Convex env vars (set with `npx convex env set NAME value`, or the dashboard):
 *   RESEND_API_KEY   required to actually send — unset = log-and-skip (dev)
 *   EMAILS_FROM      e.g. "Founders Drive <hello@yourdomain.my>"
 *   SITE_URL         base URL for links in emails (prod: your Vercel domain)
 *   ADMIN_EMAIL      where profile-claim notices are also sent
 */

const RESEND_ENDPOINT = "https://api.resend.com/emails";

async function send(opts: {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAILS_FROM ?? "Founders Drive <onboarding@resend.dev>";
  if (!key) {
    console.warn(
      `[emails] RESEND_API_KEY not set — skipped "${opts.subject}" -> ${opts.to}`,
    );
    return { id: null, skipped: true };
  }
  const res = await fetch(RESEND_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      reply_to: opts.replyTo,
    }),
  });
  if (!res.ok) {
    throw new Error(`Resend ${res.status}: ${await res.text()}`);
  }
  return (await res.json()) as { id: string };
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

export const sendFounderWelcome = internalAction({
  args: {
    to: v.string(),
    founderName: v.string(),
    companyName: v.string(),
    slug: v.string(),
    appliedToRoast: v.boolean(),
  },
  handler: async (_ctx, a) => {
    const url = `${site()}/directory/${a.slug}`;
    await send({
      to: a.to,
      subject: `${a.companyName} is on Founders Drive`,
      html: shell(
        `Welcome, ${a.founderName}.`,
        p(`<b>${a.companyName}</b> is now listed in the Malaysian startup directory. Your contact details stay private &mdash; introductions are always yours to accept or decline.`) +
          (a.appliedToRoast
            ? p(`Your <b>Roast My Startup &mdash; Vol.&nbsp;02</b> application is in. We confirm the four pitching startups two weeks before the event.`)
            : "") +
          p(`Review or update the profile any time:`) +
          `<p style="margin:6px 0 0">${btn(url, "View your profile")}</p>`,
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
  handler: async (_ctx, a) => {
    const url = `${site()}/claim/verify?token=${a.token}`;
    await send({
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
  handler: async (_ctx, a) => {
    const admin = process.env.ADMIN_EMAIL;
    const to = [a.ownerEmail, admin].filter(Boolean) as string[];
    if (to.length === 0) return;
    const review = `${site()}/admin/claims`;
    try {
      await send({
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
  handler: async (_ctx, a) => {
    const url = `${site()}/directory/${a.slug}`;
    try {
      await send({
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

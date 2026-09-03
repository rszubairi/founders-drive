import { query, mutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

const FREE_MAIL = new Set([
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "ymail.com",
  "hotmail.com",
  "outlook.com",
  "live.com",
  "icloud.com",
  "me.com",
  "proton.me",
  "protonmail.com",
  "aol.com",
  "gmx.com",
]);

function domainOf(email: string): string | null {
  const m = email.trim().toLowerCase().match(/@([a-z0-9.-]+)$/);
  return m ? m[1] : null;
}

function siteDomain(url?: string | null): string | null {
  if (!url) return null;
  try {
    const u = new URL(url.startsWith("http") ? url : `https://${url}`);
    return u.hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return null;
  }
}

function domainsRelated(a: string, b: string): boolean {
  if (a === b) return true;
  // allow subdomain / apex relationship (mail.acme.com ~ acme.com)
  return a.endsWith(`.${b}`) || b.endsWith(`.${a}`);
}

/** Is this startup profile already owned by a verified email? */
export const claimStatus = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const s = await ctx.db
      .query("startups")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    if (!s) return null;
    return { claimed: !!s.claimedByEmail, claimedAt: s.claimedAt ?? null };
  },
});

/**
 * Start a claim. Anyone can submit; they must then verify control of the email
 * (link sent by Resend). A business-domain match auto-approves on verification;
 * anything else goes to manual review.
 */
export const submitClaim = mutation({
  args: {
    slug: v.string(),
    claimantName: v.string(),
    claimantEmail: v.string(),
    claimantRole: v.string(),
    note: v.optional(v.string()),
    evidenceUrl: v.optional(v.string()),
  },
  handler: async (ctx, a) => {
    const s = await ctx.db
      .query("startups")
      .withIndex("by_slug", (q) => q.eq("slug", a.slug))
      .unique();
    if (!s) throw new Error("Startup not found");

    const email = a.claimantEmail.trim().toLowerCase();
    const cd = domainOf(email);
    if (!cd || !a.claimantName.trim() || !a.claimantRole.trim()) {
      throw new Error("Name, role and a valid email are required.");
    }

    if (s.claimedByEmail && s.claimedByEmail.toLowerCase() === email) {
      return { status: "already_yours" as const };
    }

    const isFreeMail = FREE_MAIL.has(cd);

    // reuse an open claim from the same email rather than stacking duplicates
    const open = (
      await ctx.db
        .query("profileClaims")
        .withIndex("by_startup", (q) => q.eq("startupId", s._id))
        .collect()
    ).find(
      (c) =>
        c.claimantEmail === email &&
        (c.status === "pending" || c.status === "verifying"),
    );
    if (open) {
      await ctx.scheduler.runAfter(0, internal.emails.sendClaimVerification, {
        to: email,
        claimantName: a.claimantName,
        companyName: s.name,
        token: open.verifyToken,
      });
      return { status: "pending" as const, resent: true };
    }

    // domain match against the company website + non-freemail founder emails
    const domains = new Set<string>();
    const sd = siteDomain(s.website);
    if (sd) domains.add(sd);
    const founders = await ctx.db
      .query("founders")
      .withIndex("by_startup", (q) => q.eq("startupId", s._id))
      .collect();
    for (const f of founders) {
      const d = domainOf(f.email);
      if (d && !FREE_MAIL.has(d)) domains.add(d);
    }
    const domainMatch =
      !isFreeMail && [...domains].some((d) => domainsRelated(cd, d));

    const token = crypto.randomUUID().replace(/-/g, "");
    await ctx.db.insert("profileClaims", {
      startupId: s._id,
      claimantName: a.claimantName.trim(),
      claimantEmail: email,
      claimantRole: a.claimantRole.trim(),
      note: a.note?.trim() || undefined,
      evidenceUrl: a.evidenceUrl?.trim() || undefined,
      status: "pending",
      verifyToken: token,
      domainMatch,
      isFreeMail,
      createdAt: Date.now(),
    });

    await ctx.scheduler.runAfter(0, internal.emails.sendClaimVerification, {
      to: email,
      claimantName: a.claimantName.trim(),
      companyName: s.name,
      token,
    });

    return { status: "pending" as const, domainMatch };
  },
});

/** Called from /claim/verify — the claimant clicked the emailed link. */
export const verifyClaim = mutation({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const claim = await ctx.db
      .query("profileClaims")
      .withIndex("by_token", (q) => q.eq("verifyToken", token))
      .unique();
    if (!claim) return { ok: false as const, reason: "not_found" as const };

    const startup = await ctx.db.get(claim.startupId);
    if (!startup) return { ok: false as const, reason: "not_found" as const };

    if (claim.status === "approved") {
      return { ok: true as const, status: "approved" as const, slug: startup.slug };
    }
    if (claim.status === "rejected") {
      return { ok: false as const, reason: "rejected" as const, slug: startup.slug };
    }

    if (!claim.emailVerifiedAt) {
      await ctx.db.patch(claim._id, { emailVerifiedAt: Date.now() });
    }

    const founders = await ctx.db
      .query("founders")
      .withIndex("by_startup", (q) => q.eq("startupId", startup._id))
      .collect();

    // auto-approve: verified business-domain email + nobody owns the profile yet
    if (claim.domainMatch && !startup.claimedByEmail) {
      await ctx.db.patch(claim._id, {
        status: "approved",
        decidedAt: Date.now(),
        decidedBy: "auto:domain-match",
      });
      await ctx.db.patch(startup._id, {
        claimedByEmail: claim.claimantEmail,
        claimedAt: Date.now(),
      });
      if (!founders.some((f) => f.email.toLowerCase() === claim.claimantEmail)) {
        await ctx.db.insert("founders", {
          startupId: startup._id,
          name: claim.claimantName,
          role: claim.claimantRole,
          email: claim.claimantEmail,
          isPrimary: founders.length === 0,
        });
      }
      await ctx.scheduler.runAfter(0, internal.emails.sendClaimDecision, {
        to: claim.claimantEmail,
        claimantName: claim.claimantName,
        companyName: startup.name,
        approved: true,
        slug: startup.slug,
      });
      return { ok: true as const, status: "approved" as const, slug: startup.slug };
    }

    // otherwise: manual review — notify the current owner + admin
    if (claim.status !== "verifying") {
      await ctx.db.patch(claim._id, { status: "verifying" });
    }
    const owner = founders.find((f) => f.isPrimary) ?? founders[0];
    await ctx.scheduler.runAfter(0, internal.emails.sendClaimNotice, {
      ownerEmail: owner?.email,
      companyName: startup.name,
      slug: startup.slug,
      claimantName: claim.claimantName,
      claimantEmail: claim.claimantEmail,
      claimantRole: claim.claimantRole,
      note: claim.note,
      evidenceUrl: claim.evidenceUrl,
    });
    return { ok: true as const, status: "verifying" as const, slug: startup.slug };
  },
});

/* ---------------- admin review (no auth in v1 — gate before launch) -------- */

export const listClaims = query({
  args: { status: v.optional(v.string()) },
  handler: async (ctx, { status }) => {
    let rows = await ctx.db.query("profileClaims").order("desc").collect();
    if (status) rows = rows.filter((r) => r.status === status);
    return Promise.all(
      rows.map(async (r) => {
        const s = await ctx.db.get(r.startupId);
        return {
          _id: r._id,
          startup: s?.name ?? "—",
          slug: s?.slug ?? "",
          claimedByEmail: s?.claimedByEmail ?? null,
          claimantName: r.claimantName,
          claimantEmail: r.claimantEmail,
          claimantRole: r.claimantRole,
          note: r.note ?? null,
          evidenceUrl: r.evidenceUrl ?? null,
          status: r.status,
          domainMatch: r.domainMatch,
          isFreeMail: r.isFreeMail,
          emailVerified: !!r.emailVerifiedAt,
          createdAt: r.createdAt,
        };
      }),
    );
  },
});

export const decideClaim = mutation({
  args: {
    claimId: v.id("profileClaims"),
    approve: v.boolean(),
    reviewer: v.optional(v.string()),
  },
  handler: async (ctx, { claimId, approve, reviewer }) => {
    const claim = await ctx.db.get(claimId);
    if (!claim) throw new Error("Claim not found");
    const startup = await ctx.db.get(claim.startupId);
    if (!startup) throw new Error("Startup not found");

    await ctx.db.patch(claimId, {
      status: approve ? "approved" : "rejected",
      decidedAt: Date.now(),
      decidedBy: reviewer?.trim() || "admin",
    });

    if (approve) {
      await ctx.db.patch(startup._id, {
        claimedByEmail: claim.claimantEmail,
        claimedAt: Date.now(),
      });
      const founders = await ctx.db
        .query("founders")
        .withIndex("by_startup", (q) => q.eq("startupId", startup._id))
        .collect();
      if (!founders.some((f) => f.email.toLowerCase() === claim.claimantEmail)) {
        await ctx.db.insert("founders", {
          startupId: startup._id,
          name: claim.claimantName,
          role: claim.claimantRole,
          email: claim.claimantEmail,
          isPrimary: founders.length === 0,
        });
      }
    }

    await ctx.scheduler.runAfter(0, internal.emails.sendClaimDecision, {
      to: claim.claimantEmail,
      claimantName: claim.claimantName,
      companyName: startup.name,
      approved: approve,
      slug: startup.slug,
    });
    return { ok: true };
  },
});

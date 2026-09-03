/**
 * Shared v1 authorization helpers. No real auth yet — a startup "owner" is
 * whoever knows an email that is on the profile (claimed email or a founder
 * email). Replace with real auth before launch.
 */

export async function requireStartupOwner(
  ctx: any,
  slug: string,
  ownerEmail: string,
) {
  const startup = await ctx.db
    .query("startups")
    .withIndex("by_slug", (q: any) => q.eq("slug", slug))
    .unique();
  if (!startup) throw new Error("Startup not found");

  const email = ownerEmail.trim().toLowerCase();
  const founders = await ctx.db
    .query("founders")
    .withIndex("by_startup", (q: any) => q.eq("startupId", startup._id))
    .collect();

  const ok =
    (startup.claimedByEmail && startup.claimedByEmail.toLowerCase() === email) ||
    founders.some((f: any) => f.email.toLowerCase() === email);

  if (!ok) {
    throw new Error(
      "That email isn't on this profile. Claim the profile first, then manage it with that email.",
    );
  }
  return { startup, founders };
}

export async function resolveImg(
  ctx: any,
  storageId: unknown,
  fallback: string | undefined,
): Promise<string | null> {
  if (storageId) {
    const u = await ctx.storage.getUrl(storageId);
    if (u) return u;
  }
  return fallback ?? null;
}

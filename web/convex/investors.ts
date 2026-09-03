import { query } from "./_generated/server";
import { v } from "convex/values";

export const listInvestors = query({
  args: { sector: v.optional(v.string()), stage: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let rows = await ctx.db.query("investors").collect();
    if (args.sector)
      rows = rows.filter((r: any) => r.sectors.includes(args.sector));
    if (args.stage)
      rows = rows.filter((r: any) => r.stagePreferences.includes(args.stage));
    return rows.sort((a: any, b: any) => Number(b.isVerified) - Number(a.isVerified));
  },
});

/**
 * VC matching — score a startup against every investor on sector, stage,
 * geography, ticket size and fundraising status, and explain the score.
 */
export const matchStartupToVCs = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const startup = await ctx.db
      .query("startups")
      .withIndex("by_slug", (q: any) => q.eq("slug", args.slug))
      .unique();
    if (!startup) return [];
    const investors = await ctx.db.query("investors").collect();

    const matches = investors.map((inv: any) => {
      const reasons: string[] = [];
      let score = 0;

      if (inv.sectors.includes(startup.sector)) {
        score += 40;
        reasons.push(`Invests in ${startup.sector}`);
      } else if (inv.sectors.includes("Sector agnostic")) {
        score += 20;
        reasons.push("Sector agnostic");
      }

      if (inv.stagePreferences.includes(startup.stage)) {
        score += 30;
        reasons.push(`Backs ${startup.stage} rounds`);
      }

      if (inv.geography.includes("Malaysia") || inv.geography.includes("SEA")) {
        score += 15;
        reasons.push("Active in Malaysia / SEA");
      }

      if (startup.fundStatus === "Raising now" || startup.fundStatus === "Open to intros") {
        score += 10;
        reasons.push("Startup is open to investor conversations");
      }

      if ((startup.momentumScore ?? 0) >= 65) {
        score += 5;
        reasons.push("Strong momentum signal");
      }

      return {
        investor: inv,
        score: Math.min(100, score),
        reasons,
      };
    });

    return matches
      .filter((m) => m.score > 0)
      .sort((a, b) => b.score - a.score);
  },
});

import { query } from "convex/server";
import { v } from "convex/values";

export const getInvestors = query({
  args: {
    sector: v.optional(v.string()),
    stage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let list = await ctx.db.query("investors").collect();
    if (args.sector) {
      list = list.filter((inv) =>
        inv.sectors.some((s) => s.toLowerCase().includes(args.sector!.toLowerCase()))
      );
    }
    if (args.stage) {
      list = list.filter((inv) =>
        inv.stagePreferences.some((st) => st.toLowerCase().includes(args.stage!.toLowerCase()))
      );
    }
    return list;
  },
});

export const matchStartupWithInvestors = query({
  args: { startupId: v.id("startups") },
  handler: async (ctx, args) => {
    const startup = await ctx.db.get(args.startupId);
    if (!startup) return [];

    const investors = await ctx.db.query("investors").collect();

    return investors.map((inv) => {
      let matchScore = 50; // base score
      const reasons: string[] = [];

      // Sector matching
      if (inv.sectors.some((s) => s.toLowerCase().includes(startup.sector.toLowerCase()))) {
        matchScore += 25;
        reasons.push(`Invests in ${startup.sector}`);
      }

      // Stage matching
      if (inv.stagePreferences.some((st) => st.toLowerCase() === startup.stage.toLowerCase())) {
        matchScore += 20;
        reasons.push(`Active at ${startup.stage} stage`);
      }

      // Geo matching
      if (inv.geography.includes("Malaysia") || inv.geography.includes("SEA")) {
        matchScore += 5;
        reasons.push("Mandate includes Malaysia");
      }

      return {
        investor: inv,
        matchScore: Math.min(98, matchScore),
        reasons,
      };
    }).sort((a, b) => b.matchScore - a.matchScore);
  },
});

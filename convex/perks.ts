import { query } from "convex/server";
import { v } from "convex/values";

export const getPerks = query({
  args: {
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let list = await ctx.db.query("founderPerks").collect();
    if (args.category) {
      list = list.filter((p) => p.category.toLowerCase() === args.category?.toLowerCase());
    }
    return list;
  },
});

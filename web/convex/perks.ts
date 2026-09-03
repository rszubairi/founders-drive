import { query } from "./_generated/server";

export const listPerks = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query("founderPerks").collect();
    return rows.sort((a: any, b: any) => a.category.localeCompare(b.category));
  },
});

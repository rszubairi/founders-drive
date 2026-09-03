import { mutation } from "./_generated/server";

/**
 * Short-lived URL the browser POSTs a file to. Returns a storageId the client
 * then hands to a mutation (setStartupLogo / setFounderPhoto / setInvestorLogo).
 *
 * v1 has no auth — anyone can request an upload URL. The mutations that *attach*
 * an image are email-gated (startup owner) or admin-only (investor).
 */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => await ctx.storage.generateUploadUrl(),
});

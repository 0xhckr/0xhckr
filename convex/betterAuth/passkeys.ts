import { v } from "convex/values";
import { query } from "./_generated/server";

export const hasAny = query({
  args: {},
  returns: v.boolean(),
  handler: async (ctx) => {
    const passkey = await ctx.db.query("passkey").first();
    return passkey !== null;
  },
});

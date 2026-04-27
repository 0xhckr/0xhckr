import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    company: v.string(),
    location: v.optional(v.string()),
    postingPostedAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    return await ctx.db.insert("jobPostings", {
      title: args.title,
      description: args.description,
      company: args.company,
      location: args.location,
      createdAt: Date.now(),
      postingPostedAt: args.postingPostedAt,
    });
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    return await ctx.db.query("jobPostings").order("desc").collect();
  },
});

export const get = query({
  args: { id: v.id("jobPostings") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }
    return await ctx.db.get(args.id);
  },
});

export const update = mutation({
  args: {
    id: v.id("jobPostings"),
    title: v.string(),
    description: v.string(),
    company: v.string(),
    location: v.optional(v.string()),
    postingPostedAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    await ctx.db.patch(args.id, {
      title: args.title,
      description: args.description,
      company: args.company,
      location: args.location,
      postingPostedAt: args.postingPostedAt,
    });
  },
});

export const remove = mutation({
  args: { id: v.id("jobPostings") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    await ctx.db.delete(args.id);
  },
});

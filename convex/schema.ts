import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  resumes: defineTable({
    content: v.string(),
    createdAt: v.number(),
    isFrontFacing: v.boolean(),
    jobPosting: v.optional(v.id("jobPostings")),
  }).index("by_isFrontFacing", ["isFrontFacing"]),
  coverLetters: defineTable({
    content: v.string(),
    createdAt: v.number(),
    jobPosting: v.optional(v.id("jobPostings")),
  }),
  jobPostings: defineTable({
    title: v.string(),
    description: v.string(),
    company: v.string(),
    location: v.optional(v.string()),
    createdAt: v.number(),
    postingPostedAt: v.optional(v.number()),
  }),
});

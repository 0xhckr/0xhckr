import { passkey } from "@better-auth/passkey";
import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { type BetterAuthOptions, betterAuth } from "better-auth/minimal";
import { v } from "convex/values";
import { components } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";
import { query } from "./_generated/server";
import authConfig from "./auth.config";
import authSchema from "./betterAuth/schema";

const ADMIN_EMAIL = "hackr@hackr.sh";
const ADMIN_NAME = "Mohammad Al-Ahdal";

export const authComponent = createClient<DataModel, typeof authSchema>(
  components.betterAuth,
  {
    local: { schema: authSchema },
  },
);

export const createAuthOptions = (ctx: GenericCtx<DataModel>) =>
  ({
    appName: "0xhckr",
    baseURL: process.env.SITE_URL,
    database: authComponent.adapter(ctx),
    plugins: [
      passkey({
        rpName: "0xhckr",
        registration: {
          // Allow passkey registration without a session so the very first
          // passkey can be created. Bootstrapping self-locks: it only works
          // while no passkeys exist and the setup token matches.
          requireSession: false,
          resolveUser: async ({ ctx: authCtx, context }) => {
            const passkeyCount = await authCtx.context.adapter.count({
              model: "passkey",
            });
            if (
              passkeyCount > 0 ||
              !context ||
              context !== process.env.PASSKEY_SETUP_TOKEN
            ) {
              throw new Error("Passkey setup is closed");
            }
            const existing = await authCtx.context.adapter.findOne<{
              id: string;
              name: string;
            }>({
              model: "user",
              where: [{ field: "email", value: ADMIN_EMAIL }],
            });
            if (existing) {
              return { id: existing.id, name: existing.name };
            }
            const now = new Date();
            const created = await authCtx.context.adapter.create<
              Record<string, unknown>,
              { id: string }
            >({
              model: "user",
              data: {
                email: ADMIN_EMAIL,
                name: ADMIN_NAME,
                emailVerified: true,
                createdAt: now,
                updatedAt: now,
              },
            });
            return { id: created.id, name: ADMIN_NAME };
          },
        },
      }),
      convex({ authConfig }),
    ],
  }) satisfies BetterAuthOptions;

export const createAuth = (ctx: GenericCtx<DataModel>) =>
  betterAuth(createAuthOptions(ctx));

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    return authComponent.getAuthUser(ctx);
  },
});

export const hasPasskeys = query({
  args: {},
  returns: v.boolean(),
  handler: async (ctx) => {
    const has: boolean = await ctx.runQuery(
      components.betterAuth.passkeys.hasAny,
    );
    return has;
  },
});

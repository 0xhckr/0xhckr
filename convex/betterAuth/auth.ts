import type { GenericCtx } from "@convex-dev/better-auth/utils";
import type { DataModel } from "../_generated/dataModel";
import { createAuth } from "../auth";

// Static instance used only by the Better Auth CLI for schema generation.
// Do not import at runtime.
export const auth = createAuth({} as GenericCtx<DataModel>);

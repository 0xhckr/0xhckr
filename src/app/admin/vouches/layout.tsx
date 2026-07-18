import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { fetchAuthQuery, isAuthenticated } from "~/lib/auth-server";
import { generatePageMetadata } from "~/lib/metadata";
import { api } from "../../../../convex/_generated/api";

export const metadata: Metadata = generatePageMetadata({
  title: "Admin - Vouches",
  description: "Manage vouches.",
  path: "/admin/vouches",
});

const ALLOWED_EMAIL = "hackr@hackr.sh";

export default async function AdminVouchesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!(await isAuthenticated())) {
    redirect("/sign-in");
  }

  const user = await fetchAuthQuery(api.auth.getCurrentUser);

  if (user.email !== ALLOWED_EMAIL) {
    redirect("/unauthorized");
  }

  return children;
}

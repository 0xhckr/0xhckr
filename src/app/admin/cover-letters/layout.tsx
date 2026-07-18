import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { fetchAuthQuery, isAuthenticated } from "~/lib/auth-server";
import { generatePageMetadata } from "~/lib/metadata";
import { api } from "../../../../convex/_generated/api";

export const metadata: Metadata = generatePageMetadata({
  title: "Admin - Cover Letters",
  description: "Manage cover letters.",
  path: "/admin/cover-letters",
});

const ALLOWED_EMAIL = "hackr@hackr.sh";

export default async function AdminCoverLettersLayout({
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

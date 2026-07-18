import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { fetchAuthQuery, isAuthenticated } from "~/lib/auth-server";
import { generatePageMetadata } from "~/lib/metadata";
import { api } from "../../../../convex/_generated/api";

export const metadata: Metadata = generatePageMetadata({
  title: "Admin - Job Postings",
  description: "Manage job postings.",
  path: "/admin/job-postings",
});

const ALLOWED_EMAIL = "hackr@hackr.sh";

export default async function AdminJobPostingsLayout({
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

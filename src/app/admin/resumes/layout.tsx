import { auth, clerkClient } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { generatePageMetadata } from "~/lib/metadata";

export const metadata: Metadata = generatePageMetadata({
  title: "Admin — Resumes",
  description: "Manage resumes.",
  path: "/admin/resumes",
});

const ALLOWED_EMAIL = "hackr@hackr.sh";

export default async function AdminResumesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const email = user.emailAddresses[0]?.emailAddress;

  if (email !== ALLOWED_EMAIL) {
    redirect("/unauthorized");
  }

  return children;
}

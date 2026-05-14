import { auth, clerkClient } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { generatePageMetadata } from "~/lib/metadata";

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

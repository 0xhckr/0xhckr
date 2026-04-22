import { SignOutButton } from "@clerk/nextjs";

export default function SignOutPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignOutButton>Sign out</SignOutButton>
    </div>
  );
}

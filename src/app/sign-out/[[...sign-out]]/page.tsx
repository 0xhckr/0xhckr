"use client";

import { useRouter } from "next/navigation";
import { authClient } from "~/lib/auth-client";

export default function SignOutPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center">
      <button
        type="button"
        onClick={async () => {
          await authClient.signOut();
          router.push("/");
          router.refresh();
        }}
        className="font-mono text-sm text-foreground/60 underline decoration-foreground/20 underline-offset-4 transition-colors hover:text-foreground/90"
      >
        sign out
      </button>
    </div>
  );
}

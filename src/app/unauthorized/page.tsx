"use client";

import { useRouter } from "next/navigation";
import { authClient } from "~/lib/auth-client";

export default function UnauthorizedPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <h1 className="font-mono text-2xl text-foreground">access denied</h1>
      <p className="font-mono text-sm text-foreground/50">
        only the account{" "}
        <span className="text-foreground/80">hackr@hackr.sh</span> is authorized
        to view this site.
      </p>
      {session?.user && (
        <p className="font-mono text-sm text-foreground/40">
          signed in as{" "}
          <span className="text-foreground/60">{session.user.email}</span>
        </p>
      )}
      {!isPending &&
        (session ? (
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
        ) : (
          <a
            href="/sign-in"
            className="font-mono text-sm text-foreground/60 underline decoration-foreground/20 underline-offset-4 transition-colors hover:text-foreground/90"
          >
            sign in
          </a>
        ))}
    </div>
  );
}

"use client";

import { SignOutButton, Show, useUser } from "@clerk/nextjs";

export default function UnauthorizedPage() {
  const { user } = useUser();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <h1 className="font-mono text-2xl text-foreground">access denied</h1>
      <p className="font-mono text-sm text-foreground/50">
        only the account <span className="text-foreground/80">hackr@hackr.sh</span> is authorized to view this site.
      </p>
      {user && (
        <p className="font-mono text-sm text-foreground/40">
          signed in as <span className="text-foreground/60">{user.emailAddresses[0]?.emailAddress}</span>
        </p>
      )}
      <Show when="signed-in">
        <SignOutButton redirectUrl="/">
          <button
            type="button"
            className="font-mono text-sm text-foreground/60 underline decoration-foreground/20 underline-offset-4 transition-colors hover:text-foreground/90"
          >
            sign out
          </button>
        </SignOutButton>
      </Show>
      <Show when="signed-out">
        <a
          href="/sign-in"
          className="font-mono text-sm text-foreground/60 underline decoration-foreground/20 underline-offset-4 transition-colors hover:text-foreground/90"
        >
          sign in
        </a>
      </Show>
    </div>
  );
}

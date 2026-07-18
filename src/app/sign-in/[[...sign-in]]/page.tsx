"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "~/lib/auth-client";

export default function SignInPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [setupOpen, setSetupOpen] = useState(false);
  const [setupToken, setSetupToken] = useState("");
  const [setupDone, setSetupDone] = useState(false);

  const handleSignIn = async () => {
    setError(null);
    setLoading(true);
    const { error } = await authClient.signIn.passkey();
    setLoading(false);
    if (error) {
      setError(error.message ?? "sign in failed");
      return;
    }
    router.push("/");
    router.refresh();
  };

  const handleRegister = async () => {
    setError(null);
    setLoading(true);
    const { error } = await authClient.passkey.addPasskey({
      name: "admin",
      context: setupToken,
    });
    setLoading(false);
    if (error) {
      setError(error.message ?? "passkey registration failed");
      return;
    }
    setSetupDone(true);
    setSetupToken("");
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="flex w-full max-w-xs flex-col gap-5">
        <h1 className="font-mono text-xl text-foreground">sign in</h1>
        {setupDone ? (
          <p className="font-mono text-xs text-muted-foreground">
            passkey registered. you can sign in now.
          </p>
        ) : null}
        {error && <p className="font-mono text-xs text-red-400">{error}</p>}
        <button
          type="button"
          disabled={loading}
          onClick={handleSignIn}
          className="link-sweep cursor-pointer border hairline px-3 py-2 font-mono text-sm text-foreground transition-colors hover:bg-foreground/5 disabled:opacity-50"
        >
          {loading ? "waiting for passkey..." : "sign in with passkey"}
        </button>
        <button
          type="button"
          onClick={() => setSetupOpen((v) => !v)}
          className="self-start font-mono text-xs text-foreground/40 underline decoration-foreground/20 underline-offset-4 transition-colors hover:text-foreground/70"
        >
          {setupOpen ? "close setup" : "first-time setup"}
        </button>
        {setupOpen && (
          <div className="flex flex-col gap-3">
            <label
              htmlFor="setup-token"
              className="font-mono text-xs text-muted-foreground"
            >
              setup token
            </label>
            <input
              id="setup-token"
              type="password"
              autoComplete="off"
              value={setupToken}
              onChange={(e) => setSetupToken(e.target.value)}
              className="border hairline bg-input/50 px-3 py-2 font-mono text-sm text-foreground outline-none transition-colors focus:border-foreground/40"
            />
            <button
              type="button"
              disabled={loading || !setupToken}
              onClick={handleRegister}
              className="link-sweep cursor-pointer border hairline px-3 py-2 font-mono text-sm text-foreground transition-colors hover:bg-foreground/5 disabled:opacity-50"
            >
              register passkey
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

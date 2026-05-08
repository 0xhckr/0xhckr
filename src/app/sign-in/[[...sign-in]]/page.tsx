import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-950">
      <SignIn
        appearance={{
          variables: {
            colorPrimary: "#ffffff",
            colorBackground: "#1c1c1c",
            colorInputBackground: "#2a2a2a",
            colorInputText: "#ffffff",
            colorText: "#ffffff",
            colorTextSecondary: "#a3a3a3",
            colorNeutral: "#ffffff",
          },
        }}
      />
    </div>
  );
}

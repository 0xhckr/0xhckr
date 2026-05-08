import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignIn
        appearance={{
          variables: {
            colorPrimary: "#ffffff",
            colorBackground: "transparent",
            colorInputBackground: "#1c1c1c",
            colorInputText: "#ffffff",
            colorText: "#ffffff",
            colorTextSecondary: "#a3a3a3",
            colorNeutral: "#ffffff",
          },
          elements: {
            card: "!bg-transparent !shadow-none !border-none",
            cardBox: "!bg-transparent !shadow-none !border-none",
            headerTitle: "!text-white",
            headerSubtitle: "!text-neutral-400",
            socialButtonsBlockButtonText: "!text-white",
            socialButtonsBlockButtonArrow: "!text-white",
            footer: "!bg-transparent",
            footerAction: "!bg-transparent",
            footerActionText: "!text-neutral-400",
            footerActionLink: "!text-white hover:!text-neutral-300",
            identityPreviewText: "!text-white",
            formFieldLabel: "!text-neutral-300",
          },
        }}
      />
    </div>
  );
}

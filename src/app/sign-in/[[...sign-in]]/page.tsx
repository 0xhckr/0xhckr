import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignIn
        appearance={{
          variables: {
            colorPrimary: "#ededed",
            colorBackground: "#0f0f0f",
            colorInputBackground: "#1a1a1a",
            colorInputText: "#ededed",
            colorText: "#ededed",
            colorTextSecondary: "#a3a3a3",
          },
          elements: {
            rootBox: "mx-auto",
            card: "bg-[#0f0f0f] border border-white/10 shadow-2xl",
            headerTitle: "text-white",
            headerSubtitle: "text-white/60",
            socialButtonsBlockButton:
              "border-white/10 bg-white/5 text-white hover:bg-white/10",
            formFieldLabel: "text-white/70",
            formFieldInput:
              "bg-[#1a1a1a] border-white/10 text-white",
            formButtonPrimary:
              "bg-white text-black hover:bg-white/90",
            footerActionLink: "text-white/60 hover:text-white",
            dividerLine: "bg-white/10",
            dividerText: "text-white/40",
          },
        }}
      />
    </div>
  );
}

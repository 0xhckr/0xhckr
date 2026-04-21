import type { Metadata } from "next";
import { DownloadResumeButton } from "~/components/download-resume-button";
import { PageHeading } from "~/components/page-heading";
import { TypewriterResume } from "~/components/typewriter-resume";
import { generatePageMetadata } from "~/lib/metadata";
import { resumeData } from "~/lib/resume";

export const metadata: Metadata = generatePageMetadata({
  title: "Resume",
  description:
    "Resume of Mohammad Al-Ahdal - Software Developer experienced in TypeScript, React, Rust, and NixOS.",
  path: "/resume",
});

export default function Resume() {
  return (
    <main id="main-content" tabIndex={-1}>
      <div className="flex min-h-screen flex-col items-center px-4 py-16 sm:px-8">
        <div className="tw-content my-auto w-full max-w-2xl lowercase pb-navbar">
          <div className="flex items-center justify-between">
            <PageHeading text="Resume" inline />
            <DownloadResumeButton />
          </div>
          <TypewriterResume data={resumeData} />
        </div>
      </div>
    </main>
  );
}

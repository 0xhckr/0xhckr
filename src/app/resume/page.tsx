"use client";

import { useQuery } from "convex/react";
import { CreateResumeButton } from "~/components/create-resume-button";
import { DownloadResumeButton } from "~/components/download-resume-button";
import { PageHeading } from "~/components/page-heading";
import { TypewriterResume } from "~/components/typewriter-resume";
import { api } from "../../../convex/_generated/api";
import type { ResumeData } from "~/lib/resume";

export default function Resume() {
  const resumeDoc = useQuery(api.resumes.getFrontFacing);
  const resume: ResumeData | null = resumeDoc
    ? JSON.parse(resumeDoc.content)
    : null;

  return (
    <main id="main-content" tabIndex={-1}>
      <div className="flex min-h-screen flex-col items-center px-4 py-16 sm:px-8">
        <div className="tw-content my-auto w-full max-w-2xl lowercase pb-navbar pt-admin-navbar">
          <div className="flex items-center justify-between">
            <PageHeading text="Resume" inline />
            <div className="flex items-center gap-2">
              {resume && <DownloadResumeButton data={resume} />}
            </div>
          </div>
          {resume && <TypewriterResume data={resume} />}
        </div>
      </div>
    </main>
  );
}

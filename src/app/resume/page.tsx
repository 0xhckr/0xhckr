"use client";

import { useQuery } from "convex/react";
import { DownloadResumeButton } from "~/components/download-resume-button";
import { PageHeader } from "~/components/page-header";
import { ResumeView } from "~/components/resume-view";
import type { ResumeData } from "~/lib/resume";
import { api } from "../../../convex/_generated/api";

export default function Resume() {
  const resumeDoc = useQuery(api.resumes.getFrontFacing);
  const resume: ResumeData | null = resumeDoc
    ? JSON.parse(resumeDoc.content)
    : null;

  return (
    <main id="main-content" tabIndex={-1}>
      <div className="mx-auto max-w-5xl px-5 pt-36 pb-24 sm:px-8 sm:pt-44">
        <div className="flex items-end justify-between gap-6">
          <PageHeader eyebrow="resume" title="Resume" />
          {resume && (
            <div className="shrink-0 pb-1">
              <DownloadResumeButton data={resume} />
            </div>
          )}
        </div>
        {resume && <ResumeView data={resume} />}
      </div>
    </main>
  );
}

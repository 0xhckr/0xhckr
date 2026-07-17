"use client";

import { useMutation, useQuery } from "convex/react";
import { Plus } from "lucide-react";
import Link from "next/link";
import {
  AdminPageHeader,
  AdminShell,
  EmptyState,
  Pill,
} from "~/components/admin/ui";
import { DownloadResumeButton } from "~/components/download-resume-button";
import { Reveal } from "~/components/reveal";
import { Button } from "~/components/ui/button";
import type { ResumeData } from "~/lib/resume";
import { api } from "../../../../convex/_generated/api";

export default function AdminResumesPage() {
  const resumes = useQuery(api.resumes.list);
  const jobPostings = useQuery(api.jobPostings.list);
  const createResume = useMutation(api.resumes.create);

  const handleCreate = async () => {
    const id = await createResume({
      content: JSON.stringify({
        profile: "",
        experiences: [],
        skills: [],
        education: null,
      }),
    });
    window.location.href = `/admin/resumes/${id}`;
  };

  return (
    <AdminShell>
      <AdminPageHeader eyebrow="admin / resumes" title="Resumes">
        <Button onClick={handleCreate} variant="outline" size="sm">
          <Plus className="size-3.5" />
          new
        </Button>
      </AdminPageHeader>

      {resumes === undefined && (
        <p className="mt-12 font-mono text-xs text-muted-foreground lowercase">
          loading...
        </p>
      )}

      {resumes === null && (
        <div className="mt-12">
          <EmptyState>sign in to manage resumes.</EmptyState>
        </div>
      )}

      {resumes && resumes.length === 0 && (
        <div className="mt-12">
          <EmptyState>no resumes yet — create one to get started.</EmptyState>
        </div>
      )}

      {resumes && resumes.length > 0 && (
        <Reveal className="mt-8">
          {resumes.map((resume, i) => {
            let data: ResumeData | null = null;
            try {
              data = JSON.parse(resume.content);
            } catch {
              data = null;
            }
            const jp = resume.jobPosting
              ? jobPostings?.find((j) => j._id === resume.jobPosting)
              : undefined;

            return (
              <div
                key={resume._id}
                className="reveal-item row-hover group relative border-t hairline py-6 last:border-b"
              >
                <Link
                  href={`/admin/resumes/${resume._id}`}
                  className="absolute inset-0"
                  aria-label={`Edit resume from ${new Date(resume.createdAt).toLocaleDateString()}`}
                />
                <div className="relative flex items-baseline gap-5">
                  <span className="font-mono text-xs text-muted-foreground/60">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                      <span className="font-mono text-xs text-muted-foreground tabular-nums">
                        {new Date(resume.createdAt).toLocaleDateString(
                          "en-CA",
                          { year: "numeric", month: "short", day: "2-digit" },
                        )}
                      </span>
                      {resume.isFrontFacing && <Pill tone="live">live</Pill>}
                      {jp && (
                        <Pill tone="muted">
                          {jp.title}
                          {jp.company ? ` @ ${jp.company}` : ""}
                        </Pill>
                      )}
                    </div>
                    {data && (
                      <p className="mt-2 line-clamp-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
                        {data.profile}
                      </p>
                    )}
                  </div>
                  {data && (
                    <span className="relative shrink-0">
                      <DownloadResumeButton
                        data={data}
                        company={jp?.company}
                        position={jp?.title}
                      />
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </Reveal>
      )}
    </AdminShell>
  );
}

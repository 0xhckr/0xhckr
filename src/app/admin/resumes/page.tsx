"use client";

import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { ResumeData } from "~/lib/resume";
import { DownloadResumeButton } from "~/components/download-resume-button";
import { Button } from "~/components/ui/button";
import { Plus } from "lucide-react";

export default function AdminResumesPage() {
  const resumes = useQuery(api.resumes.list);
  const jobPostings = useQuery(api.jobPostings.list);
  const createResume = useMutation(api.resumes.create);

  const handleCreate = async () => {
    const id = await createResume({ content: JSON.stringify({ profile: "", experiences: [], skills: [], education: null }) });
    window.location.href = `/admin/resumes/${id}`;
  };

  return (
    <main id="main-content" tabIndex={-1}>
      <div className="tw-content flex min-h-screen flex-col items-center px-4 pt-admin-navbar py-16 sm:px-8">
        <div className="flex items-center justify-between w-full max-w-2xl mb-8">
          <h1 className="text-2xl font-semibold tracking-tight lowercase">
            Manage Resumes
          </h1>
          <Button
            onClick={handleCreate}
            variant="ghost"
            size="icon-sm"
            aria-label="Create resume"
          >
            <Plus className="size-4" />
          </Button>
        </div>

        {resumes === undefined && (
          <p className="text-muted-foreground lowercase">Loading...</p>
        )}

        {resumes === null && (
          <p className="text-muted-foreground lowercase">
            Sign in to manage resumes.
          </p>
        )}

        {resumes && resumes.length === 0 && (
          <p className="text-muted-foreground lowercase">No resumes found.</p>
        )}

        {resumes && resumes.length > 0 && (
          <div className="w-full max-w-2xl space-y-4">
            {resumes.map((resume) => {
              let data: ResumeData | null = null;
              try {
                data = JSON.parse(resume.content);
              } catch {
                data = null;
              }

              return (
                <div
                  key={resume._id}
                  className="relative p-4 hover:bg-foreground/5"
                >
                  <Link
                    href={`/admin/resumes/${resume._id}`}
                    className="absolute inset-0"
                  />
                  <div className="flex items-center justify-between relative">
                    <span className="text-sm text-muted-foreground">
                      {new Date(resume.createdAt).toLocaleDateString(
                        undefined,
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        },
                      )}
                    </span>
                    <div className="flex items-center gap-2">
                      {data && (
                        <DownloadResumeButton
                          data={data}
                          company={resume.jobPosting ? jobPostings?.find((j) => j._id === resume.jobPosting)?.company : undefined}
                          position={resume.jobPosting ? jobPostings?.find((j) => j._id === resume.jobPosting)?.title : undefined}
                        />
                      )}
                      {resume.jobPosting && (
                        <span className="rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-medium text-blue-500">
                          {(() => {
                            const jp = jobPostings?.find((j) => j._id === resume.jobPosting);
                            return jp ? `${jp.title}${jp.company ? ` @ ${jp.company}` : ""}` : "Unknown";
                          })()}
                        </span>
                      )}
                      {resume.isFrontFacing && (
                        <span className="rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-medium text-green-500">
                          Live
                        </span>
                      )}
                    </div>
                  </div>
                  {data && (
                    <p className="mt-2 text-sm line-clamp-3">{data.profile}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

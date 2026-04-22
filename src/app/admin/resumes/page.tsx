"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { ResumeData } from "~/lib/resume";

export default function AdminResumesPage() {
  const resumes = useQuery(api.resumes.list);

  return (
    <main id="main-content" tabIndex={-1}>
      <div className="tw-content flex min-h-screen flex-col items-center px-4 pt-admin-navbar py-16 sm:px-8">
        <h1 className="mb-8 text-2xl font-semibold tracking-tight lowercase">
          Manage Resumes
        </h1>

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
                <Link
                  key={resume._id}
                  href={`/admin/resumes/${resume._id}`}
                  className="block rounded-lg border border-border p-4 transition-colors hover:border-foreground/20"
                >
                  <div className="flex items-center justify-between">
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
                    {resume.isFrontFacing && (
                      <span className="rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-medium text-green-500">
                        Live
                      </span>
                    )}
                  </div>
                  {data && (
                    <p className="mt-2 text-sm line-clamp-3">{data.profile}</p>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

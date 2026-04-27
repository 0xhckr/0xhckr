"use client";

import { useMutation, useQuery } from "convex/react";
import { Plus } from "lucide-react";
import Link from "next/link";
import { DownloadCoverLetterButton } from "~/components/download-cover-letter-button";
import { Button } from "~/components/ui/button";
import { api } from "../../../../convex/_generated/api";

export default function AdminCoverLettersPage() {
  const coverLetters = useQuery(api.coverLetters.list);
  const jobPostings = useQuery(api.jobPostings.list);
  const createCoverLetter = useMutation(api.coverLetters.create);

  const handleCreate = async () => {
    const id = await createCoverLetter({ content: "" });
    window.location.href = `/admin/cover-letters/${id}`;
  };

  return (
    <main id="main-content" tabIndex={-1}>
      <div className="tw-content flex min-h-screen flex-col items-center px-4 pt-admin-navbar py-16 sm:px-8">
        <div className="flex items-center justify-between w-full max-w-2xl mb-8">
          <h1 className="text-2xl font-semibold tracking-tight lowercase">
            Manage Cover Letters
          </h1>
          <Button
            onClick={handleCreate}
            variant="ghost"
            size="icon-sm"
            aria-label="Create cover letter"
          >
            <Plus className="size-4" />
          </Button>
        </div>

        {coverLetters === undefined && (
          <p className="text-muted-foreground lowercase">Loading...</p>
        )}

        {coverLetters === null && (
          <p className="text-muted-foreground lowercase">
            Sign in to manage cover letters.
          </p>
        )}

        {coverLetters && coverLetters.length === 0 && (
          <p className="text-muted-foreground lowercase">
            No cover letters found.
          </p>
        )}

        {coverLetters && coverLetters.length > 0 && (
          <div className="w-full max-w-2xl space-y-4">
            {coverLetters.map((coverLetter) => (
              <div
                key={coverLetter._id}
                className="relative p-4 hover:bg-foreground/5"
              >
                <Link
                  href={`/admin/cover-letters/${coverLetter._id}`}
                  className="absolute inset-0"
                />
                <div className="flex items-center justify-between relative">
                  <span className="text-sm text-muted-foreground">
                    {new Date(coverLetter.createdAt).toLocaleDateString(
                      undefined,
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      },
                    )}
                  </span>
                  <div className="flex items-center gap-2">
                    {coverLetter.content && (
                      <DownloadCoverLetterButton
                        content={coverLetter.content}
                        jobTitle={
                          coverLetter.jobPosting
                            ? jobPostings?.find(
                                (j) => j._id === coverLetter.jobPosting,
                              )?.title
                            : undefined
                        }
                        company={
                          coverLetter.jobPosting
                            ? jobPostings?.find(
                                (j) => j._id === coverLetter.jobPosting,
                              )?.company
                            : undefined
                        }
                      />
                    )}
                    {coverLetter.jobPosting && (
                      <span className="rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-medium text-blue-500">
                        {(() => {
                          const jp = jobPostings?.find(
                            (j) => j._id === coverLetter.jobPosting,
                          );
                          return jp
                            ? `${jp.title}${jp.company ? ` @ ${jp.company}` : ""}`
                            : "Unknown";
                        })()}
                      </span>
                    )}
                  </div>
                </div>
                {coverLetter.content && (
                  <p className="mt-2 text-sm line-clamp-3">
                    {coverLetter.content}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

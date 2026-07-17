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
import { DownloadCoverLetterButton } from "~/components/download-cover-letter-button";
import { Reveal } from "~/components/reveal";
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
    <AdminShell>
      <AdminPageHeader eyebrow="admin / cover letters" title="Cover letters">
        <Button onClick={handleCreate} variant="outline" size="sm">
          <Plus className="size-3.5" />
          new
        </Button>
      </AdminPageHeader>

      {coverLetters === undefined && (
        <p className="mt-12 font-mono text-xs text-muted-foreground lowercase">
          loading...
        </p>
      )}

      {coverLetters === null && (
        <div className="mt-12">
          <EmptyState>sign in to manage cover letters.</EmptyState>
        </div>
      )}

      {coverLetters && coverLetters.length === 0 && (
        <div className="mt-12">
          <EmptyState>
            no cover letters yet — create one to get started.
          </EmptyState>
        </div>
      )}

      {coverLetters && coverLetters.length > 0 && (
        <Reveal className="mt-8">
          {coverLetters.map((coverLetter, i) => {
            const jp = coverLetter.jobPosting
              ? jobPostings?.find((j) => j._id === coverLetter.jobPosting)
              : undefined;

            return (
              <div
                key={coverLetter._id}
                className="reveal-item row-hover group relative border-t hairline py-6 last:border-b"
              >
                <Link
                  href={`/admin/cover-letters/${coverLetter._id}`}
                  className="absolute inset-0"
                  aria-label={`Edit cover letter from ${new Date(coverLetter.createdAt).toLocaleDateString()}`}
                />
                <div className="relative flex items-baseline gap-5">
                  <span className="font-mono text-xs text-muted-foreground/60">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                      <span className="font-mono text-xs text-muted-foreground tabular-nums">
                        {new Date(coverLetter.createdAt).toLocaleDateString(
                          "en-CA",
                          { year: "numeric", month: "short", day: "2-digit" },
                        )}
                      </span>
                      {jp && (
                        <Pill tone="muted">
                          {jp.title}
                          {jp.company ? ` @ ${jp.company}` : ""}
                        </Pill>
                      )}
                    </div>
                    {coverLetter.content && (
                      <p className="mt-2 line-clamp-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
                        {coverLetter.content}
                      </p>
                    )}
                  </div>
                  {coverLetter.content && (
                    <span className="relative shrink-0">
                      <DownloadCoverLetterButton
                        content={coverLetter.content}
                        jobTitle={jp?.title}
                        company={jp?.company}
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

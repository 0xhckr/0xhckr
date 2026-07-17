"use client";

import { useMutation, useQuery } from "convex/react";
import { Plus } from "lucide-react";
import Link from "next/link";
import { AdminPageHeader, AdminShell, EmptyState } from "~/components/admin/ui";
import { Reveal } from "~/components/reveal";
import { Button } from "~/components/ui/button";
import { api } from "../../../../convex/_generated/api";

export default function AdminJobPostingsPage() {
  const jobPostings = useQuery(api.jobPostings.list);
  const createJobPosting = useMutation(api.jobPostings.create);

  const handleCreate = async () => {
    const id = await createJobPosting({
      title: "",
      description: "",
      company: "",
    });
    window.location.href = `/admin/job-postings/${id}`;
  };

  return (
    <AdminShell>
      <AdminPageHeader eyebrow="admin / job postings" title="Job postings">
        <Button onClick={handleCreate} variant="outline" size="sm">
          <Plus className="size-3.5" />
          new
        </Button>
      </AdminPageHeader>

      {jobPostings === undefined && (
        <p className="mt-12 font-mono text-xs text-muted-foreground lowercase">
          loading...
        </p>
      )}

      {jobPostings === null && (
        <div className="mt-12">
          <EmptyState>sign in to manage job postings.</EmptyState>
        </div>
      )}

      {jobPostings && jobPostings.length === 0 && (
        <div className="mt-12">
          <EmptyState>
            no job postings yet — create one to get started.
          </EmptyState>
        </div>
      )}

      {jobPostings && jobPostings.length > 0 && (
        <Reveal className="mt-8">
          {jobPostings.map((posting, i) => (
            <Link
              key={posting._id}
              href={`/admin/job-postings/${posting._id}`}
              className="reveal-item row-hover group block border-t hairline py-6 last:border-b"
            >
              <div className="flex items-baseline gap-5">
                <span className="font-mono text-xs text-muted-foreground/60">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="font-sans text-lg font-semibold tracking-tight text-foreground transition-colors group-hover:text-accent">
                    {posting.title || "untitled"}
                    {posting.company && (
                      <span className="text-muted-foreground">
                        <span className="text-accent"> @ </span>
                        {posting.company}
                      </span>
                    )}
                  </h2>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs text-muted-foreground">
                    <span className="tabular-nums">
                      {new Date(posting.createdAt).toLocaleDateString("en-CA", {
                        year: "numeric",
                        month: "short",
                        day: "2-digit",
                      })}
                    </span>
                    {posting.location && <span>{posting.location}</span>}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </Reveal>
      )}
    </AdminShell>
  );
}

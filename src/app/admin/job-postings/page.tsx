"use client";

import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { Plus } from "lucide-react";
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
    <main id="main-content" tabIndex={-1}>
      <div className="tw-content flex min-h-screen flex-col items-center px-4 pt-admin-navbar py-16 sm:px-8">
        <div className="flex items-center justify-between w-full max-w-2xl mb-8">
          <h1 className="text-2xl font-semibold tracking-tight lowercase">
            Manage Job Postings
          </h1>
          <Button
            onClick={handleCreate}
            variant="ghost"
            size="icon-sm"
            aria-label="Create job posting"
          >
            <Plus className="size-4" />
          </Button>
        </div>

        {jobPostings === undefined && (
          <p className="text-muted-foreground lowercase">Loading...</p>
        )}

        {jobPostings === null && (
          <p className="text-muted-foreground lowercase">
            Sign in to manage job postings.
          </p>
        )}

        {jobPostings && jobPostings.length === 0 && (
          <p className="text-muted-foreground lowercase">
            No job postings found. Create one to get started.
          </p>
        )}

        {jobPostings && jobPostings.length > 0 && (
          <div className="w-full max-w-2xl space-y-4">
            {jobPostings.map((posting) => (
              <Link
                key={posting._id}
                href={`/admin/job-postings/${posting._id}`}
                className="block rounded-lg border border-border p-4 transition-colors hover:border-foreground/20"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {posting.company}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(posting.createdAt).toLocaleDateString(
                      undefined,
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      },
                    )}
                  </span>
                </div>
                <p className="mt-2 text-sm font-medium">{posting.title || "Untitled"}</p>
                {posting.location && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {posting.location}
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

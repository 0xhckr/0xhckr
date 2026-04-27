"use client";

import { useMutation, useQuery } from "convex/react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";

function Label({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label
      className={`block text-xs font-medium text-muted-foreground lowercase tracking-wider mb-1.5 ${className ?? ""}`}
    >
      {children}
    </label>
  );
}

export default function EditJobPostingPage() {
  const params = useParams<{ jobPostingId: Id<"jobPostings"> }>();
  const router = useRouter();
  const jobPosting = useQuery(api.jobPostings.get, { id: params.jobPostingId });
  const updateJobPosting = useMutation(api.jobPostings.update);
  const removeJobPosting = useMutation(api.jobPostings.remove);

  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadJobPosting = useCallback(() => {
    if (!jobPosting) return;
    setTitle(jobPosting.title);
    setCompany(jobPosting.company);
    setDescription(jobPosting.description);
    setLocation(jobPosting.location ?? "");
    setDirty(false);
  }, [jobPosting]);

  useEffect(() => {
    loadJobPosting();
  }, [loadJobPosting]);

  if (jobPosting === undefined) {
    return (
      <main id="main-content" tabIndex={-1}>
        <div className="tw-content flex min-h-screen items-center justify-center pt-admin-navbar">
          <p className="text-muted-foreground lowercase animate-pulse">
            Loading...
          </p>
        </div>
      </main>
    );
  }

  if (jobPosting === null) {
    return (
      <main id="main-content" tabIndex={-1}>
        <div className="tw-content flex min-h-screen items-center justify-center pt-admin-navbar">
          <p className="text-muted-foreground lowercase">
            Job posting not found.
          </p>
        </div>
      </main>
    );
  }

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateJobPosting({
        id: params.jobPostingId,
        title,
        description,
        company,
        location: location || undefined,
      });
      setDirty(false);
    } catch (err) {
      console.error("Failed to save job posting:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this job posting? This cannot be undone.")) return;
    await removeJobPosting({ id: params.jobPostingId });
    router.push("/admin/job-postings");
  };

  return (
    <main id="main-content" tabIndex={-1}>
      <div className="tw-content flex min-h-screen flex-col px-4 pt-admin-navbar pb-navbar sm:px-8">
        <div className="w-full max-w-3xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => router.push("/admin/job-postings")}
              >
                <ArrowLeft className="size-4" />
              </Button>
              <div>
                <h1 className="text-xl font-semibold tracking-tight lowercase">
                  Edit Job Posting
                </h1>
                <p className="text-xs text-muted-foreground lowercase">
                  {new Date(jobPosting.createdAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {dirty && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleSave}
                  disabled={saving}
                >
                  <Save className="size-3.5" />
                  {saving ? "saving..." : "save"}
                </Button>
              )}
            </div>
          </div>

          {/* Actions Bar */}
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              <Trash2 className="size-3.5" />
              delete
            </Button>
            <Button variant="ghost" size="sm" onClick={loadJobPosting}>
              discard changes
            </Button>
          </div>

          {/* Editor Content */}
          <div className="space-y-10">
            <section>
              <Label>Title</Label>
              <Input
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setDirty(true);
                }}
                placeholder="Senior Software Developer"
              />
            </section>

            <section>
              <Label>Company</Label>
              <Input
                value={company}
                onChange={(e) => {
                  setCompany(e.target.value);
                  setDirty(true);
                }}
                placeholder="Acme Inc."
              />
            </section>

            <section>
              <Label>Location (optional)</Label>
              <Input
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                  setDirty(true);
                }}
                placeholder="Calgary, AB"
              />
            </section>

            <section>
              <Label>Description</Label>
              <Textarea
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  setDirty(true);
                }}
                placeholder="Paste the full job description here..."
                rows={16}
              />
            </section>
          </div>

          {/* Bottom Save Bar */}
          {dirty && (
            <div className="sticky bottom-navbar flex justify-end">
              <Button
                variant="default"
                size="lg"
                onClick={handleSave}
                disabled={saving}
              >
                <Save className="size-4" />
                {saving ? "saving..." : "save job posting"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

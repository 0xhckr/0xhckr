"use client";

import { useMutation, useQuery } from "convex/react";
import { ArrowLeft, Save, Sparkles, Trash2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { DownloadCoverLetterButton } from "~/components/download-cover-letter-button";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";

export default function EditCoverLetterPage() {
  const params = useParams<{ coverLetterId: Id<"coverLetters"> }>();
  const router = useRouter();
  const coverLetter = useQuery(api.coverLetters.get, {
    id: params.coverLetterId,
  });
  const jobPostings = useQuery(api.jobPostings.list);
  const updateCoverLetter = useMutation(api.coverLetters.update);
  const removeCoverLetter = useMutation(api.coverLetters.remove);

  const [draft, setDraft] = useState("");
  const [selectedJobPosting, setSelectedJobPosting] =
    useState<Id<"jobPostings"> | null>(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);

  const loadCoverLetter = useCallback(() => {
    if (!coverLetter) return;
    setDraft(coverLetter.content);
    setSelectedJobPosting(coverLetter.jobPosting ?? null);
    setDirty(false);
  }, [coverLetter]);

  useEffect(() => {
    loadCoverLetter();
  }, [loadCoverLetter]);

  if (coverLetter === undefined) {
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

  if (coverLetter === null) {
    return (
      <main id="main-content" tabIndex={-1}>
        <div className="tw-content flex min-h-screen items-center justify-center pt-admin-navbar">
          <p className="text-muted-foreground lowercase">
            Cover letter not found.
          </p>
        </div>
      </main>
    );
  }

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateCoverLetter({
        id: params.coverLetterId,
        content: draft,
        jobPosting: selectedJobPosting ?? undefined,
      });
      setDirty(false);
    } catch (err) {
      console.error("Failed to save cover letter:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this cover letter? This cannot be undone.")) return;
    await removeCoverLetter({ id: params.coverLetterId });
    router.push("/admin/cover-letters");
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/cover-letters/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobPostingId: selectedJobPosting ?? undefined,
        }),
      });
      if (!res.ok) {
        throw new Error(await res.text());
      }
      const data = await res.json();
      setDraft(data.content);
      setDirty(true);
    } catch (err) {
      console.error("Generation failed:", err);
    } finally {
      setGenerating(false);
    }
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
                onClick={() => router.push("/admin/cover-letters")}
              >
                <ArrowLeft className="size-4" />
              </Button>
              <div>
                <h1 className="text-xl font-semibold tracking-tight lowercase">
                  Edit Cover Letter
                </h1>
                <p className="text-xs text-muted-foreground lowercase">
                  {new Date(coverLetter.createdAt).toLocaleDateString(
                    undefined,
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    },
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <DownloadCoverLetterButton
                content={draft}
                jobTitle={
                  selectedJobPosting
                    ? jobPostings?.find((j) => j._id === selectedJobPosting)
                        ?.title
                    : undefined
                }
                company={
                  selectedJobPosting
                    ? jobPostings?.find((j) => j._id === selectedJobPosting)
                        ?.company
                    : undefined
                }
              />
            </div>
          </div>

          {/* Actions Bar */}
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              <Trash2 className="size-3.5" />
              delete
            </Button>
            <Button variant="ghost" size="sm" onClick={loadCoverLetter}>
              discard changes
            </Button>
          </div>

          {/* Job Posting */}
          <section>
            <div className="flex flex-col items-start justify-between mb-4 gap-4">
              <h2 className="text-lg font-semibold tracking-tight lowercase">
                Job Posting
              </h2>
              <Button
                variant="ghost"
                size="sm"
                disabled={generating}
                onClick={handleGenerate}
              >
                <Sparkles className="size-3.5" />
                {generating ? "generating..." : "generate with AI"}
              </Button>
            </div>
            <select
              value={selectedJobPosting ?? ""}
              onChange={(e) => {
                setSelectedJobPosting(
                  (e.target.value || null) as Id<"jobPostings"> | null,
                );
                setDirty(true);
              }}
              className="w-full rounded-none bg-transparent px-3 py-2 text-sm lowercase focus:outline-none"
            >
              <option value="">None</option>
              {jobPostings?.map((posting) => (
                <option key={posting._id} value={posting._id}>
                  {posting.title || "Untitled"} - {posting.company}
                </option>
              ))}
            </select>
          </section>

          {/* Content */}
          <section>
            <div className="flex flex-col items-start justify-between mb-4 gap-4">
              <h2 className="text-lg font-semibold tracking-tight lowercase">
                Content
              </h2>
            </div>
            <Textarea
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value);
                setDirty(true);
              }}
              placeholder="Write your cover letter here..."
              rows={20}
            />
          </section>

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
                {saving ? "saving..." : "save cover letter"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

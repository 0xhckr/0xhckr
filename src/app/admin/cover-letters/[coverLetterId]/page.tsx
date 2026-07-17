"use client";

import { useMutation, useQuery } from "convex/react";
import { ArrowLeft, Save, Sparkles, Trash2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  AdminPageHeader,
  AdminSection,
  AdminSelect,
  AdminShell,
  SaveBar,
} from "~/components/admin/ui";
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
      <AdminShell>
        <p className="font-mono text-xs text-muted-foreground lowercase">
          loading...
        </p>
      </AdminShell>
    );
  }

  if (coverLetter === null) {
    return (
      <AdminShell>
        <p className="font-mono text-xs text-muted-foreground lowercase">
          cover letter not found.
        </p>
      </AdminShell>
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

  const selectedJp = selectedJobPosting
    ? jobPostings?.find((j) => j._id === selectedJobPosting)
    : undefined;

  return (
    <AdminShell>
      <AdminPageHeader
        eyebrow="admin / cover letters"
        title="Edit letter"
        meta={new Date(coverLetter.createdAt).toLocaleDateString("en-CA", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      >
        {draft && (
          <DownloadCoverLetterButton
            content={draft}
            jobTitle={selectedJp?.title}
            company={selectedJp?.company}
          />
        )}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => router.push("/admin/cover-letters")}
          aria-label="Back to cover letters"
        >
          <ArrowLeft className="size-4" />
        </Button>
      </AdminPageHeader>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <Button variant="destructive-outline" size="sm" onClick={handleDelete}>
          <Trash2 className="size-3.5" />
          delete
        </Button>
        <Button variant="ghost" size="sm" onClick={loadCoverLetter}>
          discard changes
        </Button>
      </div>

      <AdminSection
        index="01"
        title="job posting"
        actions={
          <Button
            variant="outline"
            size="sm"
            disabled={generating}
            onClick={handleGenerate}
          >
            <Sparkles className="size-3.5 text-accent" />
            {generating ? "generating..." : "generate"}
          </Button>
        }
      >
        <AdminSelect
          value={selectedJobPosting ?? ""}
          onChange={(e) => {
            setSelectedJobPosting(
              (e.target.value || null) as Id<"jobPostings"> | null,
            );
            setDirty(true);
          }}
        >
          <option value="">none</option>
          {jobPostings?.map((posting) => (
            <option key={posting._id} value={posting._id}>
              {posting.title || "untitled"} — {posting.company}
            </option>
          ))}
        </AdminSelect>
      </AdminSection>

      <AdminSection index="02" title="content">
        <Textarea
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            setDirty(true);
          }}
          placeholder="Write your cover letter here..."
          rows={20}
        />
      </AdminSection>

      <SaveBar visible={dirty}>
        <Button
          variant="default"
          size="sm"
          onClick={handleSave}
          disabled={saving}
        >
          <Save className="size-3.5" />
          {saving ? "saving..." : "save"}
        </Button>
      </SaveBar>
    </AdminShell>
  );
}

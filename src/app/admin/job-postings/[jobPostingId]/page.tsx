"use client";

import { useMutation, useQuery } from "convex/react";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  AdminPageHeader,
  AdminSection,
  AdminShell,
  FieldLabel,
  SaveBar,
} from "~/components/admin/ui";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";

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
      <AdminShell>
        <p className="font-mono text-xs text-muted-foreground lowercase">
          loading...
        </p>
      </AdminShell>
    );
  }

  if (jobPosting === null) {
    return (
      <AdminShell>
        <p className="font-mono text-xs text-muted-foreground lowercase">
          job posting not found.
        </p>
      </AdminShell>
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
    <AdminShell>
      <AdminPageHeader
        eyebrow="admin / job postings"
        title="Edit posting"
        meta={new Date(jobPosting.createdAt).toLocaleDateString("en-CA", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      >
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => router.push("/admin/job-postings")}
          aria-label="Back to job postings"
        >
          <ArrowLeft className="size-4" />
        </Button>
      </AdminPageHeader>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <Button variant="destructive-outline" size="sm" onClick={handleDelete}>
          <Trash2 className="size-3.5" />
          delete
        </Button>
        <Button variant="ghost" size="sm" onClick={loadJobPosting}>
          discard changes
        </Button>
      </div>

      <AdminSection index="01" title="role">
        <div className="space-y-5">
          <div>
            <FieldLabel>title</FieldLabel>
            <Input
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setDirty(true);
              }}
              placeholder="Senior Software Developer"
            />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <FieldLabel>company</FieldLabel>
              <Input
                value={company}
                onChange={(e) => {
                  setCompany(e.target.value);
                  setDirty(true);
                }}
                placeholder="Acme Inc."
              />
            </div>
            <div>
              <FieldLabel>location (optional)</FieldLabel>
              <Input
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                  setDirty(true);
                }}
                placeholder="Calgary, AB"
              />
            </div>
          </div>
        </div>
      </AdminSection>

      <AdminSection index="02" title="description">
        <Textarea
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            setDirty(true);
          }}
          placeholder="Paste the full job description here..."
          rows={16}
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

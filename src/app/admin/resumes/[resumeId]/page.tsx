"use client";

import { useMutation, useQuery } from "convex/react";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Plus,
  Save,
  Sparkles,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  AdminPageHeader,
  AdminSection,
  AdminSelect,
  AdminShell,
  FieldLabel,
  Pill,
  SaveBar,
} from "~/components/admin/ui";
import { DownloadResumeButton } from "~/components/download-resume-button";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Switch } from "~/components/ui/switch";
import { Textarea } from "~/components/ui/textarea";
import type { ResumeData } from "~/lib/resume";
import { cn } from "~/lib/utils";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";

const blankResume: ResumeData = {
  profile: "",
  experiences: [],
  skills: [],
  education: null,
};

function AddButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-24 w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed hairline font-mono text-xs text-muted-foreground transition-colors hover:border-accent/40 hover:text-accent"
    >
      <Plus className="size-3.5" />
      {children}
    </button>
  );
}

function ExperienceEditor({
  experience,
  index,
  onChange,
  onRemove,
}: {
  experience: ResumeData["experiences"][number];
  index: number;
  onChange: (index: number, updated: ResumeData["experiences"][number]) => void;
  onRemove: (index: number) => void;
}) {
  const [startYear, setStartYear] = useState(String(experience.years.start));
  const [endYear, setEndYear] = useState(
    experience.years.end === "Present"
      ? "Present"
      : String(experience.years.end),
  );
  const [address, setAddress] = useState(experience.address ?? "");
  const [title, setTitle] = useState(experience.title);
  const [company, setCompany] = useState(experience.company);
  const [description, setDescription] = useState(
    Array.isArray(experience.description)
      ? experience.description.join("\n")
      : experience.description,
  );

  const update = (field: Partial<ResumeData["experiences"][number]>) => {
    const start = field.years?.start ?? (Number(startYear) || 0);
    const end =
      endYear === "Present" ? ("Present" as const) : Number(endYear) || 0;
    onChange(index, {
      ...experience,
      years: { start, end },
      address: address || undefined,
      title,
      company,
      description: description.split("\n").filter((line) => line.trim() !== ""),
      ...field,
    });
  };

  return (
    <div className="relative space-y-5 rounded-md border hairline p-5">
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => onRemove(index)}
        aria-label="Remove experience"
        className="absolute top-3 right-3 text-muted-foreground hover:text-destructive-foreground"
      >
        <X className="size-4" />
      </Button>

      <div className="flex flex-wrap items-center gap-2 pr-10">
        <div className="w-20">
          <Input
            min={1997}
            max={2100}
            value={startYear}
            onChange={(e) => {
              setStartYear(e.target.value);
              update({
                years: {
                  start: Number(e.target.value) || 0,
                  end: endYear === "Present" ? "Present" : Number(endYear) || 0,
                },
              });
            }}
            placeholder={`${new Date().getFullYear()}`}
          />
        </div>
        <span className="font-mono text-xs text-muted-foreground">—</span>
        <div className="w-24">
          <Input
            value={endYear}
            onChange={(e) => {
              setEndYear(e.target.value);
              const end =
                e.target.value === "Present"
                  ? "Present"
                  : Number(e.target.value) || 0;
              update({ years: { start: Number(startYear) || 0, end } });
            }}
            placeholder="Present"
          />
        </div>
        <span className="font-mono text-xs text-muted-foreground">in</span>
        <div className="min-w-32 flex-1">
          <Input
            value={address}
            onChange={(e) => {
              setAddress(e.target.value);
              update({ address: e.target.value || undefined });
            }}
            placeholder="Calgary, AB"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex-1">
          <Input
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              update({ title: e.target.value });
            }}
            placeholder="Software Developer"
          />
        </div>
        <span className="font-mono text-xs text-accent">@</span>
        <div className="flex-1">
          <Input
            value={company}
            onChange={(e) => {
              setCompany(e.target.value);
              update({ company: e.target.value });
            }}
            placeholder="Acme Inc."
          />
        </div>
      </div>

      <Textarea
        value={description}
        onChange={(e) => {
          setDescription(e.target.value);
          update({
            description: e.target.value
              .split("\n")
              .filter((line) => line.trim() !== ""),
          });
        }}
        placeholder="Led development of... (one bullet per line)"
        rows={7}
      />
    </div>
  );
}

function SkillEditor({
  skills,
  onChange,
}: {
  skills: ResumeData["skills"];
  onChange: (skills: ResumeData["skills"]) => void;
}) {
  const grouped = skills.reduce<
    Record<string, { name: string; isExpert: boolean; originalIndex: number }[]>
  >((acc, skill, index) => {
    const key = skill.category;
    if (!acc[key]) acc[key] = [];
    acc[key].push({
      name: skill.name,
      isExpert: skill.isExpert,
      originalIndex: index,
    });
    return acc;
  }, {});

  const categories = Object.keys(grouped).sort();

  const updateSkill = (
    category: string,
    originalIndex: number,
    field: "name" | "isExpert",
    value: string | boolean,
  ) => {
    const updated = [...skills];
    if (field === "isExpert") {
      updated[originalIndex] = {
        ...updated[originalIndex],
        isExpert: value as boolean,
        category,
      };
    } else {
      updated[originalIndex] = {
        ...updated[originalIndex],
        [field]: value as string,
        category,
      };
    }
    onChange(updated);
  };

  const removeSkill = (originalIndex: number) => {
    onChange(skills.filter((_, i) => i !== originalIndex));
  };

  const addSkill = (category: string) => {
    onChange([...skills, { category, name: "", isExpert: false }]);
  };

  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const categoryInputRef = useRef<HTMLInputElement>(null);

  const addCategory = (name: string) => {
    if (!name.trim()) return;
    onChange([...skills, { category: name.trim(), name: "", isExpert: false }]);
    setCategoryDialogOpen(false);
  };

  return (
    <div className="space-y-4">
      {categories.map((category) => (
        <div
          key={category}
          className="space-y-4 rounded-md border hairline p-5"
        >
          <div className="flex items-baseline gap-2">
            <FieldLabel className="mb-0">{category}</FieldLabel>
            <span className="font-mono text-xs text-muted-foreground/60">
              ({grouped[category].length})
            </span>
          </div>
          <div className="space-y-2">
            {grouped[category].map((skill) => (
              <div
                key={skill.originalIndex}
                className="flex items-center gap-2"
              >
                <button
                  type="button"
                  onClick={() =>
                    updateSkill(
                      category,
                      skill.originalIndex,
                      "isExpert",
                      !skill.isExpert,
                    )
                  }
                  className="shrink-0 cursor-pointer text-muted-foreground transition-colors hover:text-accent"
                  title="Expert"
                >
                  <Star
                    className={cn(
                      "size-3.5",
                      skill.isExpert && "fill-accent text-accent",
                    )}
                  />
                </button>
                <Input
                  value={skill.name}
                  onChange={(e) =>
                    updateSkill(
                      category,
                      skill.originalIndex,
                      "name",
                      e.target.value,
                    )
                  }
                  placeholder="Skill name"
                />
                <button
                  type="button"
                  onClick={() => removeSkill(skill.originalIndex)}
                  aria-label={`Remove ${skill.name || "skill"}`}
                  className="shrink-0 cursor-pointer text-muted-foreground transition-colors hover:text-destructive-foreground"
                >
                  <X className="size-4" />
                </button>
              </div>
            ))}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full font-mono text-xs text-muted-foreground"
            onClick={() => addSkill(category)}
          >
            <Plus className="size-3.5" />
            add
          </Button>
        </div>
      ))}

      <AddButton onClick={() => setCategoryDialogOpen(true)}>
        add category
      </AddButton>

      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogPopup>
          <DialogHeader>
            <DialogTitle className="lowercase">New category</DialogTitle>
            <DialogDescription className="lowercase">
              Enter a name for the skill category.
            </DialogDescription>
          </DialogHeader>
          <DialogPanel>
            <Input
              ref={categoryInputRef}
              placeholder="e.g. Frameworks"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  addCategory(e.currentTarget.value);
                }
              }}
            />
          </DialogPanel>
          <DialogFooter>
            <DialogClose render={<Button variant="ghost" />}>
              cancel
            </DialogClose>
            <Button
              type="button"
              variant="default"
              onClick={() => {
                const input = categoryInputRef.current;
                if (input) addCategory(input.value);
              }}
            >
              add
            </Button>
          </DialogFooter>
        </DialogPopup>
      </Dialog>
    </div>
  );
}

function EducationEditor({
  education,
  onChange,
}: {
  education: ResumeData["education"];
  onChange: (education: ResumeData["education"]) => void;
}) {
  const [enabled, setEnabled] = useState(education !== null);

  const handleToggle = (checked: boolean) => {
    if (checked) {
      onChange({
        universityName: "",
        progression: "",
        degreeName: "",
        gpa: undefined,
      });
      setEnabled(true);
    } else {
      onChange(null);
      setEnabled(false);
    }
  };

  return (
    <div className="space-y-5">
      <span className="inline-flex items-center gap-3">
        <Switch
          checked={enabled}
          onCheckedChange={handleToggle}
          aria-label="Include education section"
        />
        <span className="font-mono text-xs text-muted-foreground">
          include education section
        </span>
      </span>
      {education && (
        <div className="space-y-5 rounded-md border hairline p-5">
          <div>
            <FieldLabel>degree</FieldLabel>
            <Input
              value={education.degreeName}
              onChange={(e) =>
                onChange({ ...education, degreeName: e.target.value })
              }
              placeholder="B.Sc. Computer Science"
            />
          </div>
          <div>
            <FieldLabel>university</FieldLabel>
            <Input
              value={education.universityName}
              onChange={(e) =>
                onChange({ ...education, universityName: e.target.value })
              }
              placeholder="University of..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <FieldLabel>progression</FieldLabel>
              <Input
                value={education.progression}
                onChange={(e) =>
                  onChange({ ...education, progression: e.target.value })
                }
                placeholder="2016 - 2020"
              />
            </div>
            <div>
              <FieldLabel>gpa (optional)</FieldLabel>
              <Input
                value={education.gpa ?? ""}
                onChange={(e) =>
                  onChange({
                    ...education,
                    gpa: e.target.value || undefined,
                  })
                }
                placeholder="3.8/4.0"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function EditResumePage() {
  const params = useParams<{ resumeId: Id<"resumes"> }>();
  const router = useRouter();
  const resume = useQuery(api.resumes.get, { id: params.resumeId });
  const jobPostings = useQuery(api.jobPostings.list);
  const updateResume = useMutation(api.resumes.update);
  const removeResume = useMutation(api.resumes.remove);

  const [draft, setDraft] = useState<ResumeData>(blankResume);
  const [selectedJobPosting, setSelectedJobPosting] =
    useState<Id<"jobPostings"> | null>(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);

  const loadResume = useCallback(() => {
    if (!resume) return;
    try {
      const data = JSON.parse(resume.content) as ResumeData;
      setDraft(data);
    } catch {
      setDraft(blankResume);
    }
    setSelectedJobPosting(resume.jobPosting ?? null);
    setDirty(false);
  }, [resume]);

  useEffect(() => {
    loadResume();
  }, [loadResume]);

  if (resume === undefined) {
    return (
      <AdminShell>
        <p className="font-mono text-xs text-muted-foreground lowercase">
          loading...
        </p>
      </AdminShell>
    );
  }

  if (resume === null) {
    return (
      <AdminShell>
        <p className="font-mono text-xs text-muted-foreground lowercase">
          resume not found.
        </p>
      </AdminShell>
    );
  }

  const handleSave = async () => {
    setSaving(true);
    try {
      const content = JSON.stringify(draft);
      await updateResume({
        id: params.resumeId,
        content,
        isFrontFacing: resume.isFrontFacing,
        jobPosting: selectedJobPosting ?? undefined,
      });
      setDirty(false);
    } catch (err) {
      console.error("Failed to save resume:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this resume? This cannot be undone.")) return;
    await removeResume({ id: params.resumeId });
    router.push("/admin/resumes");
  };

  const updateField = <K extends keyof ResumeData>(
    key: K,
    value: ResumeData[K],
  ) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  const addExperience = () => {
    setDraft((prev) => ({
      ...prev,
      experiences: [
        ...prev.experiences,
        {
          title: "",
          company: "",
          years: { start: new Date().getFullYear(), end: "Present" },
          description: [],
        },
      ],
    }));
    setDirty(true);
  };

  const removeExperience = (index: number) => {
    setDraft((prev) => ({
      ...prev,
      experiences: prev.experiences.filter((_, i) => i !== index),
    }));
    setDirty(true);
  };

  const moveExperience = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= draft.experiences.length) return;
    setDraft((prev) => {
      const experiences = [...prev.experiences];
      [experiences[index], experiences[newIndex]] = [
        experiences[newIndex],
        experiences[index],
      ];
      return { ...prev, experiences };
    });
    setDirty(true);
  };

  const selectedJp = selectedJobPosting
    ? jobPostings?.find((j) => j._id === selectedJobPosting)
    : undefined;

  return (
    <AdminShell>
      <AdminPageHeader
        eyebrow="admin / resumes"
        title="Edit resume"
        meta={new Date(resume.createdAt).toLocaleDateString("en-CA", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      >
        {resume.isFrontFacing && <Pill tone="live">live</Pill>}
        <DownloadResumeButton
          data={draft}
          company={selectedJp?.company}
          position={selectedJp?.title}
        />
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => router.push("/admin/resumes")}
          aria-label="Back to resumes"
        >
          <ArrowLeft className="size-4" />
        </Button>
      </AdminPageHeader>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <Button variant="destructive-outline" size="sm" onClick={handleDelete}>
          <Trash2 className="size-3.5" />
          delete
        </Button>
        <Button variant="ghost" size="sm" onClick={loadResume}>
          discard changes
        </Button>
      </div>

      <AdminSection
        index="01"
        title="job posting"
        actions={
          !resume.isFrontFacing ? (
            <Button
              variant="outline"
              size="sm"
              disabled={generating}
              onClick={async () => {
                setGenerating(true);
                try {
                  const res = await fetch("/api/resumes/generate", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      jobPostingId: selectedJobPosting ?? undefined,
                    }),
                  });
                  if (!res.ok) {
                    throw new Error(await res.text());
                  }
                  const data: ResumeData = await res.json();
                  setDraft(data);
                  setDirty(true);
                } catch (err) {
                  console.error("Generation failed:", err);
                } finally {
                  setGenerating(false);
                }
              }}
            >
              <Sparkles className="size-3.5 text-accent" />
              {generating ? "generating..." : "generate"}
            </Button>
          ) : undefined
        }
      >
        {resume.isFrontFacing ? (
          <p className="font-mono text-xs text-muted-foreground lowercase">
            the live resume cannot be linked to a job posting.
          </p>
        ) : (
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
        )}
      </AdminSection>

      <AdminSection index="02" title="profile">
        <Textarea
          value={draft.profile}
          onChange={(e) => updateField("profile", e.target.value)}
          placeholder="Write a brief professional summary..."
          rows={4}
        />
      </AdminSection>

      <AdminSection index="03" title="experience">
        <div className="space-y-4">
          {draft.experiences.map((exp, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: editor rows have no stable id; state is positional
            <div key={index} className="relative">
              <div className="absolute top-4 -left-9 hidden flex-col sm:flex">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => moveExperience(index, "up")}
                  disabled={index === 0}
                  aria-label="Move experience up"
                  className="text-muted-foreground disabled:opacity-20"
                >
                  <ChevronUp className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => moveExperience(index, "down")}
                  disabled={index === draft.experiences.length - 1}
                  aria-label="Move experience down"
                  className="text-muted-foreground disabled:opacity-20"
                >
                  <ChevronDown className="size-4" />
                </Button>
              </div>
              <ExperienceEditor
                experience={exp}
                index={index}
                onChange={(i, updated) => {
                  setDraft((prev) => ({
                    ...prev,
                    experiences: prev.experiences.map((e, j) =>
                      j === i ? updated : e,
                    ),
                  }));
                  setDirty(true);
                }}
                onRemove={removeExperience}
              />
            </div>
          ))}
          <AddButton onClick={addExperience}>add experience</AddButton>
        </div>
      </AdminSection>

      <AdminSection index="04" title="skills">
        <SkillEditor
          skills={draft.skills}
          onChange={(skills) => updateField("skills", skills)}
        />
      </AdminSection>

      <AdminSection index="05" title="education" className="mb-4">
        <EducationEditor
          education={draft.education}
          onChange={(education) => updateField("education", education)}
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

"use client";

import { useMutation, useQuery } from "convex/react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, Eye, Plus, Save, Star, Trash2, X } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Switch } from "~/components/ui/switch";
import { Textarea } from "~/components/ui/textarea";
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { cn } from "~/lib/utils";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import type { ResumeData } from "~/lib/resume";

const blankResume: ResumeData = {
  profile: "",
  experiences: [],
  skills: [],
  education: null,
};

function SectionHeader({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-start justify-between mb-4 gap-4">
      <h2 className="text-lg font-semibold tracking-tight lowercase">
        {title}
      </h2>
      {children}
    </div>
  );
}

function Label({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label
      className={cn(
        "block text-xs font-medium text-muted-foreground lowercase tracking-wider mb-1.5",
        className,
      )}
    >
      {children}
    </label>
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

  const update = (
    field: Partial<ResumeData["experiences"][number]>,
  ) => {
    const start = field.years?.start ?? (Number(startYear) || 0);
    const end =
      endYear === "Present"
        ? ("Present" as const)
        : (Number(endYear) || 0);
    onChange(index, {
      ...experience,
      years: { start, end },
      address: address || undefined,
      title,
      company,
      description: description
        .split("\n")
        .filter((line) => line.trim() !== ""),
      ...field,
    });
  };

  return (
    <div className="relative p-4 space-y-4">
      <Button
        type="button"
        onClick={() => onRemove(index)}
        className="absolute -top-2 right-2 text-muted-foreground hover:text-destructive transition-colors"
        variant="ghost"
      >
        X
      </Button>

      <div className="flex flex-row gap-2">
        <div>
          <Input
            min={1997}
            max={2100}
            value={startYear}
            onChange={(e) => {
              setStartYear(e.target.value);
              update({ years: { start: Number(e.target.value) || 0, end: endYear === "Present" ? "Present" : Number(endYear) || 0 } });
            }}
            placeholder={`${new Date().getFullYear()}`}
          />
        </div>
        -
        <div>
          <Input
            value={endYear}
            onChange={(e) => {
              setEndYear(e.target.value);
              const end = e.target.value === "Present" ? "Present" : Number(e.target.value) || 0;
              update({ years: { start: Number(startYear) || 0, end } });
            }}
            placeholder="Present"
          />
        </div>
        in
        <div className="col-span-2">
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

      <div className="flex flex-row gap-2 justify-center items-center">
        <div className="flex-1">
          <Input
            className="text-sm"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              update({ title: e.target.value });
            }}
            placeholder="Software Developer"
          />
        </div>
        @
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

      <div>
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
          placeholder="Led development of..."
          rows={7}
        />
      </div>
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
    <div className="space-y-6">
      {categories.map((category) => (
        <div key={category} className="rounded-none p-4 space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <Label className="mb-0">{category}</Label>
            <span className="text-xs text-muted-foreground">
              ({grouped[category].length})
            </span>
          </div>
          <div className="space-y-3">
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
                  className="shrink-0 transition-colors text-muted-foreground hover:text-yellow-500"
                  title="Expert"
                >
                  <Star
                    className={cn(
                      "size-3.5",
                      skill.isExpert && "fill-yellow-500 text-yellow-500",
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
                  className="text-sm"
                />
                <button
                  type="button"
                  onClick={() => removeSkill(skill.originalIndex)}
                  className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
                >
                  <X className="size-4" />
                </button>
              </div>
            ))}
          </div>
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => addSkill(category)}
          >
            <Plus className="size-3.5" />
            add
          </Button>
        </div>
      ))}

      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogTrigger
          render={
            <Button
              variant="ghost"
              className="w-full h-40 border border-border/50"
            />
          }
        >
          <Plus className="size-3.5" />
          add category
        </DialogTrigger>
        <DialogPopup>
          <DialogHeader>
            <DialogTitle className="lowercase">New Category</DialogTitle>
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
            <DialogClose
              render={<Button variant="ghost" />}
            >
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
    <div className="space-y-4">
      <Label className="inline-flex items-center gap-3 cursor-pointer">
        <Switch
          checked={enabled}
          onCheckedChange={handleToggle}
        />
        Include education section
      </Label>
      {education && (
        <div className="p-4 space-y-4">
          <div>
            <Label>Degree</Label>
            <Input
              value={education.degreeName}
              onChange={(e) =>
                onChange({ ...education, degreeName: e.target.value })
              }
              placeholder="B.Sc. Computer Science"
            />
          </div>
          <div>
            <Label>University</Label>
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
              <Label>Progression</Label>
              <Input
                value={education.progression}
                onChange={(e) =>
                  onChange({ ...education, progression: e.target.value })
                }
                placeholder="2016 - 2020"
              />
            </div>
            <div>
              <Label>GPA (optional)</Label>
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
  const [selectedJobPosting, setSelectedJobPosting] = useState<Id<"jobPostings"> | null>(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

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
      <main id="main-content" tabIndex={-1}>
        <div className="tw-content flex min-h-screen items-center justify-center pt-admin-navbar">
          <p className="text-muted-foreground lowercase animate-pulse">
            Loading...
          </p>
        </div>
      </main>
    );
  }

  if (resume === null) {
    return (
      <main id="main-content" tabIndex={-1}>
        <div className="tw-content flex min-h-screen items-center justify-center pt-admin-navbar">
          <p className="text-muted-foreground lowercase">Resume not found.</p>
        </div>
      </main>
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
                onClick={() => router.push("/admin/resumes")}
              >
                <ArrowLeft className="size-4" />
              </Button>
              <div>
                <h1 className="text-xl font-semibold tracking-tight lowercase">
                  Edit Resume
                </h1>
                <p className="text-xs text-muted-foreground lowercase">
                  {new Date(resume.createdAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                  {resume.isFrontFacing && (
                    <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-0.5 text-[10px] font-medium text-green-500">
                      <Eye className="size-3" /> live
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2" />
          </div>

          {/* Actions Bar */}
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              <Trash2 className="size-3.5" />
              delete
            </Button>
            <Button variant="ghost" size="sm" onClick={loadResume}>
              discard changes
            </Button>
          </div>

          {/* Job Posting */}
          <section>
            <SectionHeader title="Job Posting" />
            {resume.isFrontFacing ? (
              <p className="text-xs text-muted-foreground lowercase">
                The live resume cannot be linked to a job posting.
              </p>
            ) : (
              <select
                value={selectedJobPosting ?? ""}
                onChange={(e) => {
                  setSelectedJobPosting((e.target.value || null) as Id<"jobPostings"> | null);
                  setDirty(true);
                }}
                className="w-full rounded-none bg-transparent px-3 py-2 text-sm lowercase focus:outline-none"
              >
                <option value="">None</option>
                {jobPostings?.map((posting) => (
                  <option key={posting._id} value={posting._id}>
                    {posting.title || "Untitled"} — {posting.company}
                  </option>
                ))}
              </select>
            )}
          </section>

          {/* Editor Content */}
          <div className="space-y-10">
              {/* Profile */}
              <section>
                <SectionHeader title="Profile" />
                <Textarea
                  value={draft.profile}
                  onChange={(e) => updateField("profile", e.target.value)}
                  placeholder="Write a brief professional summary..."
                  rows={4}
                />
              </section>

              {/* Experiences */}
              <section className="space-y-4">
                <SectionHeader title="Experiences" />

                <div className="space-y-4">
                  {draft.experiences.map((exp, index) => (
                    <div key={index} className="relative">
                      <div className="absolute -left-6 top-4 flex flex-col gap-0.5">
                        <Button
                          type="button"
                          onClick={() => moveExperience(index, "up")}
                          disabled={index === 0}
                          className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-20 -ml-2"
                          title="Move up"
                          variant="ghost"
                        >
                          ▲
                        </Button>
                        <Button
                          type="button"
                          onClick={() => moveExperience(index, "down")}
                          disabled={index === draft.experiences.length - 1}
                          className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-20 -ml-2"
                          title="Move down"
                          variant="ghost"
                        >
                          ▼
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
                </div>
                <Button
                  variant="ghost"
                  className="w-full h-40 border border-border/50"
                  onClick={addExperience}
                >
                  <Plus className="size-3.5" />
                  add
                </Button>
              </section>

              {/* Skills */}
              <section>
                <SectionHeader title="Skills" />
                <SkillEditor
                  skills={draft.skills}
                  onChange={(skills) => updateField("skills", skills)}
                />
              </section>

              {/* Education */}
              <section>
                <SectionHeader title="Education" />
                <EducationEditor
                  education={draft.education}
                  onChange={(education) => updateField("education", education)}
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
                {saving ? "saving..." : "save resume"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

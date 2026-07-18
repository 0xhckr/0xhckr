"use client";

import { useMutation } from "convex/react";
import { Plus } from "lucide-react";
import { Button } from "~/components/ui/button";
import type { ResumeData } from "~/lib/resume";
import { api } from "../../convex/_generated/api";

const blankResume: ResumeData = {
  profile: "",
  experiences: [],
  skills: [],
  education: null,
};

export const CreateResumeButton = () => {
  const createResume = useMutation(api.resumes.create);

  const handleClick = async () => {
    await createResume({ content: JSON.stringify(blankResume) });
  };

  return (
    <Button
      onClick={handleClick}
      aria-label="Create blank resume"
      variant="ghost"
      size="icon-xl"
    >
      <Plus />
    </Button>
  );
};

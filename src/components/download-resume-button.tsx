"use client";

import { useCallback } from "react";
import { FileDown } from "lucide-react";
import { Button } from "~/components/ui/button";
import { generateResumePDF } from "~/lib/generate-resume-pdf";
import type { ResumeData } from "~/lib/resume";

interface DownloadResumeButtonProps {
  data: ResumeData;
  company?: string;
  position?: string;
}

const buildResumeFilename = (company?: string, position?: string) => {
  const parts = ["Mohammad_Al-Ahdal"];
  if (company) parts.push(company.replace(/\s+/g, "_"));
  if (position) parts.push(position.replace(/\s+/g, "_"));
  parts.push("Resume");
  return `${parts.join("_")}.pdf`;
};

export const DownloadResumeButton = ({ data, company, position }: DownloadResumeButtonProps) => {
  const handleClick = useCallback(async () => {
    const doc = await generateResumePDF(data);
    doc.save(buildResumeFilename(company, position));
  }, [data, company, position]);

  return (
    <Button
      onClick={handleClick}
      aria-label="Download resume as PDF"
      variant="ghost"
      size="icon-lg"
      className="size-10"
    >
      <FileDown className="size-6" />
    </Button>
  );
};

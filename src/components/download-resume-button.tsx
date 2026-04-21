"use client";

import { useCallback } from "react";
import { FileDown } from "lucide-react";
import { Button } from "~/components/ui/button";
import { generateResumePDF } from "~/lib/generate-resume-pdf";
import { resumeData } from "~/lib/resume";

export const DownloadResumeButton = () => {
  const handleClick = useCallback(async () => {
    const doc = await generateResumePDF(resumeData);
    doc.save("resume-mohammad-alahdal.pdf");
  }, []);

  return (
    <Button
      onClick={handleClick}
      aria-label="Download resume as PDF"
      variant="ghost"
      size="icon-xl"
    >
      <FileDown />
    </Button>
  );
};

"use client";

import { FileDown } from "lucide-react";
import { useCallback } from "react";
import { Button } from "~/components/ui/button";
import { generateCoverLetterPDF } from "~/lib/generate-cover-letter-pdf";

interface DownloadCoverLetterButtonProps {
  content: string;
  jobTitle?: string;
  company?: string;
}

export const DownloadCoverLetterButton = ({
  content,
  jobTitle,
  company,
}: DownloadCoverLetterButtonProps) => {
  const handleClick = useCallback(async () => {
    const doc = await generateCoverLetterPDF({ content, jobTitle, company });
    const filename = company
      ? `cover-letter-${company.toLowerCase().replace(/\s+/g, "-")}.pdf`
      : "cover-letter-mohammad-alahdal.pdf";
    doc.save(filename);
  }, [content, jobTitle, company]);

  return (
    <Button
      onClick={handleClick}
      aria-label="Download cover letter as PDF"
      variant="ghost"
      size="icon-lg"
      className="size-10"
      disabled={!content}
    >
      <FileDown className="size-6" />
    </Button>
  );
};

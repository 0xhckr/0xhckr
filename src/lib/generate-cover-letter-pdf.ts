import jsPDF from "jspdf";

const ACCENT = "#003c3c";
const TEXT = "#1a1a1a";
const MUTED = "#6b7280";
const LIGHT = "#f3f4f6";
const PAGE_WIDTH = 210;
const MARGIN = 14;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

function splitLines(doc: jsPDF, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  const words = text.split(" ");
  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (doc.getTextWidth(testLine) > maxWidth) {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);

  return lines;
}

function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return [0, 0, 0];
  return [
    Number.parseInt(result[1], 16),
    Number.parseInt(result[2], 16),
    Number.parseInt(result[3], 16),
  ];
}

interface CoverLetterData {
  content: string;
  jobTitle?: string;
  company?: string;
}

export async function generateCoverLetterPDF(
  data: CoverLetterData,
): Promise<jsPDF> {
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  const [regularBuf, boldBuf] = await Promise.all([
    fetch("/fonts/DMSans.ttf").then((r) => r.arrayBuffer()),
    fetch("/fonts/DMSans-Bold.ttf").then((r) => r.arrayBuffer()),
  ]);

  const toBase64 = (buf: ArrayBuffer) =>
    btoa(
      new Uint8Array(buf).reduce(
        (data, byte) => data + String.fromCharCode(byte),
        "",
      ),
    );

  doc.addFileToVFS("DMSans-Regular.ttf", toBase64(regularBuf));
  doc.addFont("DMSans-Regular.ttf", "DMSans", "normal");
  doc.addFont("DMSans-Regular.ttf", "DMSans", "italic");

  doc.addFileToVFS("DMSans-Bold.ttf", toBase64(boldBuf));
  doc.addFont("DMSans-Bold.ttf", "DMSans", "bold");

  const font = (weight: "normal" | "bold") => {
    doc.setFont("DMSans", weight);
  };

  let y = MARGIN;

  const checkPage = (needed: number) => {
    if (y + needed > 297 - MARGIN) {
      doc.addPage();
      y = MARGIN;
    }
  };

  // Header
  font("bold");
  doc.setFontSize(24);
  doc.setTextColor(...hexToRgb(ACCENT));
  doc.text("Mohammad Al-Ahdal", MARGIN, y);
  y += 6;

  font("normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...hexToRgb(MUTED));
  doc.text("Software Developer", MARGIN, y);
  y += 5;

  const links = [
    { label: "0xhckr.dev", url: "https://0xhckr.dev" },
    { label: "github.com/0xhckr", url: "https://github.com/0xhckr" },
    { label: "x.com/0xhckrdev", url: "https://x.com/0xhckrdev" },
    {
      label: "linkedin.com/in/mohammadalahdal",
      url: "https://linkedin.com/in/mohammadalahdal",
    },
    { label: "hello@0xhckr.dev", url: "mailto:hello@0xhckr.dev" },
  ];

  font("bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...hexToRgb(ACCENT));
  let linkX = MARGIN;
  for (let i = 0; i < links.length; i++) {
    const link = links[i];
    const w = doc.getTextWidth(link.label);
    doc.textWithLink(link.label, linkX, y, { url: link.url });
    linkX += w;
    if (i < links.length - 1) {
      const sep = "  ·  ";
      doc.setTextColor(...hexToRgb(MUTED));
      doc.text(sep, linkX, y);
      doc.setTextColor(...hexToRgb(ACCENT));
      linkX += doc.getTextWidth(sep);
    }
  }
  y += 3;

  // Divider
  doc.setDrawColor(...hexToRgb(LIGHT));
  doc.setLineWidth(0.3);
  doc.line(0, y, PAGE_WIDTH, y);
  y += 8;

  // Job title + company if available
  if (data.jobTitle || data.company) {
    font("bold");
    doc.setFontSize(11);
    doc.setTextColor(...hexToRgb(ACCENT));
    const titleParts: string[] = [];
    if (data.jobTitle) titleParts.push(data.jobTitle);
    if (data.company) titleParts.push(data.company);
    doc.text(titleParts.join(" - "), MARGIN, y);
    y += 8;
  }

  // Date
  font("normal");
  doc.setFontSize(9);
  doc.setTextColor(...hexToRgb(MUTED));
  doc.text(
    new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    MARGIN,
    y,
  );
  y += 8;

  // Body content - split by double newlines into paragraphs
  const paragraphs = data.content.split(/\n\s*\n/).filter((p) => p.trim());

  for (const paragraph of paragraphs) {
    font("normal");
    doc.setFontSize(9.5);
    doc.setTextColor(...hexToRgb(TEXT));
    const lines = splitLines(doc, paragraph.trim(), CONTENT_WIDTH);
    for (const line of lines) {
      checkPage(5);
      doc.text(line, MARGIN, y);
      y += 4.5;
    }
    y += 4;
  }

  // Closing
  y += 4;
  checkPage(20);
  font("normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...hexToRgb(TEXT));
  doc.text("Sincerely,", MARGIN, y);
  y += 8;
  font("bold");
  doc.text("Mohammad Al-Ahdal", MARGIN, y);

  return doc;
}

import type { ResumeData } from "~/lib/resume";
import jsPDF from "jspdf";

const ACCENT = "#003c3c";
const TEXT = "#1a1a1a";
const MUTED = "#6b7280";
const LIGHT = "#f3f4f6";
const PAGE_WIDTH = 210;
const MARGIN = 18;
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

export async function generateResumePDF(data: ResumeData): Promise<jsPDF> {
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

  const addSectionHeading = (text: string) => {
    checkPage(14);
    y += 5;
    font("bold");
    doc.setFontSize(14);
    doc.setTextColor(...hexToRgb(ACCENT));
    const upper = text.toUpperCase();
    const spacing = 1.2;
    let x = MARGIN;
    for (const char of upper) {
      doc.text(char, x, y);
      x += doc.getTextWidth(char) + spacing;
    }
    y += 8;
  };

  const addExperience = (exp: ResumeData["experiences"][number]) => {
    checkPage(22);

    font("bold");
    doc.setFontSize(10);
    doc.setTextColor(...hexToRgb(TEXT));
    const titleW = doc.getTextWidth(exp.title);
    doc.text(exp.title, MARGIN, y);
    font("normal");
    doc.setFontSize(10);
    doc.setTextColor(...hexToRgb(TEXT));
    const atW = doc.getTextWidth(" @ ");
    doc.text(` @ `, MARGIN + titleW, y);
    doc.text(`${exp.company} | ${exp.address}`, MARGIN + titleW + atW, y);

    const years =
      exp.years.start === exp.years.end
        ? `${exp.years.start}`
        : `${exp.years.start} - ${exp.years.end}`;
    font("bold");
    doc.setFontSize(8.5);
    doc.setTextColor(...hexToRgb(MUTED));
    doc.text(years, MARGIN + CONTENT_WIDTH, y, { align: "right" });

    y += 5;
    font("normal");
    doc.setFontSize(9);
    doc.setTextColor(...hexToRgb(TEXT));

    if (Array.isArray(exp.description)) {
      const bulletWidth = doc.getTextWidth("• ");
      const textWidth = CONTENT_WIDTH - 2 - bulletWidth;
      const textX = MARGIN + 2 + bulletWidth;

      for (const item of exp.description) {
        const lines = splitLines(doc, item, textWidth);
        for (let i = 0; i < lines.length; i++) {
          checkPage(5);
          if (i === 0) {
            doc.text("• ", MARGIN + 2, y);
          }
          doc.text(lines[i], textX, y);
          y += 4.2;
        }
      }
    } else {
      const lines = splitLines(doc, exp.description, CONTENT_WIDTH - 2);
      for (const line of lines) {
        checkPage(5);
        doc.text(line, MARGIN + 2, y);
        y += 4.2;
      }
    }
    y += 2;
  };

  const addSkills = (skills: ResumeData["skills"]) => {
    const grouped = skills.reduce<
      Record<string, { name: string; isExpert: string }[]>
    >((acc, skill) => {
      const key = skill.category;
      if (!acc[key]) acc[key] = [];
      acc[key].push({ name: skill.name, isExpert: skill.isExpert });
      return acc;
    }, {});

    for (const [category, categorySkills] of Object.entries(grouped)) {
      checkPage(10);

      font("normal");
      doc.setFontSize(9);
      doc.setTextColor(...hexToRgb(MUTED));
      doc.text(category, MARGIN, y);
      y += 6;
      let x = MARGIN;

      for (const skill of categorySkills) {
        const label = skill.name;
        const w = doc.getTextWidth(label) + 6;

        if (x + w > MARGIN + CONTENT_WIDTH) {
          x = MARGIN;
          y += 7.5;
        }

        doc.setFillColor(...hexToRgb(LIGHT));
        doc.setTextColor(...hexToRgb(MUTED));
        if (skill.isExpert === "yes") {
          font("bold");
        } else {
          font("normal");
        }
        doc.setFontSize(8.5);
        doc.roundedRect(x, y - 3.2, w, 4.8, 1, 1, "F");
        doc.text(label, x + 3, y);
        x += w + 2;
      }
      y += 10;
    }
  };

  // Header
  font("bold");
  doc.setFontSize(26);
  doc.setTextColor(...hexToRgb(ACCENT));
  doc.text("Mohammad Al-Ahdal", MARGIN, y);
  y += 7;

  font("normal");
  doc.setFontSize(10);
  doc.setTextColor(...hexToRgb(MUTED));
  doc.text("Software Developer", MARGIN, y);
  y += 5;

  const links = [
    { label: "github.com/0xhckr", url: "https://github.com/0xhckr" },
    { label: "x.com/0xhckrdev", url: "https://x.com/0xhckrdev" },
    {
      label: "linkedin.com/in/mohammadalahdal",
      url: "https://linkedin.com/in/mohammadalahdal",
    },
    { label: "hello@0xhckr.dev", url: "mailto:hello@0xhckr.dev" },
  ];

  font("bold");
  doc.setFontSize(8);
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
  y += 10;

  // Profile
  addSectionHeading("Profile");
  font("normal");
  doc.setFontSize(9);
  doc.setTextColor(...hexToRgb(TEXT));
  const profileLines = splitLines(doc, data.profile, CONTENT_WIDTH - 2);
  for (const line of profileLines) {
    checkPage(5);
    doc.text(line, MARGIN + 2, y);
    y += 4.2;
  }

  // Experience
  addSectionHeading("Work Experience");
  for (const exp of data.experiences) {
    addExperience(exp);
  }

  // Skills
  doc.addPage();
  y = MARGIN;
  addSectionHeading("Skills");
  addSkills(data.skills);

  // Education
  if (data.education) {
    addSectionHeading("Education");
    checkPage(14);

    font("bold");
    doc.setFontSize(10);
    doc.setTextColor(...hexToRgb(TEXT));
    doc.text(data.education.degreeName, MARGIN, y);
    y += 5;

    font("normal");
    doc.setFontSize(9);
    doc.text(data.education.universityName, MARGIN, y);
    y += 4;

    doc.setTextColor(...hexToRgb(MUTED));
    doc.text(data.education.progression, MARGIN, y);

    if (data.education.gpa) {
      y += 4;
      doc.text(`GPA: ${data.education.gpa}`, MARGIN, y);
    }
  }

  return doc;
}

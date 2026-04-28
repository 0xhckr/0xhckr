import type { ResumeData } from "~/lib/resume";
import jsPDF from "jspdf";

const ACCENT = "#003c3c";
const TEXT = "#1a1a1a";
const MUTED = "#6b7280";
const LIGHT = "#f3f4f6";
const PAGE_WIDTH = 210;
const MARGIN = 14;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const SIDEBAR_WIDTH = 58;
const MAIN_WIDTH = CONTENT_WIDTH - SIDEBAR_WIDTH - 8;

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

  let mainY = MARGIN;
  let sideY = MARGIN;

  const LEFT_X = MARGIN;
  const SIDE_X = MARGIN + MAIN_WIDTH + 8;

  const checkPageMain = (needed: number) => {
    if (mainY + needed > 297 - MARGIN) {
      doc.addPage();
      mainY = MARGIN;
      sideY = MARGIN;
    }
  };

  const checkPageSide = (needed: number) => {
    if (sideY + needed > 297 - MARGIN) {
      doc.addPage();
      mainY = MARGIN;
      sideY = MARGIN;
    }
  };

  const addSectionHeading = (text: string, x: number) => {
    font("bold");
    doc.setFontSize(11);
    doc.setTextColor(...hexToRgb(ACCENT));
    const upper = text.toUpperCase();
    const spacing = 0.8;
    let cx = x;
    for (const char of upper) {
      doc.text(char, cx, mainY);
      cx += doc.getTextWidth(char) + spacing;
    }
  };

  const addExperience = (exp: ResumeData["experiences"][number]) => {
    checkPageMain(22);

    const years =
      exp.years.start === exp.years.end
        ? `${exp.years.start}`
        : `${exp.years.start} - ${exp.years.end}`;
    font("bold");
    doc.setFontSize(8);
    doc.setTextColor(...hexToRgb(MUTED));
    doc.text(years, LEFT_X, mainY);

    mainY += 3.5;

    font("bold");
    doc.setFontSize(9.5);
    doc.setTextColor(...hexToRgb(TEXT));
    const titleW = doc.getTextWidth(exp.title);
    doc.text(exp.title, LEFT_X, mainY);
    font("normal");
    doc.setFontSize(9.5);
    doc.setTextColor(...hexToRgb(TEXT));
    const atW = doc.getTextWidth(" @ ");
    doc.text(` @ `, LEFT_X + titleW, mainY);
    doc.text(
      `${exp.company}${exp.address ? ` | ${exp.address}` : ""}`,
      LEFT_X + titleW + atW,
      mainY,
    );

    mainY += 4.5;
    font("normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...hexToRgb(TEXT));

    if (Array.isArray(exp.description)) {
      const bulletWidth = doc.getTextWidth("• ");
      const textWidth = MAIN_WIDTH - 2 - bulletWidth;
      const textX = LEFT_X + 2 + bulletWidth;

      for (const item of exp.description) {
        const lines = splitLines(doc, item, textWidth);
        for (let i = 0; i < lines.length; i++) {
          checkPageMain(5);
          if (i === 0) {
            doc.text("• ", LEFT_X + 2, mainY);
          }
          doc.text(lines[i], textX, mainY);
          mainY += 3.8;
        }
      }
    } else {
      const lines = splitLines(doc, exp.description, MAIN_WIDTH - 2);
      for (const line of lines) {
        checkPageMain(5);
        doc.text(line, LEFT_X + 2, mainY);
        mainY += 3.8;
      }
    }
    mainY += 5;
  };

  const addSideHeading = (text: string) => {
    font("bold");
    doc.setFontSize(11);
    doc.setTextColor(...hexToRgb(ACCENT));
    const upper = text.toUpperCase();
    const spacing = 0.8;
    let cx = SIDE_X;
    for (const char of upper) {
      doc.text(char, cx, sideY);
      cx += doc.getTextWidth(char) + spacing;
    }
    sideY += 8;
  };

  const addSkills = (skills: ResumeData["skills"]) => {
    const grouped = skills.reduce<
      Record<string, { name: string; isExpert: boolean }[]>
    >((acc, skill) => {
      const key = skill.category;
      if (!acc[key]) acc[key] = [];
      acc[key].push({ name: skill.name, isExpert: skill.isExpert });
      return acc;
    }, {});

    for (const [category, categorySkills] of Object.entries(grouped)) {
      checkPageSide(10);

      font("bold");
      doc.setFontSize(9);
      doc.setTextColor(...hexToRgb(ACCENT));
      doc.text(category.toUpperCase(), SIDE_X, sideY);
      sideY += 5.5;
      let x = SIDE_X;

      for (const skill of categorySkills) {
        const label = skill.name;
        if (skill.isExpert) {
          font("bold");
        } else {
          font("normal");
        }
        doc.setFontSize(7.5);
        const w = doc.getTextWidth(label) + 5;

        if (x + w > SIDE_X + SIDEBAR_WIDTH) {
          x = SIDE_X;
          sideY += 7;
          checkPageSide(7);
        }

        doc.setFillColor(...hexToRgb(LIGHT));
        doc.setTextColor(...hexToRgb(MUTED));
        if (skill.isExpert) {
          font("bold");
        } else {
          font("normal");
        }
        doc.setFontSize(7.5);
        doc.roundedRect(x, sideY - 3, w, 4.5, 1, 1, "F");
        doc.text(label, x + 2.5, sideY);
        x += w + 1.5;
      }
      sideY += 8;
    }
  };

  // Header - full width
  font("bold");
  doc.setFontSize(24);
  doc.setTextColor(...hexToRgb(ACCENT));
  doc.text("Mohammad Al-Ahdal", MARGIN, mainY);
  mainY += 6;

  font("normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...hexToRgb(MUTED));
  doc.text("Software Developer", MARGIN, mainY);
  mainY += 5;

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
    doc.textWithLink(link.label, linkX, mainY, { url: link.url });
    linkX += w;
    if (i < links.length - 1) {
      const sep = "  ·  ";
      doc.setTextColor(...hexToRgb(MUTED));
      doc.text(sep, linkX, mainY);
      doc.setTextColor(...hexToRgb(ACCENT));
      linkX += doc.getTextWidth(sep);
    }
  }
  mainY += 3;

  doc.setDrawColor(...hexToRgb(LIGHT));
  doc.setLineWidth(0.3);
  doc.line(0, mainY, PAGE_WIDTH, mainY);
  mainY += 3;

  sideY = mainY;

  // Sidebar: Skills
  sideY += 4;
  addSideHeading("Skills & Tools");
  addSkills(data.skills);

  // Main column: divider line then content
  doc.setDrawColor(...hexToRgb(LIGHT));
  doc.setLineWidth(0.3);
  doc.line(SIDE_X - 4, mainY - 3, SIDE_X - 4, 297);

  // Profile
  mainY += 4;
  addSectionHeading("Profile", LEFT_X);
  mainY += 6;
  font("normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...hexToRgb(TEXT));
  const profileLines = splitLines(doc, data.profile, MAIN_WIDTH - 2);
  for (const line of profileLines) {
    checkPageMain(5);
    doc.text(line, LEFT_X + 2, mainY);
    mainY += 3.8;
  }

  // Experience
  mainY += 4;
  addSectionHeading("Work Experience", LEFT_X);
  mainY += 6;
  for (const exp of data.experiences) {
    addExperience(exp);
  }

  // Education
  if (data.education) {
    mainY += 2;
    checkPageMain(14);
    addSectionHeading("Education", LEFT_X);
    mainY += 6;

    font("bold");
    doc.setFontSize(9.5);
    doc.setTextColor(...hexToRgb(TEXT));
    doc.text(data.education.degreeName, LEFT_X, mainY);
    mainY += 4.5;

    font("normal");
    doc.setFontSize(8.5);
    doc.text(data.education.universityName, LEFT_X, mainY);
    mainY += 3.5;

    doc.setTextColor(...hexToRgb(MUTED));
    doc.text(data.education.progression, LEFT_X, mainY);

    if (data.education.gpa) {
      mainY += 3.5;
      doc.text(`GPA: ${data.education.gpa}`, LEFT_X, mainY);
    }
  }

  return doc;
}

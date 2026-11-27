/**
 * Writes the Fresher Resume (Template #001) as an editable A4 Word file.
 * Same layout as the downloadable template: navy name and headings, a line beside
 * each heading, dates on the right, and skills in up to three columns.
 */
import {
  AlignmentType, BorderStyle, Document, LeaderType, Tab, LevelFormat, Packer, Paragraph, Table, TableCell,
  TableLayoutType, TableRow, TabStopType, TextRun, VerticalAlign, WidthType,
} from "docx";

import {
  contactParts, hasEducation, hasExperience, hasProject, hasSkills, lines, splitLabel, type Resume,
} from "@/lib/resume/model";

const FONT = "Cambria";
const NAVY = "1B2F5B";
const RULE = "8496B0";
const TEXT = "1A1A1A";
const PAGE_W = 11906;
const MARGIN_X = 760;
const TEXT_W = PAGE_W - MARGIN_X * 2;
const pt = (n: number) => n * 2;
const GAP = 140;

const rightTab = [{ type: TabStopType.RIGHT, position: TEXT_W }];

function heading(text: string) {
  return new Paragraph({
    style: "Heading1",
    tabStops: [{ type: TabStopType.RIGHT, position: TEXT_W, leader: LeaderType.UNDERSCORE }],
    children: [new TextRun(text), new TextRun({ children: ["  ", new Tab()], color: RULE, bold: false })],
  });
}

function entry(title: string, dates: string, extra: TextRun[] = []) {
  return new Paragraph({
    style: "EntryTitle",
    tabStops: rightTab,
    children: [new TextRun({ text: title, bold: true }), ...extra, ...(dates ? [new TextRun({ children: [new Tab(), dates], bold: false })] : [])],
  });
}

const body = (children: TextRun[], after?: number) =>
  new Paragraph({ style: "BodyLine", children, ...(after ? { spacing: { after } } : {}) });

const bullet = (text: string, ref = "bullets", after?: number) =>
  new Paragraph({ style: "BulletItem", numbering: { reference: ref, level: 0 }, children: [new TextRun(text)], ...(after ? { spacing: { after } } : {}) });

function labelled(value: string) {
  const [label, rest] = splitLabel(value);
  return label ? [new TextRun({ text: label, bold: true }), new TextRun(rest)] : [new TextRun(rest)];
}

function skillsTable(groups: Resume["skills"]) {
  const none = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
  const divider = { style: BorderStyle.SINGLE, size: 6, color: "A6A6A6" };
  const preset = [[TEXT_W], [5000, TEXT_W - 5000], [3500, 3300, TEXT_W - 6800]][groups.length - 1];
  return new Table({
    width: { size: TEXT_W, type: WidthType.DXA },
    columnWidths: preset,
    layout: TableLayoutType.FIXED,
    borders: { top: none, bottom: none, left: none, right: none, insideHorizontal: none, insideVertical: none },
    rows: [
      new TableRow({
        children: groups.map((group, i) =>
          new TableCell({
            width: { size: preset[i], type: WidthType.DXA },
            verticalAlign: VerticalAlign.TOP,
            margins: { top: 0, bottom: 0, left: i === 0 ? 160 : 300, right: 120 },
            borders: { top: none, bottom: none, right: none, left: i === 0 ? none : divider },
            children: [
              new Paragraph({ style: "SkillHead", children: [new TextRun(group.heading.trim())] }),
              ...lines(group.items).map((item) => bullet(item, "skills")),
            ],
          }),
        ),
      }),
    ],
  });
}

function bulletBlock(points: string, last: boolean) {
  const items = lines(points);
  return items.map((item, i) => bullet(item, "bullets", !last && i === items.length - 1 ? GAP : undefined));
}

export async function resumeToDocx(resume: Resume): Promise<Blob> {
  const children: (Paragraph | Table)[] = [];
  const name = resume.name.trim().toUpperCase();
  if (name) children.push(new Paragraph({ style: "Name", children: [new TextRun(name)] }));
  if (resume.headline.trim()) children.push(new Paragraph({ style: "Tagline", children: [new TextRun(resume.headline.trim())] }));
  children.push(
    new Paragraph({
      style: "Contact",
      border: { bottom: { style: BorderStyle.SINGLE, size: 18, color: NAVY, space: 10 } },
      children: [new TextRun(contactParts(resume).join("  |  "))],
    }),
  );

  if (resume.summary.trim()) {
    children.push(heading("PROFESSIONAL SUMMARY"), body([new TextRun(resume.summary.trim())]));
  }

  const education = resume.education.filter(hasEducation);
  if (education.length) {
    children.push(heading("EDUCATION"));
    education.forEach((item, i) => {
      const last = i === education.length - 1;
      children.push(entry(item.degree.trim(), item.dates.trim()));
      const parts: TextRun[] = [];
      if (item.school.trim()) parts.push(new TextRun(item.school.trim()));
      if (item.school.trim() && item.score.trim()) parts.push(new TextRun("   |   "));
      if (item.score.trim()) parts.push(...labelled(item.score.trim()));
      if (parts.length) children.push(body(parts, last ? undefined : GAP));
    });
  }

  const skills = resume.skills.filter(hasSkills).slice(0, 3);
  if (skills.length) children.push(heading("TECHNICAL SKILLS"), skillsTable(skills));

  const projects = resume.projects.filter(hasProject);
  if (projects.length) {
    children.push(heading("PROJECTS"));
    projects.forEach((item, i) => {
      const last = i === projects.length - 1;
      children.push(entry(item.title.trim(), item.dates.trim()));
      if (item.tools.trim()) children.push(body([new TextRun({ text: "Tools: ", bold: true }), new TextRun(item.tools.trim())]));
      children.push(...bulletBlock(item.points, last));
    });
  }

  const experience = resume.experience.filter(hasExperience);
  if (experience.length) {
    children.push(heading("INTERNSHIP / EXPERIENCE"));
    experience.forEach((item, i) => {
      const last = i === experience.length - 1;
      const org = item.org.trim() ? [new TextRun({ text: "   |   ", bold: false }), new TextRun({ text: item.org.trim(), bold: false })] : [];
      children.push(entry(item.role.trim(), item.dates.trim(), org), ...bulletBlock(item.points, last));
    });
  }

  for (const [title, value] of [["CERTIFICATIONS", resume.certifications], ["ACHIEVEMENTS & ACTIVITIES", resume.achievements]] as const) {
    const items = lines(value);
    if (items.length) children.push(heading(title), ...items.map((item) => bullet(item)));
  }

  if (resume.languages.trim()) children.push(heading("LANGUAGES"), body([new TextRun(resume.languages.trim())]));

  const bulletLevel = (left: number, hanging: number) => ({
    level: 0,
    format: LevelFormat.BULLET,
    text: "•",
    alignment: AlignmentType.LEFT,
    style: { paragraph: { indent: { left, hanging } }, run: { font: "Arial" } },
  });

  const doc = new Document({
    creator: "MyPixelogs",
    title: resume.name.trim() ? `${resume.name.trim()} – Resume` : "Resume",
    styles: {
      default: { document: { run: { font: FONT, size: pt(10.5), color: TEXT } } },
      paragraphStyles: [
        { id: "Normal", name: "Normal", run: { font: FONT, size: pt(10.5), color: TEXT }, paragraph: { spacing: { before: 0, after: 0, line: 264 } } },
        { id: "Name", name: "Resume Name", basedOn: "Normal", next: "Tagline", quickFormat: true, run: { size: pt(34), bold: true, color: NAVY }, paragraph: { spacing: { after: 60, line: 240 } } },
        { id: "Tagline", name: "Resume Tagline", basedOn: "Normal", next: "Contact", quickFormat: true, run: { size: pt(14.5) }, paragraph: { spacing: { after: 90 } } },
        { id: "Contact", name: "Resume Contact", basedOn: "Normal", quickFormat: true, run: { size: pt(9.5) }, paragraph: { spacing: { after: 200 } } },
        { id: "Heading1", name: "heading 1", basedOn: "Normal", next: "BodyLine", quickFormat: true, run: { size: pt(13), bold: true, color: NAVY }, paragraph: { spacing: { before: 240, after: 90, line: 240 }, keepNext: true, keepLines: true, outlineLevel: 0 } },
        { id: "EntryTitle", name: "Resume Entry Title", basedOn: "Normal", next: "BodyLine", quickFormat: true, run: { size: pt(10.5) }, paragraph: { spacing: { after: 10 }, keepNext: true } },
        { id: "BodyLine", name: "Resume Body", basedOn: "Normal", quickFormat: true, paragraph: { spacing: { after: 10 } } },
        { id: "BulletItem", name: "Resume Bullet", basedOn: "Normal", quickFormat: true, paragraph: { spacing: { after: 10 } } },
        { id: "SkillHead", name: "Resume Skill Group", basedOn: "Normal", next: "BulletItem", quickFormat: true, run: { bold: true, color: NAVY, size: pt(11) }, paragraph: { spacing: { after: 40 }, keepNext: true } },
      ],
    },
    numbering: { config: [{ reference: "bullets", levels: [bulletLevel(500, 260)] }, { reference: "skills", levels: [bulletLevel(300, 220)] }] },
    sections: [
      {
        properties: { page: { size: { width: PAGE_W, height: 16838 }, margin: { top: 720, bottom: 600, left: MARGIN_X, right: MARGIN_X, header: 400, footer: 400 } } },
        children,
      },
    ],
  });

  return Packer.toBlob(doc);
}

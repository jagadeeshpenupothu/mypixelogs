"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { ArrowDown, ArrowUp, FileText, Plus, Printer, RotateCcw, Trash2 } from "lucide-react";

import { ResumePaper } from "@/components/resume/ResumePaper";
import { Button } from "@/components/ui/button";
import {
  blankResume, fileName, newEducation, newExperience, newProject, newSkillGroup, restoreResume, sampleResume,
  type Resume, type TextField,
} from "@/lib/resume/model";
import "./resume-paper.css";

const STORAGE_KEY = "mypixelogs-resume-fresher";

const inputClass =
  "w-full min-w-0 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70";

function Section({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return (
    <fieldset className="min-w-0 rounded-lg border border-border bg-card p-4">
      <legend className="px-1 text-sm font-semibold text-foreground">{title}</legend>
      {note ? <p className="mb-3 text-xs text-muted-foreground">{note}</p> : null}
      <div className="grid gap-3 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

function Field({ label, wide, children }: { label: string; wide?: boolean; children: ReactNode }) {
  return (
    <label className={`block min-w-0 ${wide ? "sm:col-span-2" : ""}`}>
      <span className="mb-1 block text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

type ListKey = "education" | "skills" | "projects" | "experience";

function ItemBar({ label, index, count, onMove, onRemove }: { label: string; index: number; count: number; onMove: (step: -1 | 1) => void; onRemove: () => void }) {
  const name = `${label.toLowerCase()} ${index + 1}`;
  return (
    <div className="mb-2 flex items-center justify-between gap-2 sm:col-span-2">
      <span className="text-xs font-semibold text-muted-foreground">{label} {index + 1}</span>
      <span className="flex gap-1">
        <Button type="button" variant="ghost" size="icon" aria-label={`Move ${name} up`} disabled={index === 0} onClick={() => onMove(-1)}><ArrowUp className="h-4 w-4" /></Button>
        <Button type="button" variant="ghost" size="icon" aria-label={`Move ${name} down`} disabled={index === count - 1} onClick={() => onMove(1)}><ArrowDown className="h-4 w-4" /></Button>
        <Button type="button" variant="ghost" size="icon" aria-label={`Remove ${name}`} onClick={onRemove}><Trash2 className="h-4 w-4" /></Button>
      </span>
    </div>
  );
}

export function ResumeEditor({ title }: { title: string }) {
  const [resume, setResume] = useState<Resume>(sampleResume);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let saved: unknown = null;
    try {
      saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
    } catch {
      // Storage is blocked or the saved data is damaged: start from the sample.
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- browser storage is only readable after mount
    setResume(restoreResume(saved));
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(resume));
    } catch {
      // Editing still works without saving.
    }
  }, [resume, ready]);

  const patch = (change: Partial<Resume>) => setResume((current) => ({ ...current, ...change }));

  function patchItem<K extends ListKey>(key: K, id: string, change: Partial<Resume[K][number]>) {
    setResume((current) => ({
      ...current,
      [key]: (current[key] as Resume[K][number][]).map((item) => (item.id === id ? { ...item, ...change } : item)),
    }));
  }

  function removeItem(key: ListKey, id: string) {
    setResume((current) => ({ ...current, [key]: (current[key] as { id: string }[]).filter((item) => item.id !== id) }));
  }

  function moveItem(key: ListKey, index: number, step: -1 | 1) {
    setResume((current) => {
      const list = [...(current[key] as { id: string }[])];
      const target = index + step;
      if (target < 0 || target >= list.length) return current;
      [list[index], list[target]] = [list[target], list[index]];
      return { ...current, [key]: list };
    });
  }

  const text = (key: TextField, label: string, options: { wide?: boolean; type?: string; placeholder?: string } = {}) => (
    <Field label={label} wide={options.wide}>
      <input className={inputClass} type={options.type ?? "text"} autoComplete="off" maxLength={300} placeholder={options.placeholder}
        value={resume[key]} onChange={(e) => patch({ [key]: e.target.value })} />
    </Field>
  );

  const area = (value: string, onChange: (value: string) => void, label: string, rows = 3, placeholder?: string) => (
    <Field label={label} wide>
      <textarea className={inputClass} rows={rows} maxLength={2000} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} />
    </Field>
  );

  const itemInput = (value: string, onChange: (value: string) => void, label: string, wide = false, placeholder?: string) => (
    <Field label={label} wide={wide}>
      <input className={inputClass} autoComplete="off" maxLength={300} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} />
    </Field>
  );

  const box = "grid gap-3 rounded-md border border-border p-3 sm:col-span-2 sm:grid-cols-2";

  async function downloadWord() {
    setBusy(true);
    setMessage("");
    try {
      const { resumeToDocx } = await import("@/lib/resume/docx");
      const url = URL.createObjectURL(await resumeToDocx(resume));
      const link = document.createElement("a");
      link.href = url;
      link.download = `${fileName(resume)}.docx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10000);
      setMessage("Word file downloaded.");
    } catch {
      setMessage("The Word file could not be made. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  function savePdf() {
    const previous = document.title;
    document.title = fileName(resume);
    window.addEventListener("afterprint", () => { document.title = previous; }, { once: true });
    window.print();
  }

  function startBlank() {
    if (!window.confirm("Clear the sample and start with an empty resume?")) return;
    setResume(blankResume());
    setMessage("Started a blank resume.");
  }

  function useSample() {
    if (!window.confirm("Replace what you typed with the sample resume?")) return;
    setResume(sampleResume());
    setMessage("Sample restored.");
  }

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{title}</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Type over the sample and download. Your details are saved only in this browser and are not uploaded.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={downloadWord} disabled={!ready || busy}><FileText className="h-4 w-4" />{busy ? "Preparing..." : "Download Word"}</Button>
          <Button type="button" variant="outline" onClick={savePdf} disabled={!ready}><Printer className="h-4 w-4" />Print / Save PDF</Button>
          <Button type="button" variant="ghost" onClick={startBlank} disabled={!ready}><RotateCcw className="h-4 w-4" />Start blank</Button>
        </div>
      </div>
      <p role="status" className="mt-2 min-h-5 text-sm text-muted-foreground">{message}</p>

      <div className="mt-2 grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] xl:items-start">
        <form className="grid min-w-0 gap-4" onSubmit={(e) => e.preventDefault()} autoComplete="off">
          <Section title="About you">
            {text("name", "Full name", { wide: true })}
            {text("headline", "Headline", { wide: true, placeholder: "Graduate Engineer | Entry-Level Professional" })}
            {text("phone", "Phone", { type: "tel" })}
            {text("email", "Email", { type: "email" })}
            {text("location", "City, state")}
            {text("linkedin", "LinkedIn (optional)")}
            {text("portfolio", "Portfolio or GitHub (optional)", { wide: true })}
          </Section>

          <Section title="Professional summary" note="Two or three lines: what you studied, what you are good at, and the role you want.">
            {area(resume.summary, (value) => patch({ summary: value }), "Summary", 4)}
          </Section>

          <Section title="Education">
            {resume.education.map((item, index) => (
              <div key={item.id} className={box}>
                <ItemBar label="Course" index={index} count={resume.education.length} onMove={(step) => moveItem("education", index, step)} onRemove={() => removeItem("education", item.id)} />
                {itemInput(item.degree, (v) => patchItem("education", item.id, { degree: v }), "Degree or class", true, "B.Tech in Computer Science")}
                {itemInput(item.school, (v) => patchItem("education", item.id, { school: v }), "College or school", true)}
                {itemInput(item.dates, (v) => patchItem("education", item.id, { dates: v }), "Years", false, "2022 – 2026")}
                {itemInput(item.score, (v) => patchItem("education", item.id, { score: v }), "Score", false, "CGPA: 8.5/10")}
              </div>
            ))}
            <Button type="button" variant="outline" className="sm:col-span-2" disabled={resume.education.length >= 10}
              onClick={() => patch({ education: [...resume.education, newEducation()] })}><Plus className="h-4 w-4" />Add education</Button>
          </Section>

          <Section title="Skills" note="Up to three groups. Write one skill per line.">
            {resume.skills.map((group, index) => (
              <div key={group.id} className={box}>
                <ItemBar label="Group" index={index} count={resume.skills.length} onMove={(step) => moveItem("skills", index, step)} onRemove={() => removeItem("skills", group.id)} />
                {itemInput(group.heading, (v) => patchItem("skills", group.id, { heading: v }), "Group name", true, "Software")}
                {area(group.items, (v) => patchItem("skills", group.id, { items: v }), "Skills (one per line)", 4)}
              </div>
            ))}
            <Button type="button" variant="outline" className="sm:col-span-2" disabled={resume.skills.length >= 3}
              onClick={() => patch({ skills: [...resume.skills, newSkillGroup()] })}><Plus className="h-4 w-4" />Add skill group</Button>
          </Section>

          <Section title="Projects" note="Write one point per line. Start with what you did, then the result.">
            {resume.projects.map((item, index) => (
              <div key={item.id} className={box}>
                <ItemBar label="Project" index={index} count={resume.projects.length} onMove={(step) => moveItem("projects", index, step)} onRemove={() => removeItem("projects", item.id)} />
                {itemInput(item.title, (v) => patchItem("projects", item.id, { title: v }), "Project name", true)}
                {itemInput(item.tools, (v) => patchItem("projects", item.id, { tools: v }), "Tools used")}
                {itemInput(item.dates, (v) => patchItem("projects", item.id, { dates: v }), "Dates", false, "Jan 2026 – Mar 2026")}
                {area(item.points, (v) => patchItem("projects", item.id, { points: v }), "Points (one per line)", 3)}
              </div>
            ))}
            <Button type="button" variant="outline" className="sm:col-span-2" disabled={resume.projects.length >= 10}
              onClick={() => patch({ projects: [...resume.projects, newProject()] })}><Plus className="h-4 w-4" />Add project</Button>
          </Section>

          <Section title="Internship / experience" note="No internship yet? Remove it; the section disappears from your resume.">
            {resume.experience.map((item, index) => (
              <div key={item.id} className={box}>
                <ItemBar label="Internship" index={index} count={resume.experience.length} onMove={(step) => moveItem("experience", index, step)} onRemove={() => removeItem("experience", item.id)} />
                {itemInput(item.role, (v) => patchItem("experience", item.id, { role: v }), "Role")}
                {itemInput(item.org, (v) => patchItem("experience", item.id, { org: v }), "Company")}
                {itemInput(item.dates, (v) => patchItem("experience", item.id, { dates: v }), "Dates", true, "Jun 2025 – Jul 2025")}
                {area(item.points, (v) => patchItem("experience", item.id, { points: v }), "What you did (one per line)", 3)}
              </div>
            ))}
            <Button type="button" variant="outline" className="sm:col-span-2" disabled={resume.experience.length >= 10}
              onClick={() => patch({ experience: [...resume.experience, newExperience()] })}><Plus className="h-4 w-4" />Add internship</Button>
          </Section>

          <Section title="More" note="Write one item per line. Leave a box empty to hide that section.">
            {area(resume.certifications, (v) => patch({ certifications: v }), "Certifications", 2, "Course name – Organisation (Year)")}
            {area(resume.achievements, (v) => patch({ achievements: v }), "Achievements & activities", 2)}
            {text("languages", "Languages", { wide: true, placeholder: "English (Fluent)  |  Hindi (Fluent)" })}
          </Section>

          <p className="text-xs text-muted-foreground">
            Tip: keep it to one page. If the preview runs long, shorten points before removing sections.{" "}
            <button type="button" className="underline hover:text-foreground" onClick={useSample}>Show the sample again</button>
          </p>
        </form>

        <section aria-label="Resume preview" className="min-w-0 xl:sticky xl:top-20">
          <div className="resume-preview overflow-hidden rounded-lg border border-border shadow-sm">
            <div className="resume-preview-page"><ResumePaper resume={resume} /></div>
          </div>
        </section>
      </div>

      {ready ? createPortal(<div className="resume-print" aria-hidden="true"><ResumePaper resume={resume} /></div>, document.body) : null}
    </>
  );
}

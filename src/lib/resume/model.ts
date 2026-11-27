/** What a fresher resume holds. Lists are typed one item per line, so the form stays simple. */
export type EducationItem = { id: string; degree: string; dates: string; school: string; score: string };
export type SkillGroup = { id: string; heading: string; items: string };
export type ProjectItem = { id: string; title: string; dates: string; tools: string; points: string };
export type ExperienceItem = { id: string; role: string; org: string; dates: string; points: string };

export type Resume = {
  name: string;
  headline: string;
  phone: string;
  email: string;
  location: string;
  linkedin: string;
  portfolio: string;
  summary: string;
  education: EducationItem[];
  skills: SkillGroup[];
  projects: ProjectItem[];
  experience: ExperienceItem[];
  certifications: string;
  achievements: string;
  languages: string;
};

export const textFields = [
  "name", "headline", "phone", "email", "location", "linkedin", "portfolio",
  "summary", "certifications", "achievements", "languages",
] as const;
export type TextField = (typeof textFields)[number];

let counter = 0;
export const newId = () => `r${Date.now().toString(36)}${(counter += 1).toString(36)}`;

export const newEducation = (): EducationItem => ({ id: newId(), degree: "", dates: "", school: "", score: "" });
export const newProject = (): ProjectItem => ({ id: newId(), title: "", dates: "", tools: "", points: "" });
export const newExperience = (): ExperienceItem => ({ id: newId(), role: "", org: "", dates: "", points: "" });
export const newSkillGroup = (): SkillGroup => ({ id: newId(), heading: "", items: "" });

/** The sample shown in the template, so people can see how a finished resume reads. */
export function sampleResume(): Resume {
  return {
    name: "Aarav Sharma",
    headline: "Graduate Engineer | Entry-Level Professional",
    phone: "+91 98765 43210",
    email: "aarav.sharma@email.com",
    location: "Hyderabad, India",
    linkedin: "linkedin.com/in/aaravsharma",
    portfolio: "portfolio.com/aarav",
    summary:
      "Motivated Mechanical Engineering graduate with a strong foundation in design, analysis, and problem-solving. Hands-on experience with CAD tools, data analysis, and project execution, seeking an entry-level role to contribute and grow.",
    education: [
      { id: newId(), degree: "B.Tech in Mechanical Engineering", dates: "2022 – 2026", school: "Vishwakarma Institute of Technology, Pune", score: "CGPA: 8.32/10" },
      { id: newId(), degree: "Class XII (Intermediate – MPC)", dates: "2020 – 2022", school: "Sri Chaitanya Junior College, Hyderabad", score: "Percentage: 92.4%" },
      { id: newId(), degree: "Class X (SSC)", dates: "2019 – 2020", school: "Narayana High School, Hyderabad", score: "Percentage: 95.2%" },
    ],
    skills: [
      { id: newId(), heading: "Engineering", items: "CAD: SolidWorks, AutoCAD\nDesign & Modeling\nGD&T, Machine Design Basics" },
      { id: newId(), heading: "Software", items: "Python (Basic)\nMS Excel, Word, PowerPoint\nMATLAB (Basic)" },
      { id: newId(), heading: "Core Skills", items: "Problem Solving\nAnalytical Thinking\nTeam Collaboration\nCommunication" },
    ],
    projects: [
      {
        id: newId(), title: "Automated Material Sorting System", dates: "Jan 2026 – Mar 2026", tools: "SolidWorks, Arduino, C++",
        points: "Designed and built a prototype sorting system to classify materials based on sensor input.\nImproved sorting accuracy by ~30% compared to manual segregation.",
      },
      {
        id: newId(), title: "Heat Exchanger Design and Analysis", dates: "Aug 2025 – Oct 2025", tools: "ANSYS, SolidWorks",
        points: "Modeled and analyzed a heat exchanger to evaluate thermal performance.\nAchieved ~12% higher heat transfer efficiency through design optimization.",
      },
    ],
    experience: [
      {
        id: newId(), role: "Mechanical Engineering Intern", org: "ABC Engineering Pvt. Ltd.", dates: "Jun 2025 – Jul 2025",
        points: "Assisted the design team in creating 3D models and technical drawings using SolidWorks.\nParticipated in design review meetings and supported documentation and BOM preparation.",
      },
    ],
    certifications: "SolidWorks Essential Training – Dassault Systèmes (2025)\nPython for Beginners – Coursera (2024)",
    achievements:
      "Secured 2nd place in the college-level CAD Design Challenge (2025).\nActive member of the Mechanical Engineering Club, organized workshops on CAD and design tools.",
    languages: "English (Fluent)  |  Hindi (Fluent)  |  Telugu (Native)",
  };
}

/** A blank resume with one empty entry in each list, ready to fill in. */
export function blankResume(): Resume {
  return {
    name: "", headline: "", phone: "", email: "", location: "", linkedin: "", portfolio: "", summary: "",
    education: [newEducation()],
    skills: [{ ...newSkillGroup(), heading: "Technical Skills" }, { ...newSkillGroup(), heading: "Software" }, { ...newSkillGroup(), heading: "Core Skills" }],
    projects: [newProject()],
    experience: [],
    certifications: "", achievements: "", languages: "",
  };
}

const text = (value: unknown, max = 2000) => (typeof value === "string" ? value.slice(0, max) : "");

function list<T extends { id: string }>(value: unknown, keys: (keyof T)[], limit: number): T[] | null {
  if (!Array.isArray(value)) return null;
  return value.slice(0, limit).map((raw) => {
    const item = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
    const out = { id: newId() } as Record<string, string>;
    keys.forEach((key) => { out[key as string] = text(item[key as string]); });
    return out as unknown as T;
  });
}

/** Reads a resume saved in this browser, ignoring anything damaged or unexpected. */
export function restoreResume(saved: unknown): Resume {
  const base = sampleResume();
  if (!saved || typeof saved !== "object") return base;
  const data = saved as Record<string, unknown>;
  for (const key of textFields) if (typeof data[key] === "string") base[key] = text(data[key]);
  base.education = list<EducationItem>(data.education, ["degree", "dates", "school", "score"], 10) ?? base.education;
  base.skills = list<SkillGroup>(data.skills, ["heading", "items"], 3) ?? base.skills;
  base.projects = list<ProjectItem>(data.projects, ["title", "dates", "tools", "points"], 10) ?? base.projects;
  base.experience = list<ExperienceItem>(data.experience, ["role", "org", "dates", "points"], 10) ?? base.experience;
  return base;
}

export const lines = (value: string) => value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);

/** "CGPA: 8.32/10" -> ["CGPA: ", "8.32/10"], so the label can be bold. */
export function splitLabel(value: string): [string, string] {
  const match = value.match(/^([^:]{1,30}:\s*)(.*)$/);
  return match ? [match[1], match[2]] : ["", value];
}

export function contactParts(resume: Resume) {
  return [resume.phone, resume.email, resume.location, resume.linkedin, resume.portfolio].map((part) => part.trim()).filter(Boolean);
}

export function fileName(resume: Resume) {
  const safe = resume.name.trim().replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "");
  return `${safe || "my"}-resume`;
}

export const hasEducation = (item: EducationItem) => Boolean(item.degree.trim() || item.school.trim());
export const hasProject = (item: ProjectItem) => Boolean(item.title.trim() || item.points.trim());
export const hasExperience = (item: ExperienceItem) => Boolean(item.role.trim() || item.org.trim());
export const hasSkills = (group: SkillGroup) => Boolean(group.heading.trim() || lines(group.items).length);

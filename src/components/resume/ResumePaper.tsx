import { Fragment } from "react";

import {
  contactParts, hasEducation, hasExperience, hasProject, hasSkills, lines, splitLabel, type Resume,
} from "@/lib/resume/model";

function Heading({ children }: { children: string }) {
  return (
    <h2 className="rp-heading">
      <span>{children}</span>
    </h2>
  );
}

function Labelled({ value }: { value: string }) {
  const [label, rest] = splitLabel(value);
  return (
    <>
      {label ? <strong>{label}</strong> : null}
      {rest}
    </>
  );
}

function Bullets({ text }: { text: string }) {
  const items = lines(text);
  if (!items.length) return null;
  return (
    <ul className="rp-bullets">
      {items.map((item, i) => <li key={i}>{item}</li>)}
    </ul>
  );
}

/** The resume page itself: used for the live preview and for printing. */
export function ResumePaper({ resume }: { resume: Resume }) {
  const contact = contactParts(resume);
  const education = resume.education.filter(hasEducation);
  const skills = resume.skills.filter(hasSkills).slice(0, 3);
  const projects = resume.projects.filter(hasProject);
  const experience = resume.experience.filter(hasExperience);

  return (
    <article className="rp">
      <header className="rp-head">
        {resume.name.trim() ? <p className="rp-name">{resume.name.trim().toUpperCase()}</p> : null}
        {resume.headline.trim() ? <p className="rp-tagline">{resume.headline.trim()}</p> : null}
        <p className="rp-contact">
          {contact.map((part, i) => (
            <Fragment key={i}>
              {i > 0 ? <span className="rp-sep"> | </span> : null}
              {part}
            </Fragment>
          ))}
        </p>
      </header>

      {resume.summary.trim() ? (
        <section>
          <Heading>PROFESSIONAL SUMMARY</Heading>
          <p>{resume.summary.trim()}</p>
        </section>
      ) : null}

      {education.length ? (
        <section>
          <Heading>EDUCATION</Heading>
          {education.map((item) => (
            <div key={item.id} className="rp-entry">
              <p className="rp-row"><strong>{item.degree}</strong><span>{item.dates}</span></p>
              {item.school.trim() || item.score.trim() ? (
                <p>
                  {item.school}
                  {item.school.trim() && item.score.trim() ? <span className="rp-sep"> | </span> : null}
                  {item.score.trim() ? <Labelled value={item.score.trim()} /> : null}
                </p>
              ) : null}
            </div>
          ))}
        </section>
      ) : null}

      {skills.length ? (
        <section>
          <Heading>TECHNICAL SKILLS</Heading>
          <div className="rp-skills" style={{ gridTemplateColumns: skills.length === 3 ? "35fr 33fr 33fr" : `repeat(${skills.length}, 1fr)` }}>
            {skills.map((group) => (
              <div key={group.id} className="rp-skill">
                <p className="rp-skill-head">{group.heading}</p>
                <Bullets text={group.items} />
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {projects.length ? (
        <section>
          <Heading>PROJECTS</Heading>
          {projects.map((item) => (
            <div key={item.id} className="rp-entry">
              <p className="rp-row"><strong>{item.title}</strong><span>{item.dates}</span></p>
              {item.tools.trim() ? <p><strong>Tools: </strong>{item.tools}</p> : null}
              <Bullets text={item.points} />
            </div>
          ))}
        </section>
      ) : null}

      {experience.length ? (
        <section>
          <Heading>INTERNSHIP / EXPERIENCE</Heading>
          {experience.map((item) => (
            <div key={item.id} className="rp-entry">
              <p className="rp-row">
                <span><strong>{item.role}</strong>{item.org.trim() ? <><span className="rp-sep"> | </span>{item.org}</> : null}</span>
                <span>{item.dates}</span>
              </p>
              <Bullets text={item.points} />
            </div>
          ))}
        </section>
      ) : null}

      {lines(resume.certifications).length ? (
        <section>
          <Heading>CERTIFICATIONS</Heading>
          <Bullets text={resume.certifications} />
        </section>
      ) : null}

      {lines(resume.achievements).length ? (
        <section>
          <Heading>ACHIEVEMENTS &amp; ACTIVITIES</Heading>
          <Bullets text={resume.achievements} />
        </section>
      ) : null}

      {resume.languages.trim() ? (
        <section>
          <Heading>LANGUAGES</Heading>
          <p>{resume.languages.trim()}</p>
        </section>
      ) : null}
    </article>
  );
}

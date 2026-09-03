import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import TechStackList from "./TechStackList";
import ProjectLinks from "./ProjectLinks";
import "./UIOverlay.css";

const LABELS = {
  fr: {
    hint: "Cliquez sur un projet pour zoomer",
    interests: "Centres d'intérêt",
    languages: "Langues",
    availability: "Disponibilités",
    skillsGained: "Compétences développées",
  },
  en: {
    hint: "Click on a project to zoom in",
    interests: "Interests",
    languages: "Languages",
    availability: "Availability",
    skillsGained: "Skills gained",
  },
};

export default function UIOverlay({ activeProject, locale = "fr" }) {
  const t = LABELS[locale] ?? LABELS.fr;
  const accent = activeProject?.theme?.accent ?? "#ffffff";
  const scrollRef = useRef();
  const [activePage, setActivePage] = useState(0);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
      scrollRef.current.scrollLeft = 0;
    }
    setActivePage(0);
  }, [activeProject?.id]);

  // Suit la page active pendant le swipe horizontal (mobile) pour mettre à jour les dots
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onScroll = () => {
      if (el.clientWidth === 0) return;
      const page = Math.round(el.scrollLeft / el.clientWidth);
      setActivePage(page);
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [activeProject?.id]);

  return createPortal(
    <div className="ui-overlay">
      {!activeProject && <p className="ui-hint">{t.hint}</p>}

      <div className={`project-panel-group ${activeProject ? "project-panel-group--visible" : ""}`}>
        {activeProject && (
          <>
            <div className="project-panel-handle" />

            {/* Indicateur de pagination — visible seulement en mobile via CSS */}
            <div className="project-panel-dots">
              <span
                className={`project-panel-dots__dot ${activePage === 0 ? "project-panel-dots__dot--active" : ""}`}
              />
              <span
                className={`project-panel-dots__dot ${activePage === 1 ? "project-panel-dots__dot--active" : ""}`}
              />
            </div>

            <div className="project-panel-scroll" ref={scrollRef} key={activeProject.id}>
              {/* -------- PANNEAU GAUCHE : récit -------- */}
              <div className="project-panel project-panel--left">
                <div className="project-panel__header">
                  <p className="project-panel__date" style={{ color: accent }}>
                    {activeProject.date}
                  </p>
                  <h2 className="project-panel__title">{activeProject.title}</h2>

                  {activeProject.role && <p className="project-panel__role">{activeProject.role}</p>}

                  {(activeProject.location || activeProject.duration) && (
                    <p className="project-panel__meta">
                      {[activeProject.location, activeProject.duration].filter(Boolean).join(" · ")}
                    </p>
                  )}
                </div>

                {activeProject.tags?.length > 0 && (
                  <ul className="project-panel__tags">
                    {activeProject.tags.map((tag) => (
                      <li key={tag} style={{ borderColor: accent }}>
                        {tag}
                      </li>
                    ))}
                  </ul>
                )}

                <p className="project-panel__desc">
                  {activeProject.longDescription ?? activeProject.shortDescription}
                </p>

                {activeProject.highlights?.length > 0 && (
                  <ul className="project-panel__highlights">
                    {activeProject.highlights.map((h) => (
                      <li key={h} style={{ "--dot": accent }}>
                        {h}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* -------- PANNEAU DROIT : technique / recruteur -------- */}
              <div className="project-panel project-panel--right">
                {activeProject.metrics?.length > 0 && (
                  <div className="metrics-grid">
                    {activeProject.metrics.map((m) => (
                      <div className="metrics-grid__item" key={m.label}>
                        <span className="metrics-grid__value" style={{ color: accent }}>
                          {m.value}
                        </span>
                        <span className="metrics-grid__label">{m.label}</span>
                      </div>
                    ))}
                  </div>
                )}

                <TechStackList techStack={activeProject.techStack} accent={accent} locale={locale} />

                {/*
                  Fallback pour les projets SANS techStack (ex: échange
                  académique) : évite un panneau droit vide en affichant
                  les compétences/soft skills développées, sous forme de
                  tags (même style visuel que project-panel__tags).
                */}
                {activeProject.skillsGained?.length > 0 && (
                  <div className="tech-stack">
                    <div className="tech-stack__group">
                      <p className="tech-stack__label">{t.skillsGained}</p>
                      <ul className="project-panel__tags">
                        {activeProject.skillsGained.map((skill) => (
                          <li key={skill} style={{ borderColor: accent }}>
                            {skill}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {activeProject.profile && (
                  <div className="project-panel__profile">
                    {activeProject.profile.school && <p>{activeProject.profile.school}</p>}
                    {activeProject.profile.exchange && <p>{activeProject.profile.exchange}</p>}
                    {activeProject.profile.languages?.length > 0 && (
                      <p>
                        <strong>{t.languages} :</strong>{" "}
                        {activeProject.profile.languages.map((l) => `${l.name} (${l.level})`).join(", ")}
                      </p>
                    )}
                    {activeProject.profile.interests?.length > 0 && (
                      <p>
                        <strong>{t.interests} :</strong> {activeProject.profile.interests.join(", ")}
                      </p>
                    )}
                    {activeProject.profile.availability?.length > 0 && (
                      <div className="project-panel__availability">
                        <strong>{t.availability}</strong>
                        <ul>
                          {activeProject.profile.availability.map((a) => (
                            <li key={a.label}>
                              {a.label} — {a.period} ({a.detail})
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                <ProjectLinks links={activeProject.links} accent={accent} locale={locale} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}
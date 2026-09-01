import "./UIOverlay.css";

const LABELS = {
  fr: { hint: "Cliquez sur un projet pour zoomer" },
  en: { hint: "Click on a project to zoom in" },
};

export default function UIOverlay({ activeProject, locale = "fr" }) {
  const t = LABELS[locale] ?? LABELS.fr;

  return (
    <div className="ui-overlay">
      {!activeProject && (
        <p className="ui-hint">{t.hint}</p>
      )}

      <div className={`project-panel ${activeProject ? "project-panel--visible" : ""}`}>
        {activeProject && (
          <>
            <p className="project-panel__date" style={{ color: activeProject.theme?.accent }}>
              {activeProject.date}
            </p>
            <h2 className="project-panel__title">{activeProject.title}</h2>

            {activeProject.role && (
              <p className="project-panel__role">{activeProject.role}</p>
            )}

            <p className="project-panel__desc">
              {activeProject.longDescription ?? activeProject.shortDescription}
            </p>

            {activeProject.tags?.length > 0 && (
              <ul className="project-panel__tags">
                {activeProject.tags.map((tag) => (
                  <li key={tag} style={{ borderColor: activeProject.theme?.accent }}>
                    {tag}
                  </li>
                ))}
              </ul>
            )}

            {(activeProject.links?.live ||
              activeProject.links?.github ||
              activeProject.links?.caseStudy) && (
              <div className="project-panel__links">
                {activeProject.links.live && (
                  <a href={activeProject.links.live} target="_blank" rel="noreferrer">
                    Voir le site ↗
                  </a>
                )}
                {activeProject.links.github && (
                  <a href={activeProject.links.github} target="_blank" rel="noreferrer">
                    Code source ↗
                  </a>
                )}
                {activeProject.links.caseStudy && (
                  <a href={activeProject.links.caseStudy} target="_blank" rel="noreferrer">
                    Étude de cas ↗
                  </a>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
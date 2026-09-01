import ProjectWheel from "./ProjectWheel";
import "./TopBar.css";

/**
 * TopBar — posé en overlay au-dessus du Canvas R3F (position: fixed).
 * Layout en 3 zones (grid 1fr auto 1fr) :
 * - gauche : identité (nom/tag/rôle)
 * - centre : roue de sélection de projets (toujours centrée) + bouton home
 *   qui apparaît à sa droite, en position absolue, sans jamais affecter
 *   la taille ni le centrage de la roue
 * - droite : switch de langue
 *
 * Props:
 * - name: string                        (ex. "Pereira Noé" — prénom puis nom, séparés par un espace)
 * - projects: [{ id, title }]
 * - activeId: string | null
 * - onSelectProject: (id: string | null) => void
 * - onBack: () => void                  (déclenché par le bouton home)
 * - locale: "fr" | "en"
 * - onLocaleChange: (locale: "fr" | "en") => void
 * - mapLabel: string   (label de la vue d'ensemble dans la langue courante)
 */

const ROLE_LABEL = {
  fr: "Développeur",
  en: "Developer",
};

function HomeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="15"
      height="15"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5.5 10v9a1 1 0 0 0 1 1H9.5a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-9" />
    </svg>
  );
}

export default function TopBar({
  name,
  projects,
  activeId,
  onSelectProject,
  onBack,
  locale,
  onLocaleChange,
  mapLabel,
}) {
  const [firstName, ...rest] = (name ?? "").trim().split(" ");
  const lastName = rest.join(" ");

  return (
    <header className="topbar">
      <div className="topbar__left">
        <div className="topbar__brand">
          <span className="topbar__corner" aria-hidden="true" />
          <div className="topbar__brand-text">
            <div className="topbar__tag-row">
              <span className="topbar__status" aria-hidden="true" />
              <span className="topbar__tag">Portfolio</span>
            </div>
            <span className="topbar__name">
              <span className="topbar__first">{firstName}</span>
              {lastName && <span className="topbar__last">{lastName}</span>}
            </span>
            <span className="topbar__role">{ROLE_LABEL[locale] ?? ROLE_LABEL.fr}</span>
          </div>
        </div>
      </div>

      <div className="topbar__center">
        <div className="topbar__wheel-wrap">
          <ProjectWheel
            projects={projects}
            activeId={activeId}
            onSelect={onSelectProject}
            mapLabel={mapLabel}
          />
          {activeId && (
            <button
              type="button"
              className="topbar__home"
              onClick={onBack}
              aria-label={locale === "fr" ? "Retour à la vue d'ensemble" : "Back to overview"}
            >
              <HomeIcon />
            </button>
          )}
        </div>
      </div>

      <div className="topbar__right">
        <div className="topbar__lang" role="group" aria-label="Langue">
          <button
            type="button"
            className={`topbar__lang-btn ${locale === "fr" ? "is-active" : ""}`}
            onClick={() => onLocaleChange("fr")}
          >
            FR
          </button>
          <button
            type="button"
            className={`topbar__lang-btn ${locale === "en" ? "is-active" : ""}`}
            onClick={() => onLocaleChange("en")}
          >
            EN
          </button>
        </div>
      </div>
    </header>
  );
}
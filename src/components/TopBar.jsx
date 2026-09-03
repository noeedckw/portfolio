import ProjectWheel from "./ProjectWheel";
import "./TopBar.css";

const ROLE_LABEL = {
  fr: "Développeur",
  en: "Developer",
};

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5.5 10v9a1 1 0 0 0 1 1H9.5a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-9" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export default function TopBar({
  name,
  projects,
  activeId,
  onSelectProject,
  onBack,
  hasDrifted,
  onResetView,
  locale,
  onLocaleChange,
  mapLabel,
}) {
  const [firstName, ...rest] = (name ?? "").trim().split(" ");
  const lastName = rest.join(" ");

  // Le bouton home (retour depuis un zoom projet) a priorité ; le
  // bouton œil (retour depuis une balade libre) ne s'affiche que
  // si aucun projet n'est actif.
  const showHome = Boolean(activeId);
  const showEye = !activeId && hasDrifted;
  const showAction = showHome || showEye;

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
          {/* Slot invisible, miroir exact du bouton à droite : garantit que
              la roue reste toujours pile centrée, bouton affiché ou non. */}
          <div className="topbar__home-slot" aria-hidden="true" />

          <ProjectWheel
            projects={projects}
            activeId={activeId}
            onSelect={onSelectProject}
            mapLabel={mapLabel}
          />

          {showHome && (
            <button
              type="button"
              className="topbar__home"
              onClick={onBack}
              aria-label={locale === "fr" ? "Retour à la vue d'ensemble" : "Back to overview"}
            >
              <HomeIcon />
            </button>
          )}
          {showEye && (
            <button
              type="button"
              className="topbar__home"
              onClick={onResetView}
              aria-label={locale === "fr" ? "Recentrer la vue" : "Recenter view"}
            >
              <EyeIcon />
            </button>
          )}
          {!showAction && <div className="topbar__home-slot" aria-hidden="true" />}
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
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PortfolioMap from "./components/PortfolioMap";
import UIOverlay from "./components/UIOverlay";
import TopBar from "./components/TopBar";
import BottomBar from "./components/BottomBar";
import { site } from "./config/site.config";
import { projects, getLocalizedProject } from "./config/projects.config";
import "./styles/global.css";
import "./App.css";

// `projects` : ordre chronologique brut (le plus ancien en premier) —
// utilisé partout (map 3D ET roue de navigation) pour rester cohérent.

export default function App() {
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [locale, setLocale] = useState("fr");

  // true dès que l'utilisateur a librement déplacé la caméra (drag,
  // molette) hors de la vue d'ensemble, sans avoir sélectionné de
  // projet. Remonté par CameraRig (via PortfolioMap) → sert à
  // afficher l'icône œil dans TopBar.
  const [hasDrifted, setHasDrifted] = useState(false);

  // Ref vers PortfolioMap : expose `resetToOverview()`, nécessaire
  // pour ramener la caméra à OVERVIEW aussi bien depuis l'icône
  // maison (quitte un projet actif) que depuis l'icône œil (quitte
  // un simple drift, sans changement de `activeProject`).
  const portfolioMapRef = useRef(null);

  const activeProjectRaw = useMemo(
    () => projects.find((p) => p.id === activeProjectId) ?? null,
    [activeProjectId]
  );

  const activeProjectLocalized = useMemo(
    () => (activeProjectRaw ? getLocalizedProject(activeProjectRaw, locale) : null),
    [activeProjectRaw, locale]
  );

  const handleSelect = useCallback((project) => {
    setActiveProjectId(project?.id ?? null);
  }, []);

  // Icône maison : quitte un projet zoomé et revient à la vue d'ensemble.
  const handleBack = useCallback(() => {
    setActiveProjectId(null);
    portfolioMapRef.current?.resetToOverview();
  }, []);

  // Icône œil : aucun projet actif à quitter, juste recentrer la
  // caméra après une balade libre. `resetToOverview` remet aussi
  // `hasDrifted` à false via le callback interne de CameraRig.
  const handleResetView = useCallback(() => {
    portfolioMapRef.current?.resetToOverview();
  }, []);

  const handleSelectFromWheel = useCallback(
    (id) => {
      if (id === null) {
        handleBack();
        return;
      }
      setActiveProjectId(id);
    },
    [handleBack]
  );

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape") handleBack();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleBack]);

  return (
    <main className="map-page">
      <TopBar
        name={site.name}
        projects={projects}
        activeId={activeProjectId}
        onSelectProject={handleSelectFromWheel}
        onBack={handleBack}
        hasDrifted={hasDrifted}
        onResetView={handleResetView}
        locale={locale}
        onLocaleChange={setLocale}
        mapLabel={locale === "fr" ? "Vue d'ensemble" : "Overview"}
      />
      <PortfolioMap
        ref={portfolioMapRef}
        projects={projects}
        activeProject={activeProjectRaw}
        onSelect={handleSelect}
        lang={locale}
        onDriftChange={setHasDrifted}
      />
      <UIOverlay activeProject={activeProjectLocalized} locale={locale} />
      <BottomBar socials={site.socials} locale={locale} isProjectOpen={activeProjectId !== null} />
    </main>
  );
}
import { useCallback, useEffect, useState } from "react";
import PortfolioMap from "./components/PortfolioMap";
import UIOverlay from "./components/UIOverlay";
import TopBar from "./components/TopBar";
import BottomBar from "./components/BottomBar";
import { site } from "./config/site.config";
import { projects } from "./config/projects.config";
import "./styles/global.css";
import "./App.css";

// `projects` : ordre chronologique brut (le plus ancien en premier) —
// utilisé partout (map 3D ET roue de navigation) pour rester cohérent.

export default function App() {
  const [activeProject, setActiveProject] = useState(null);
  const [locale, setLocale] = useState("fr");

  const handleSelect = useCallback((project) => {
    setActiveProject(project);
  }, []);

  const handleBack = useCallback(() => {
    setActiveProject(null);
  }, []);

  // Sélection depuis la roue : reçoit un id (ou null pour la vue d'ensemble)
  const handleSelectFromWheel = useCallback(
    (id) => {
      if (id === null) {
        handleBack();
        return;
      }
      const project = projects.find((p) => p.id === id);
      if (project) setActiveProject(project);
    },
    [handleBack]
  );

  // Échap pour revenir à la map globale
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
        activeId={activeProject?.id ?? null}
        onSelectProject={handleSelectFromWheel}
        onBack={handleBack}
        locale={locale}
        onLocaleChange={setLocale}
        mapLabel={locale === "fr" ? "Vue d'ensemble" : "Overview"}
      />
      <PortfolioMap projects={projects} activeProject={activeProject} onSelect={handleSelect} />
      <UIOverlay activeProject={activeProject} locale={locale} />
      <BottomBar socials={site.socials} locale={locale} />
    </main>
  );
}
import { Suspense, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import ProjectNode from "./ProjectNode";
import ThemeBackdrop from "./ThemeBackdrop";
import CameraRig from "./CameraRig";
import TimelineLinks from "./TimelineLinks";
import { computeLayout } from "../config/layout";

function SceneContent({ projects, activeProject, onSelect }) {
  return (
    <>
      <ThemeBackdrop activeTheme={activeProject?.theme ?? null} />
      <CameraRig activeProject={activeProject} />

      <TimelineLinks projects={projects} activeProject={activeProject} />

      {projects.map((project) => (
        <ProjectNode
          key={project.id}
          project={project}
          isActive={activeProject?.id === project.id}
          isDimmed={Boolean(activeProject) && activeProject.id !== project.id}
          onSelect={onSelect}
        />
      ))}
    </>
  );
}

/**
 * Canvas R3F unique pour tout le portfolio, en rendu "timeline 3D" :
 * les projets sont alignés verticalement par ordre chronologique
 * (computeLayout) et reliés par des segments orthogonaux
 * (TimelineLinks). De face, la scène ressemble à une timeline 2D
 * en zigzag ; la profondeur (axe Z) ne se révèle qu'en tournant
 * la caméra.
 *
 * Réglages pensés pour rester léger sur machine modeste :
 * - dpr plafonné (évite de rendre en 3x sur écrans Retina/4K)
 * - pas d'ombres portées, pas de post-processing
 * - géométries plates (planes), pas de modèles lourds
 */
export default function PortfolioMap({ projects, activeProject, onSelect }) {
  const laidOutProjects = useMemo(() => computeLayout(projects), [projects]);

  // on garde le même objet "projet actif" mais avec sa position calculée
  const activeLaidOut = activeProject
    ? laidOutProjects.find((p) => p.id === activeProject.id)
    : null;

  return (
    <Canvas
      dpr={[1, 1.5]}
      gl={{ antialias: true, powerPreference: "high-performance", alpha: false }}
      camera={{ fov: 45, near: 0.1, far: 100 }}
      shadows={false}
    >
      <Suspense fallback={null}>
        <SceneContent
          projects={laidOutProjects}
          activeProject={activeLaidOut}
          onSelect={onSelect}
        />
      </Suspense>
    </Canvas>
  );
}
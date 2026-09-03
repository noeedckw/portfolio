import { Suspense, useMemo, useRef, useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { Canvas } from "@react-three/fiber";
import ProjectNode from "./ProjectNode";
import ThemeBackdrop from "./ThemeBackdrop";
import CameraRig from "./CameraRig";
import TimelineLinks from "./TimelineLinks";
import { computeLayout } from "../config/layout";

/**
 * Détecte si on est sur un viewport "mobile" (breakpoint par défaut
 * 768px, comme la plupart des breakpoints Tailwind `md`). Réagit
 * au resize / rotation d'écran.
 */
function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < breakpoint : false
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onResize = () => setIsMobile(window.innerWidth < breakpoint);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [breakpoint]);

  return isMobile;
}

// Facteur de resserrement appliqué aux projets qui n'ont PAS de
// `positionMobile` explicite dans la config (fallback automatique).
const MOBILE_FALLBACK_SCALE = 0.55;

/**
 * Applique la disposition mobile :
 * - si le projet a `positionMobile`, on l'utilise telle quelle
 *   (c'est le cas de tous les projets de la config actuelle —
 *   une tour en spirale descendante, resserrée et légèrement
 *   irrégulière) ;
 * - sinon, fallback : on resserre la `position` desktop d'un
 *   facteur fixe, pour ne jamais se retrouver avec un projet
 *   "orphelin" trop loin de la vue si jamais un nouveau projet
 *   est ajouté sans positionMobile.
 */
function applyMobilePositions(rawProjects, laidOutProjects) {
  return laidOutProjects.map((project, i) => {
    const rawMobile = rawProjects[i]?.positionMobile;
    if (rawMobile) {
      return { ...project, position: rawMobile };
    }
    const [x, y, z] = project.position;
    return {
      ...project,
      position: [x * MOBILE_FALLBACK_SCALE, y * MOBILE_FALLBACK_SCALE, z * MOBILE_FALLBACK_SCALE],
    };
  });
}

function SceneContent({ projects, activeProject, onSelect, lang, cameraRigRef, onDriftChange, isMobile }) {
  return (
    <>
      <ThemeBackdrop activeTheme={activeProject?.theme ?? null} />
      <CameraRig ref={cameraRigRef} activeProject={activeProject} onDriftChange={onDriftChange} />

      <TimelineLinks projects={projects} activeProject={activeProject} />

      {projects.map((project) => (
        <ProjectNode
          key={project.id}
          project={project}
          isActive={activeProject?.id === project.id}
          isDimmed={Boolean(activeProject) && activeProject.id !== project.id}
          onSelect={onSelect}
          lang={lang}
          isMobile={isMobile}
        />
      ))}
    </>
  );
}

/**
 * `onDriftChange(hasDrifted: boolean)` remonte l'état "l'utilisateur
 * s'est éloigné de la vue d'ensemble" jusqu'au parent (App), qui
 * décide d'afficher le bouton "retour" dans TopBar.
 *
 * La ref exposée (`resetToOverview`) permet à App de déclencher le
 * retour depuis le clic du bouton, sans que TopBar ait besoin
 * d'accéder directement au Canvas / à CameraControls.
 */
const PortfolioMap = forwardRef(function PortfolioMap(
  { projects, activeProject, onSelect, lang = "fr", onDriftChange },
  ref
) {
  const isMobile = useIsMobile();
  const cameraRigRef = useRef();

  const laidOutProjects = useMemo(() => {
    const base = computeLayout(projects);
    return isMobile ? applyMobilePositions(projects, base) : base;
  }, [projects, isMobile]);

  useImperativeHandle(ref, () => ({
    resetToOverview() {
      cameraRigRef.current?.resetToOverview();
    },
  }));

  const activeLaidOut = activeProject
    ? laidOutProjects.find((p) => p.id === activeProject.id)
    : null;

  return (
    <Canvas
      dpr={[1, 1.5]}
      gl={{ antialias: true, powerPreference: "high-performance", alpha: false }}
      camera={{ fov: 45, near: 0.1, far: 9000 }}
      shadows={false}
    >
      <Suspense fallback={null}>
        <SceneContent
          projects={laidOutProjects}
          activeProject={activeLaidOut}
          onSelect={onSelect}
          lang={lang}
          cameraRigRef={cameraRigRef}
          onDriftChange={onDriftChange}
          isMobile={isMobile}
        />
      </Suspense>
    </Canvas>
  );
});

export default PortfolioMap;
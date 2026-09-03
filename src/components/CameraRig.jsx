import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { CameraControls } from "@react-three/drei";

const OVERVIEW = {
  position: [0, 9, 11],
  target: [0, 0, 0],
};

// Décalage caméra par défaut quand on zoome sur un projet (relatif à
// sa position). x/y/z en unités monde depuis le centre de la carte :
// - z : distance de recul (plus petit = plus proche/plus gros)
// - y : hauteur du point de vue par rapport à la carte
// - x : décalage latéral (0 = centré)
// Modifie ces valeurs pour ajuster le zoom par défaut de TOUS les
// projets d'un coup, pendant que tu vérifies le cadrage des images.
const DEFAULT_ZOOM_OFFSET = { x: 0, y: 0.6, z: 4.0 };

/**
 * Un seul CameraControls réutilisé pour tout : la vue globale ET
 * chaque zoom projet. On ne fait que changer sa cible via
 * setLookAt(..., true) qui anime en interne (damping) — pas de
 * caméra recréée, pas d'animation manuelle coûteuse.
 *
 * En vue globale, la caméra est libre : rotation (clic gauche),
 * déplacement/pan (clic droit ou molette-clic), et zoom (molette).
 * En vue projet (zoom sur une carte), tout est verrouillé pour
 * garder le focus sur le projet actif — sauf la molette, qui reste
 * active pour affiner la distance.
 *
 * Détection de "drift" : camera-controls émet un événement `control`
 * uniquement quand l'utilisateur pilote lui-même la caméra (drag,
 * molette) — jamais lors d'un setLookAt(..., true) programmatique.
 * On s'en sert pour signaler au parent (via `onDriftChange`) que
 * l'utilisateur s'est éloigné de la vue d'ensemble, et pour afficher
 * un bouton "retour" côté TopBar. On ignore ces événements pendant
 * qu'un projet est actif (le wheel reste actif dans ce mode pour le
 * zoom, mais ce n'est pas un "drift" au sens vue d'ensemble).
 *
 * `resetToOverview` est exposé via ref pour permettre au bouton
 * "retour" (rendu hors du Canvas, dans TopBar) de ramener la caméra
 * à OVERVIEW depuis l'extérieur.
 */
const CameraRig = forwardRef(function CameraRig({ activeProject, onDriftChange }, ref) {
  const controlsRef = useRef();
  const activeProjectRef = useRef(activeProject);
  const driftedRef = useRef(false);

  activeProjectRef.current = activeProject;

  useImperativeHandle(ref, () => ({
    resetToOverview() {
      controlsRef.current?.setLookAt(...OVERVIEW.position, ...OVERVIEW.target, true);
      if (driftedRef.current) {
        driftedRef.current = false;
        onDriftChange?.(false);
      }
    },
  }));

  // Écoute des mouvements caméra initiés par l'utilisateur (pas les
  // transitions programmatiques via setLookAt).
  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    const handleControl = () => {
      if (activeProjectRef.current) return; // zoom projet : on ignore (wheel actif mais pas un vrai "drift")
      if (!driftedRef.current) {
        driftedRef.current = true;
        onDriftChange?.(true);
      }
    };

    controls.addEventListener("control", handleControl);
    return () => controls.removeEventListener("control", handleControl);
  }, [onDriftChange]);

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    if (activeProject) {
      const [px, py, pz] = activeProject.position;
      // Override par projet si présent (project.camera.offset dans
      // projects.config.js), sinon décalage par défaut ci-dessus.
      const offset = activeProject.camera?.offset ?? DEFAULT_ZOOM_OFFSET;

      controls.setLookAt(
        px + offset.x,
        py + offset.y,
        pz + offset.z,
        px,
        py,
        pz,
        true
      );
    } else {
      controls.setLookAt(...OVERVIEW.position, ...OVERVIEW.target, true);
    }

    // On (re)part d'un état "propre" à chaque entrée/sortie de zoom
    // projet : plus de drift signalé tant que l'utilisateur n'a pas
    // rebougé la caméra librement depuis là.
    if (driftedRef.current) {
      driftedRef.current = false;
      onDriftChange?.(false);
    }
  }, [activeProject, onDriftChange]);

  return (
    <CameraControls
      ref={controlsRef}
      makeDefault
      minDistance={1.5}
      maxDistance={450}
      dollyToCursor={false}
      polarRotateSpeed={activeProject ? 0 : 0.4}
      azimuthRotateSpeed={activeProject ? 0 : 0.4}
      truckSpeed={activeProject ? 0 : 1.2}
      dollySpeed={activeProject ? 0 : 0.6}
      mouseButtons={{
        left: activeProject ? 0 : 1,
        right: activeProject ? 0 : 2,
        middle: activeProject ? 0 : 2,
        wheel: 4,
      }}
    />
  );
});

export default CameraRig;
export { OVERVIEW };
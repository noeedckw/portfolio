import { useEffect, useRef } from "react";
import { CameraControls } from "@react-three/drei";

const OVERVIEW = {
  position: [0, 9, 11],
  target: [0, 0, 0],
};

/**
 * Un seul CameraControls réutilisé pour tout : la vue globale ET
 * chaque zoom projet. On ne fait que changer sa cible via
 * setLookAt(..., true) qui anime en interne (damping) — pas de
 * caméra recréée, pas d'animation manuelle coûteuse.
 *
 * En vue globale, la caméra est libre : rotation (clic gauche),
 * déplacement/pan (clic droit ou molette-clic), et zoom (molette).
 * Le `target` n'est donc plus un pivot fixe — truck() le déplace
 * en même temps que la caméra, comme un vrai déplacement dans
 * l'espace plutôt qu'une orbite autour d'un point immobile.
 * En vue projet (zoom sur une carte), tout est verrouillé pour
 * garder le focus sur le projet actif.
 */
export default function CameraRig({ activeProject }) {
  const controlsRef = useRef();

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    if (activeProject) {
      const [px, py, pz] = activeProject.position;
      // on se place légèrement devant/au-dessus de la carte, face à elle
      controls.setLookAt(px, py + 0.6, pz + 2.6, px, py, pz, true);
    } else {
      controls.setLookAt(...OVERVIEW.position, ...OVERVIEW.target, true);
    }
  }, [activeProject]);

  return (
    <CameraControls
      ref={controlsRef}
      makeDefault
      minDistance={1.5}
      maxDistance={30}
      dollyToCursor={false}
      // sur la map globale : orbite + pan libres pour se balader ;
      // en vue projet : tout verrouillé pour garder le focus
      polarRotateSpeed={activeProject ? 0 : 0.4}
      azimuthRotateSpeed={activeProject ? 0 : 0.4}
      truckSpeed={activeProject ? 0 : 1.2}
      dollySpeed={activeProject ? 0 : 0.6}
      mouseButtons={{
        left: activeProject ? 0 : 1,   // ROTATE = 1 (0 = désactivé)
        right: activeProject ? 0 : 2,  // TRUCK (pan) = 2
        middle: activeProject ? 0 : 2, // molette-clic = pan aussi (confort)
        wheel: 4,                      // DOLLY (zoom) = 4, toujours actif
      }}
    />
  );
}

export { OVERVIEW };
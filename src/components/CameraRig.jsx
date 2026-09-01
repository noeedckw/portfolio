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
      maxDistance={20}
      dollyToCursor={false}
      // sur la map globale on autorise une légère orbite libre,
      // en vue projet on verrouille pour garder le focus
      polarRotateSpeed={activeProject ? 0 : 0.4}
      azimuthRotateSpeed={activeProject ? 0 : 0.4}
      truckSpeed={0}
      dollySpeed={activeProject ? 0 : 0.6}
    />
  );
}

export { OVERVIEW };
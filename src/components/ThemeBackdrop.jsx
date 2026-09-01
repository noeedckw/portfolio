import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import * as THREE from "three";

const NEUTRAL_BG = new THREE.Color("#0a0b0f");
const NEUTRAL_ACCENT = new THREE.Color("#7c8cff");

/**
 * Fond de scène + brouillard qui glisse doucement vers la couleur du
 * thème du projet actif, et revient au neutre sur la map globale.
 * Un seul système de particules GPU (Sparkles) réutilisé partout —
 * pas de reconstruction de géométrie à chaque changement de projet,
 * juste une interpolation de couleur : coût constant, pas de lag.
 */
export default function ThemeBackdrop({ activeTheme }) {
  const bgColor = useRef(NEUTRAL_BG.clone());
  const fogRef = useRef();
  const sceneBgApplied = useRef(new THREE.Color());

  const targetBg = activeTheme ? new THREE.Color(activeTheme.background) : NEUTRAL_BG;
  const targetAccent = activeTheme ? new THREE.Color(activeTheme.accent) : NEUTRAL_ACCENT;
  const particleMode = activeTheme?.particles ?? "drift";

  useFrame(({ scene }, delta) => {
    bgColor.current.lerp(targetBg, Math.min(1, delta * 2));
    if (!scene.background || !(scene.background instanceof THREE.Color)) {
      scene.background = sceneBgApplied.current;
    }
    scene.background.copy(bgColor.current);
    if (scene.fog) {
      scene.fog.color.copy(bgColor.current);
    }
  });

  return (
    <>
      <fog ref={fogRef} attach="fog" args={[bgColor.current.getHexString(), 6, 26]} />
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 6, 4]} intensity={0.6} />
      {particleMode !== "none" && (
        <Sparkles
          count={activeTheme ? 140 : 90}
          scale={activeTheme ? 10 : 16}
          size={activeTheme ? 3 : 1.6}
          speed={particleMode === "grid" ? 0.15 : 0.4}
          color={targetAccent}
          opacity={0.55}
        />
      )}
    </>
  );
}
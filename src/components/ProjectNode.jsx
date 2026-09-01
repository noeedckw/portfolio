import { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, Billboard } from "@react-three/drei";
import * as THREE from "three";

/**
 * Charge une texture "à la main" avec un TextureLoader classique,
 * plutôt que useTexture/drei <Image> (qui throw via Suspense si le
 * fichier 404 et fait crasher tout le Canvas). Ici on catch l'erreur
 * et on retombe simplement sur `null` -> le composant affiche alors
 * le placeholder couleur.
 */
function useSafeTexture(url) {
  const [texture, setTexture] = useState(null);

  useEffect(() => {
    if (!url) {
      setTexture(null);
      return;
    }

    let cancelled = false;
    const loader = new THREE.TextureLoader();

    loader.load(
      url,
      (tex) => {
        if (cancelled) return;
        tex.colorSpace = THREE.SRGBColorSpace;
        setTexture(tex);
      },
      undefined,
      (err) => {
        if (cancelled) return;
        console.warn(`[ProjectNode] cover introuvable pour "${url}", fallback couleur.`, err);
        setTexture(null);
      }
    );

    return () => {
      cancelled = true;
    };
  }, [url]);

  return texture;
}

/**
 * Un noeud de la map = une carte "photo" flottante (image + titre +
 * date), toujours tournée vers la caméra (billboard). Léger : une
 * seule texture par projet, pas de géométrie complexe, pas de
 * lumière dynamique par carte.
 */
export default function ProjectNode({ project, isActive, isDimmed, onSelect }) {
  const groupRef = useRef();
  const [hovered, setHovered] = useState(false);
  const texture = useSafeTexture(project.image);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    // petite lévitation, coût quasi nul (juste un sin par frame)
    groupRef.current.position.y +=
      Math.sin(performance.now() * 0.0006 + project.position[0]) * 0.0006;

    // scale de hover/active, lerp doux
    const targetScale = isActive ? 1.35 : hovered ? 1.12 : 1;
    const s = groupRef.current.scale;
    s.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), Math.min(1, delta * 8));
  });

  const targetOpacity = isDimmed ? 0.15 : 1;

  return (
    <group
      ref={groupRef}
      position={project.position}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(project);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = "auto";
      }}
    >
      <Billboard>
        {/* Cadre / carte */}
        <mesh>
          <planeGeometry args={[1.5, 1.02]} />
          <meshBasicMaterial
            color={project.theme?.accent ?? "#ffffff"}
            transparent
            opacity={targetOpacity * 0.9}
          />
        </mesh>

        {texture ? (
          <mesh position={[0, 0, 0.01]}>
            <planeGeometry args={[1.4, 0.92]} />
            <meshBasicMaterial
              map={texture}
              transparent
              opacity={targetOpacity}
              toneMapped={false}
            />
          </mesh>
        ) : (
          <mesh position={[0, 0, 0.01]}>
            <planeGeometry args={[1.4, 0.92]} />
            <meshBasicMaterial
              color={project.theme?.background ?? "#111214"}
              transparent
              opacity={targetOpacity}
            />
          </mesh>
        )}

        <Text
          position={[0, -0.68, 0.02]}
          fontSize={0.13}
          color="#eef0f4"
          anchorX="center"
          anchorY="top"
          maxWidth={1.6}
          fillOpacity={targetOpacity}
        >
          {project.title}
        </Text>
        <Text
          position={[0, -0.86, 0.02]}
          fontSize={0.09}
          color={project.theme?.accent ?? "#9aa0a6"}
          anchorX="center"
          anchorY="top"
          fillOpacity={targetOpacity}
        >
          {project.date}
        </Text>
      </Billboard>
    </group>
  );
}
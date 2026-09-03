import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import { getLogoConfig } from "../config/projects.config";

function buildPathSampler(points) {
  const vecs = points.map((p) => new THREE.Vector3(...p));
  const lengths = [];
  let total = 0;

  for (let i = 0; i < vecs.length - 1; i++) {
    const d = vecs[i].distanceTo(vecs[i + 1]);
    lengths.push(d);
    total += d;
  }

  return function sample(t, target) {
    const dist = t * total;
    let acc = 0;
    for (let i = 0; i < lengths.length; i++) {
      if (acc + lengths[i] >= dist || i === lengths.length - 1) {
        const segT = lengths[i] > 0 ? (dist - acc) / lengths[i] : 0;
        return target.lerpVectors(vecs[i], vecs[i + 1], THREE.MathUtils.clamp(segT, 0, 1));
      }
      acc += lengths[i];
    }
    return target.copy(vecs[vecs.length - 1]);
  };
}

/**
 * Un flux lumineux discret : un tout petit noyau + une fine traînée
 * qui suit le tracé exact de la ligne, façon "signal qui parcourt un
 * fil" plutôt qu'une bille qui flotte à côté.
 *
 * `opacityRef` : ref externe (0..1) pilotée par le parent (fade
 * global lié à `hidden`), multipliée à l'intensité propre du pulse.
 */
function FlowPulse({ points, color, speed = 0.15, offset = 0, opacityRef, trailLength = 8 }) {
  const coreRef = useRef();
  const glowRefs = useRef([]);
  const trailRefs = useRef([]);
  const sampler = useMemo(() => buildPathSampler(points), [points]);
  const tmp = useMemo(() => new THREE.Vector3(), []);
  const colorObj = useMemo(() => new THREE.Color(color), [color]);

  useFrame(({ clock }) => {
    const groupOpacity = opacityRef.current;

    const baseT = ((clock.elapsedTime * speed + offset) % 1 + 1) % 1;
    const edgeFade = Math.min(1, baseT * 10, (1 - baseT) * 10);
    const intensity = edgeFade * groupOpacity;

    sampler(baseT, tmp);

    if (coreRef.current) {
      coreRef.current.position.copy(tmp);
      coreRef.current.material.opacity = intensity;
    }

    glowRefs.current.forEach((mesh, gi) => {
      if (!mesh) return;
      mesh.position.copy(tmp);
      mesh.material.opacity = intensity * (gi === 0 ? 0.55 : 0.3);
    });

    trailRefs.current.forEach((mesh, ti) => {
      if (!mesh) return;
      const trailT = ((baseT - (ti + 1) * 0.008) % 1 + 1) % 1;
      sampler(trailT, tmp);
      mesh.position.copy(tmp);
      const falloff = 1 - (ti + 1) / (trailLength + 1);
      mesh.material.opacity = intensity * falloff * 0.45;
      mesh.scale.setScalar(0.4 + 0.6 * falloff);
    });
  });

  return (
    <group>
      {Array.from({ length: trailLength }).map((_, ti) => (
        <mesh key={ti} ref={(el) => (trailRefs.current[ti] = el)}>
          <sphereGeometry args={[0.025, 6, 6]} />
          <meshBasicMaterial
            color={colorObj}
            transparent
            opacity={0}
            toneMapped={false}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}

      {[0.11, 0.075].map((r, gi) => (
        <mesh key={gi} ref={(el) => (glowRefs.current[gi] = el)}>
          <sphereGeometry args={[r, 10, 10]} />
          <meshBasicMaterial
            color={colorObj}
            transparent
            opacity={0}
            toneMapped={false}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}

      <mesh ref={coreRef}>
        <sphereGeometry args={[0.032, 8, 8]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0}
          toneMapped={false}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

/**
 * Marge laissée entre le bord de la carte et l'extrémité du trait,
 * pour que le lien s'arrête visiblement "juste avant" l'image plutôt
 * que de la toucher pile au pixel près.
 */
const LINK_GAP = 0.06;

/** Vitesse du fade in/out des liens quand on zoome/dézoome un projet. */
const FADE_SPEED = 6;

/**
 * Calcule la demi-largeur / demi-hauteur effective d'un nœud (en
 * unités monde), à partir de sa config logo (mêmes règles que
 * ProjectNode : cercle -> rayon dans les deux axes, sinon largeur/2
 * et hauteur/2), bordure incluse si activée.
 */
function getNodeHalfExtents(project) {
  const logo = getLogoConfig(project);
  const border = logo.border?.enabled ? logo.border.thickness : 0;

  if (logo.shape === "circle") {
    const r = Math.min(logo.width, logo.height) / 2 + border;
    return { halfW: r, halfH: r };
  }

  return {
    halfW: logo.width / 2 + border,
    halfH: logo.height / 2 + border,
  };
}

/**
 * Recule `point` le long de la direction (point -> target) d'une
 * distance `dist`, sans jamais dépasser le milieu du segment (évite
 * un trait inversé si deux cartes sont trop proches l'une de l'autre).
 */
function pullBack(point, target, dist) {
  const p = new THREE.Vector3(...point);
  const t = new THREE.Vector3(...target);
  const dir = t.clone().sub(p);
  const len = dir.length();
  if (len < 1e-6) return point;
  dir.normalize();
  const clamped = Math.min(dist, len * 0.5);
  return p.addScaledVector(dir, clamped).toArray();
}

export default function TimelineLinks({ projects, activeProject }) {
  const lineRefs = useRef({});
  // Ref array de scalaires plutôt qu'un state -> pas de re-render à
  // 60fps pendant le fade (même logique que textOpacityRef dans
  // ProjectNode).
  const fadeRefs = useRef([]);

  // Un projet est zoomé/actif -> on cache entièrement les liens et
  // leurs pulses, mais en fondu plutôt qu'instantanément.
  const hidden = Boolean(activeProject);

  const segments = useMemo(() => {
    const segs = [];

    for (let i = 0; i < projects.length - 1; i++) {
      const a = projects[i];
      const b = projects[i + 1];
      const [ax, ay, az] = a.position;
      const [bx, , bz] = b.position;

      const corner1 = [bx, ay, az];
      const corner2 = [bx, ay, bz];

      // Le 1er tronçon (a -> corner1) se déplace en X : on recule le
      // départ de la demi-largeur de la carte `a`. Le dernier tronçon
      // (corner2 -> b) se déplace en Y : on recule l'arrivée de la
      // demi-hauteur de la carte `b`.
      const { halfW: aHalfW } = getNodeHalfExtents(a);
      const { halfH: bHalfH } = getNodeHalfExtents(b);

      const start = pullBack(a.position, corner1, aHalfW + LINK_GAP);
      const end = pullBack(b.position, corner2, bHalfH + LINK_GAP);

      segs.push({
        key: `${a.id}-${b.id}`,
        points: [start, corner1, corner2, end],
        color: a.theme?.accent ?? "#ffffff",
        from: a.id,
        to: b.id,
      });
    }

    return segs;
  }, [projects]);

  // (Ré)initialise un ref d'opacité par segment quand la liste change,
  // en partant de l'état "visible" par défaut.
  if (fadeRefs.current.length !== segments.length) {
    fadeRefs.current = segments.map((_, i) => ({ current: fadeRefs.current[i]?.current ?? 1 }));
  }

  useFrame(({ clock }, delta) => {
    const target = hidden ? 0 : 1;

    segments.forEach((seg, i) => {
      const fadeRef = fadeRefs.current[i];
      fadeRef.current = THREE.MathUtils.lerp(fadeRef.current, target, Math.min(1, delta * FADE_SPEED));

      const mat = lineRefs.current[seg.key]?.material;
      if (!mat) return;

      const f = fadeRef.current;
      const base = 0.55 * f;
      const breathe = 0.08 * f * Math.sin(clock.elapsedTime * 1.4 + i * 1.7);
      mat.opacity = Math.max(0, base + breathe);
      mat.visible = f > 0.01;
    });
  });

  return (
    <>
      {segments.map((seg, i) => (
        <group key={seg.key}>
          <Line
            ref={(el) => (lineRefs.current[seg.key] = el)}
            points={seg.points}
            color={seg.color}
            lineWidth={3.0}
            transparent
            opacity={hidden ? 0 : 0.55}
          />
          <FlowPulse points={seg.points} color={seg.color} speed={0.15} offset={0} opacityRef={fadeRefs.current[i]} />
          <FlowPulse points={seg.points} color={seg.color} speed={0.15} offset={0.5} opacityRef={fadeRefs.current[i]} />
        </group>
      ))}
    </>
  );
}
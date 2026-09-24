import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import { getLogoConfig } from "../config/projects.config";

/* ==========================================================================
   Réglages du style des traits
   ========================================================================== */

/** Rayon d'arrondi des coins, en unités monde. 0 = angles vifs. */
const CORNER_RADIUS = 1.1;

/**
 * Douceur d'entrée dans le virage (0.55 = cercle parfait,
 * plus haut = entrée/sortie plus progressives, style "squircle").
 */
const CORNER_TENSION = 0.7;

/** Épaisseur du corps du trait, en pixels. */
const LINE_WIDTH = 2.8;

/** Force du halo autour du trait (0 = aucun, 1 = défaut, 2 = très lumineux). */
const GLOW = 1;

/** Part du trait (0 à 0.5) qui s'estompe (en transparence) à chaque extrémité. */
const FADE_ENDS = 0.1;

/**
 * Points par coin arrondi pour le CŒUR du trait (Line2).
 * Volontairement modéré : trop de points = trop de chevauchements
 * de segments semi-transparents dans les virages.
 */
const CURVE_DIVISIONS = 20;

/**
 * Part du trait (0 à 0.5) sur laquelle on superpose un renfort plus
 * épais à chaque extrémité (cœur du trait uniquement, pas le halo).
 */
const CAP_FRACTION = 0.14;

/** Multiplicateur de largeur appliqué à ce renfort d'extrémité. */
const CAP_WIDTH_MULT = 1.4;

/* --------------------------------------------------------------------------
   Halo : un seul tube par lien, dégradé calculé dans un shader
   -------------------------------------------------------------------------- */

/** Rayon du halo, en unités monde (la largeur totale = 2x). */
const HALO_RADIUS = 0.16;

/** Opacité du halo au centre du trait (avant GLOW). */
const HALO_OPACITY = 0.4;

/**
 * Décroissance du halo du centre vers l'extérieur.
 * Plus haut = halo plus concentré près du trait, plus bas = plus étalé.
 */
const HALO_FALLOFF = 2.2;

/**
 * Surplus de glow au milieu des coins (0 = identique aux droites,
 * 0.35 = un petit peu plus, 0.8 = nettement plus).
 */
const CORNER_GLOW = 0.35;

/** Échantillons le long du tube (plus = courbes plus lisses). */
const HALO_SEGMENTS = 220;

/** Facettes autour du tube. */
const HALO_RADIAL = 16;

/**
 * Couches du cœur du trait, de l'extérieur vers l'intérieur.
 * w = multiplicateur de largeur, opacity = opacité de la couche,
 * white = part de blanc mélangée à la couleur du projet.
 */
const CORE_LAYERS = [
  { w: 1, opacity: 0.95, white: 0 },
  { w: 0.35, opacity: 0.8, white: 0.3 },
];

/** Halo de l'impulsion lumineuse : rayon + opacité relative, du plus large au plus serré. */
const PULSE_GLOW = [
  { r: 0.17, o: 0.1 },
  { r: 0.13, o: 0.18 },
  { r: 0.095, o: 0.3 },
  { r: 0.07, o: 0.5 },
];

/* ==========================================================================
   Shader du halo
   ========================================================================== */

const HALO_VERTEX = /* glsl */ `
  attribute float aBoost;
  varying vec3 vN;
  varying float vU;
  varying float vBoost;
  void main() {
    vN = normalize(normalMatrix * normal);
    vU = uv.x;
    vBoost = aBoost;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const HALO_FRAGMENT = /* glsl */ `
  uniform vec3 uFrom;
  uniform vec3 uTo;
  uniform float uOpacity;
  uniform float uFalloff;
  uniform float uFade;
  varying vec3 vN;
  varying float vU;
  varying float vBoost;
  void main() {
    // Distance au centre du tube (0 au centre, 1 au bord), déduite de la normale.
    float n = clamp(abs(normalize(vN).z), 0.0, 1.0);
    float r = sqrt(max(0.0, 1.0 - n * n));
    float a = pow(1.0 - r, uFalloff);
    // Estompage aux extrémités du lien.
    float env = smoothstep(0.0, uFade, vU) * smoothstep(0.0, uFade, 1.0 - vU);
    gl_FragColor = vec4(mix(uFrom, uTo, vU), a * env * uOpacity * (1.0 + vBoost));
    #include <colorspace_fragment>
  }
`;

function buildHalo(path, from, to) {
  const geometry = new THREE.TubeGeometry(path, HALO_SEGMENTS, HALO_RADIUS, HALO_RADIAL, false);

  // Boost de glow par sommet : cloche (0 -> 1 -> 0) sur chaque coin arrondi.
  const lengths = path.getCurveLengths(); // longueurs cumulées
  const totalLen = lengths[lengths.length - 1] || 1;
  const cornerRanges = [];
  path.curves.forEach((c, k) => {
    if (c.isCubicBezierCurve3) {
      cornerRanges.push([(lengths[k - 1] ?? 0) / totalLen, lengths[k] / totalLen]);
    }
  });

  const ringSize = HALO_RADIAL + 1;
  const boost = new Float32Array((HALO_SEGMENTS + 1) * ringSize);
  for (let i = 0; i <= HALO_SEGMENTS; i++) {
    const u = i / HALO_SEGMENTS;
    let b = 0;
    for (const [s, e] of cornerRanges) {
      if (u >= s && u <= e) b = Math.max(b, Math.sin((Math.PI * (u - s)) / (e - s)));
    }
    boost.fill(b * CORNER_GLOW, i * ringSize, (i + 1) * ringSize);
  }
  geometry.setAttribute("aBoost", new THREE.BufferAttribute(boost, 1));

  const material = new THREE.ShaderMaterial({
    vertexShader: HALO_VERTEX,
    fragmentShader: HALO_FRAGMENT,
    uniforms: {
      uFrom: { value: new THREE.Color(from) },
      uTo: { value: new THREE.Color(to) },
      uOpacity: { value: 0 },
      uFalloff: { value: HALO_FALLOFF },
      uFade: { value: FADE_ENDS },
    },
    transparent: true,
    depthWrite: false,
    side: THREE.FrontSide,
    toneMapped: false,
  });
  return { geometry, material };
}

/* ==========================================================================
   Géométrie : chemin à coins arrondis
   ========================================================================== */

const smooth = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/**
 * Construit un THREE.CurvePath : segments droits + un arrondi (Bézier
 * cubique, plus progressif qu'une quadratique) à chaque angle.
 * Le rayon est limité à la moitié des segments adjacents pour ne jamais
 * dépasser sur les traits courts. Retourne null si le chemin est dégénéré.
 */
function buildRoundedPath(points, radius) {
  const v = points
    .map((p) => new THREE.Vector3(...p))
    .filter((p, i, arr) => i === 0 || p.distanceTo(arr[i - 1]) > 1e-5);
  if (v.length < 2) return null;

  const path = new THREE.CurvePath();
  let cursor = v[0].clone();

  for (let i = 1; i < v.length - 1; i++) {
    const corner = v[i];
    const toPrev = v[i - 1].clone().sub(corner);
    const toNext = v[i + 1].clone().sub(corner);
    const r = Math.min(radius, toPrev.length() / 2, toNext.length() / 2);

    const a = corner.clone().addScaledVector(toPrev.normalize(), r);
    const b = corner.clone().addScaledVector(toNext.normalize(), r);

    if (cursor.distanceTo(a) > 1e-6) path.add(new THREE.LineCurve3(cursor.clone(), a));
    path.add(
      new THREE.CubicBezierCurve3(
        a,
        a.clone().lerp(corner, CORNER_TENSION),
        b.clone().lerp(corner, CORNER_TENSION),
        b
      )
    );
    cursor = b;
  }

  path.add(new THREE.LineCurve3(cursor.clone(), v[v.length - 1].clone()));
  return path;
}

/**
 * Découpe un sous-tronçon de positions/couleurs déjà échantillonnées,
 * à partir du début ("start") ou de la fin ("end") du trait, sur la
 * fraction de longueur `fraction`. Retourne null si le tronçon est
 * trop court pour former un segment exploitable.
 */
function sliceCap(cum, total, positions, colors, fraction, mode) {
  if (mode === "start") {
    let idx = cum.findIndex((c) => c / total > fraction);
    if (idx === -1) idx = positions.length - 1;
    if (idx < 1) return null;
    return { positions: positions.slice(0, idx + 1), colors: colors.slice(0, idx + 1) };
  }

  let idx = cum.findIndex((c) => c / total >= 1 - fraction);
  if (idx === -1) idx = 0;
  if (idx > positions.length - 2) return null;
  return { positions: positions.slice(idx), colors: colors.slice(idx) };
}

/**
 * Échantillonne le chemin et prépare les couches du CŒUR du néon :
 * positions communes, couleurs par sommet (dégradé from -> to selon la
 * distance parcourue) avec estompage aux extrémités via l'ALPHA du
 * sommet (la couleur reste pure, elle ne vire pas au noir), plus deux
 * renforts superposés (début / fin) qui épaississent le trait à ses
 * extrémités. Le halo, lui, est géré à part (tube + shader).
 */
function buildLayers(path, from, to) {
  const pts = path.getPoints(CURVE_DIVISIONS);

  const cum = [0];
  for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + pts[i].distanceTo(pts[i - 1]));
  const total = cum[cum.length - 1] || 1;

  const positions = pts.map((p) => [p.x, p.y, p.z]);
  const cFrom = new THREE.Color(from);
  const cTo = new THREE.Color(to);
  const white = new THREE.Color("#ffffff");

  const layers = [];

  CORE_LAYERS.forEach((layerDef) => {
    const opacity = layerDef.opacity;
    const lineWidth = LINE_WIDTH * layerDef.w;

    const colors = pts.map((_, i) => {
      const t = cum[i] / total;
      const envelope = smooth(0, FADE_ENDS, t) * smooth(0, FADE_ENDS, 1 - t);
      const c = cFrom.clone().lerp(cTo, t).lerp(white, layerDef.white);
      // Estompage aux extrémités : alpha par sommet, couleur inchangée.
      return [c.r, c.g, c.b, envelope];
    });

    layers.push({ positions, colors, lineWidth, opacity });

    const startCap = sliceCap(cum, total, positions, colors, CAP_FRACTION, "start");
    if (startCap) {
      layers.push({ ...startCap, lineWidth: lineWidth * CAP_WIDTH_MULT, opacity });
    }

    const endCap = sliceCap(cum, total, positions, colors, CAP_FRACTION, "end");
    if (endCap) {
      layers.push({ ...endCap, lineWidth: lineWidth * CAP_WIDTH_MULT, opacity });
    }
  });

  return layers;
}

/* ==========================================================================
   Impulsion lumineuse qui suit exactement la courbe
   ========================================================================== */

/**
 * Un flux lumineux discret : un tout petit noyau + une fine traînée
 * qui suit le tracé exact de la ligne, façon "signal qui parcourt un
 * fil" plutôt qu'une bille qui flotte à côté. Toutes les boules
 * (traînée, halo, noyau) reprennent la couleur du lien.
 *
 * `opacityRef` : ref externe (0..1) pilotée par le parent (fade
 * global lié à `hidden`), multipliée à l'intensité propre du pulse.
 */
function FlowPulse({ path, color, speed = 0.15, offset = 0, opacityRef, trailLength = 8 }) {
  const coreRef = useRef();
  const glowRefs = useRef([]);
  const trailRefs = useRef([]);
  const tmp = useMemo(() => new THREE.Vector3(), []);
  const colorObj = useMemo(() => new THREE.Color(color), [color]);

  useFrame(({ clock }) => {
    const groupOpacity = opacityRef.current;

    const baseT = ((clock.elapsedTime * speed + offset) % 1 + 1) % 1;
    const edgeFade = Math.min(1, baseT * 10, (1 - baseT) * 10);
    const intensity = edgeFade * groupOpacity;

    path.getPointAt(baseT, tmp);

    if (coreRef.current) {
      coreRef.current.position.copy(tmp);
      coreRef.current.material.opacity = intensity;
    }

    glowRefs.current.forEach((mesh, gi) => {
      if (!mesh) return;
      mesh.position.copy(tmp);
      mesh.material.opacity = intensity * PULSE_GLOW[gi].o;
    });

    trailRefs.current.forEach((mesh, ti) => {
      if (!mesh) return;
      const trailT = ((baseT - (ti + 1) * 0.008) % 1 + 1) % 1;
      path.getPointAt(trailT, tmp);
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

      {PULSE_GLOW.map(({ r }, gi) => (
        <mesh key={gi} ref={(el) => (glowRefs.current[gi] = el)}>
          <sphereGeometry args={[r, 14, 14]} />
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
          color={colorObj}
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

/* ==========================================================================
   Liens de la timeline
   ========================================================================== */

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
  const layerRefs = useRef({});
  const haloRefs = useRef({});
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

      const path = buildRoundedPath([start, corner1, corner2, end], CORNER_RADIUS);
      if (!path) continue;

      const from = a.theme?.accent ?? "#ffffff";
      const to = b.theme?.accent ?? from;

      const halo = buildHalo(path, from, to);

      segs.push({
        key: `${a.id}-${b.id}`,
        path,
        layers: buildLayers(path, from, to),
        haloGeometry: halo.geometry,
        haloMaterial: halo.material,
        color: from,
      });
    }

    return segs;
  }, [projects]);

  // Libère les géométries / matériaux du halo quand la liste change.
  useEffect(
    () => () => {
      segments.forEach((s) => {
        s.haloGeometry.dispose();
        s.haloMaterial.dispose();
      });
    },
    [segments]
  );

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

      const f = fadeRef.current;
      // Léger "souffle" du trait, appliqué à toutes les couches d'un coup.
      const breathe = 0.92 + 0.08 * Math.sin(clock.elapsedTime * 1.4 + i * 1.7);

      // Halo (tube + shader).
      const haloMesh = haloRefs.current[seg.key];
      if (haloMesh) {
        seg.haloMaterial.uniforms.uOpacity.value = Math.min(1, HALO_OPACITY * GLOW) * f * breathe;
        haloMesh.visible = f > 0.01;
      }

      // Cœur du trait.
      layerRefs.current[seg.key]?.forEach((line, li) => {
        const mat = line?.material;
        if (!mat) return;
        mat.opacity = seg.layers[li].opacity * f * breathe;
        mat.visible = f > 0.01;
      });
    });
  });

  return (
    <>
      {segments.map((seg, i) => (
        <group key={seg.key}>
          <mesh
            ref={(el) => {
              haloRefs.current[seg.key] = el;
            }}
            geometry={seg.haloGeometry}
            material={seg.haloMaterial}
            renderOrder={0}
          />
          {seg.layers.map((layer, li) => (
            <Line
              key={li}
              ref={(el) => {
                (layerRefs.current[seg.key] ??= [])[li] = el;
              }}
              points={layer.positions}
              vertexColors={layer.colors}
              color="white"
              lineWidth={layer.lineWidth}
              transparent
              opacity={hidden ? 0 : layer.opacity}
              depthWrite={false}
              toneMapped={false}
              renderOrder={li + 1}
            />
          ))}
          <FlowPulse path={seg.path} color={seg.color} speed={0.15} offset={0} opacityRef={fadeRefs.current[i]} />
          <FlowPulse path={seg.path} color={seg.color} speed={0.15} offset={0.5} opacityRef={fadeRefs.current[i]} />
        </group>
      ))}
    </>
  );
}
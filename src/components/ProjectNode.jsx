import { useRef, useState, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, Billboard } from "@react-three/drei";
import * as THREE from "three";
import { resolveAsset } from "../utils/assets";
import { getLogoConfig, getLocalizedProject } from "../config/projects.config";

/** Construit une forme rectangle à coins arrondis (pour shape "rounded" et le panneau de texte). */
function createRoundedRectShape(width, height, radius) {
  const w = width / 2;
  const h = height / 2;
  const r = Math.min(radius, w, h);

  const shape = new THREE.Shape();
  shape.moveTo(-w + r, -h);
  shape.lineTo(w - r, -h);
  shape.quadraticCurveTo(w, -h, w, -h + r);
  shape.lineTo(w, h - r);
  shape.quadraticCurveTo(w, h, w - r, h);
  shape.lineTo(-w + r, h);
  shape.quadraticCurveTo(-w, h, -w, h - r);
  shape.lineTo(-w, -h + r);
  shape.quadraticCurveTo(-w, -h, -w + r, -h);
  shape.closePath();
  return shape;
}

/**
 * ShapeGeometry ne génère PAS des UV normalisées [0,1] comme
 * PlaneGeometry : elle recopie directement les coordonnées brutes
 * du Shape (ex: -0.55 à 0.55) comme UV. Sans correction, une
 * texture appliquée dessus se retrouve écrasée dans un coin au
 * lieu de remplir la carte. On recalcule donc les UV ici à partir
 * de la position réelle de chaque vertex, normalisée sur width/height.
 */
function fixShapeGeometryUVs(geometry, width, height) {
  const pos = geometry.attributes.position;
  const uv = geometry.attributes.uv;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    uv.setXY(i, x / width + 0.5, y / height + 0.5);
  }
  uv.needsUpdate = true;
  return geometry;
}

/** Retourne la géométrie adaptée à la forme choisie. */
function createCardGeometry(shape, width, height, cornerRadius) {
  switch (shape) {
    case "circle": {
      const radius = Math.min(width, height) / 2;
      return new THREE.CircleGeometry(radius, 48);
    }
    case "rounded": {
      const geo = new THREE.ShapeGeometry(createRoundedRectShape(width, height, cornerRadius), 24);
      return fixShapeGeometryUVs(geo, width, height);
    }
    case "square": {
      // cornerRadius > 0 => coins légèrement arrondis même en mode "square"
      if (cornerRadius > 0) {
        const geo = new THREE.ShapeGeometry(createRoundedRectShape(width, height, cornerRadius), 24);
        return fixShapeGeometryUVs(geo, width, height);
      }
      return new THREE.PlaneGeometry(width, height);
    }
    case "none":
    default:
      return new THREE.PlaneGeometry(width, height);
  }
}

/**
 * Charge une texture "à la main" avec un TextureLoader classique,
 * plutôt que useTexture/drei <Image> (qui throw via Suspense si le
 * fichier 404 et fait crasher tout le Canvas). Ici on catch l'erreur
 * et on retombe simplement sur `null` -> le composant affiche alors
 * le placeholder couleur.
 *
 * Mipmaps désactivés volontairement pour rester net à distance.
 *
 * `fit` contrôle le recadrage dans le cadre (containerAspect) :
 * - "contain" : l'image entière reste visible, quitte à laisser
 *   de l'espace vide sur les côtés (adapté aux logos).
 * - "cover" : l'image remplit tout le cadre, quitte à rogner les
 *   bords (adapté aux photos).
 */
function useSafeTexture(url, containerAspect, fit = "contain") {
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
        tex.generateMipmaps = false;
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;

        const imageAspect = tex.image.width / tex.image.height;
        const shouldCropWidth =
          fit === "cover" ? imageAspect > containerAspect : imageAspect < containerAspect;

        if (shouldCropWidth) {
          tex.repeat.set(containerAspect / imageAspect, 1);
          tex.offset.set((1 - tex.repeat.x) / 2, 0);
        } else {
          tex.repeat.set(1, imageAspect / containerAspect);
          tex.offset.set(0, (1 - tex.repeat.y) / 2);
        }

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
  }, [url, containerAspect, fit]);

  return texture;
}

/**
 * Un noeud de la map = une carte "photo" flottante (image + titre +
 * date), toujours tournée vers la caméra (billboard). Taille, forme,
 * contour et mode de recadrage du logo sont lus depuis
 * `getLogoConfig(project, isMobile)` — personnalisables par projet
 * dans projects.config.js, avec des valeurs par défaut sinon.
 *
 * `lang` : code de langue courant ("fr" par défaut). Le titre et la
 * date affichés (ainsi que l'objet transmis à onSelect) sont
 * localisés via `getLocalizedProject` — branche cette prop sur ton
 * state de langue global pour que la map suive le changement de
 * langue.
 *
 * `isMobile` : bascule les overrides `project.logo.mobile` (taille,
 * texte, ET zoom au clic) via getLogoConfig.
 *
 * Le panneau de texte (fond + halo + barre d'accent) s'ajuste à la
 * largeur RÉELLE du texte rendu (titre ou date, le plus large des
 * deux), mesurée via le callback `onSync` de troika
 * (textRenderInfo.blockBounds), plutôt qu'une largeur max fixe.
 *
 * Le bloc texte (panneau + halo + barre + titre + date) se cache en
 * fondu dès qu'un projet est actif — que ce soit un AUTRE projet
 * (isDimmed) ou CE projet lui-même (isActive, une fois zoomé son
 * titre/date font doublon avec le panneau UIOverlay). L'opacité du
 * texte est interpolée en continu via useFrame (comme le scale
 * hover/active), appliquée directement sur les matériaux/Text via
 * des refs pour rester fluide sans re-render React à chaque frame.
 *
 * Zoom au clic (logo.zoomed) : quand `isActive` devient vrai, tout le
 * CONTENU visuel de la carte (image + panneau + texte) est scalé et
 * décalé selon `logo.zoomed.{scale,offsetX,offsetY}` — ce bloc est
 * séparé du `groupRef` externe (qui gère la lévitation en position
 * monde) via un `contentRef` interne au Billboard, pour que le scale
 * et l'offset restent dans le plan de la carte (coordonnées locales
 * x/y face caméra) sans interférer avec la lévitation.
 */
export default function ProjectNode({ project, isActive, isDimmed, onSelect, lang = "fr", isMobile = false }) {
  const groupRef = useRef();
  const contentRef = useRef(); // scale + offset du zoom (logo.zoomed) s'appliquent ici
  const [hovered, setHovered] = useState(false);

  // Version localisée du projet (titre/date/tags/etc. traduits si dispo).
  // Les champs non textuels (image, theme, position, logo...) restent
  // identiques, donc on peut s'en servir partout sans rien casser.
  const localizedProject = useMemo(() => getLocalizedProject(project, lang), [project, lang]);

  const logo = useMemo(
    () => getLogoConfig(localizedProject, isMobile),
    [localizedProject, isMobile]
  );
  const containerAspect = logo.width / logo.height;

  const texture = useSafeTexture(resolveAsset(localizedProject.image), containerAspect, logo.fit);

  const mainGeometry = useMemo(
    () => createCardGeometry(logo.shape, logo.width, logo.height, logo.cornerRadius),
    [logo.shape, logo.width, logo.height, logo.cornerRadius]
  );

  const borderGeometry = useMemo(() => {
    if (!logo.border.enabled || logo.shape === "none") return null;
    const bw = logo.width + logo.border.thickness * 2;
    const bh = logo.height + logo.border.thickness * 2;
    // même rayon que l'image + l'épaisseur -> la bordure épouse exactement le contour
    return createCardGeometry(logo.shape, bw, bh, logo.cornerRadius + logo.border.thickness);
  }, [logo.shape, logo.width, logo.height, logo.border.enabled, logo.border.thickness, logo.cornerRadius]);

  const { titleSize, dateSize } = logo.text;

  // bordure prise en compte uniquement si elle est effectivement affichée
  const effectiveBorderThickness = logo.border.enabled ? logo.border.thickness : 0;

  const autoTitleY = -(logo.height / 2) - effectiveBorderThickness - logo.text.titleGap;
  const titleY = logo.text.titleOffsetY ?? autoTitleY;

  const autoDateY = titleY - logo.text.titleDateGap;
  const dateY = logo.text.dateOffsetY ?? autoDateY;

  // ------------------------------------------------------------
  // Habillage du bloc texte : barre d'accent + panneau vitré, pour
  // que le titre/date se lisent comme un vrai cartouche plutôt que
  // du texte flottant dans le vide. Désactivable par projet via
  // logo.text.dividerEnabled / panelEnabled.
  //
  // Largeur du bloc texte : mesurée dynamiquement à partir du texte
  // réellement rendu (titre / date), via onSync (troika). Plus de
  // maxWidth fixe imposée par la config — le panneau colle au
  // contenu. Tant que troika n'a pas encore fait son premier layout
  // (juste après le mount), on retombe brièvement sur une estimation
  // basée sur la taille du logo pour éviter un panneau à largeur nulle.
  // ------------------------------------------------------------
  const dividerEnabled = logo.text.dividerEnabled ?? true;
  const panelEnabled = logo.text.panelEnabled ?? true;
  const accentColor = logo.text.accentColor ?? project.theme?.accent ?? "#ffffff";

  const [titleWidth, setTitleWidth] = useState(0);
  const [dateWidth, setDateWidth] = useState(0);

  const fallbackTextWidth = Math.max(logo.width * 1.6, 1.9);
  const measuredTextWidth = Math.max(titleWidth, dateWidth);
  const textMaxWidth = measuredTextWidth > 0 ? measuredTextWidth : fallbackTextWidth;

  const panelPaddingX = 0.16;
  const panelPaddingTop = 0.08;
  const panelPaddingBottom = 0.09;
  const panelCornerRadius = 0.09;

  const panelTop = titleY + panelPaddingTop;
  const panelBottom = dateY - dateSize * 1.25 - panelPaddingBottom;
  const panelHeight = Math.max(panelTop - panelBottom, 0.01);
  const panelWidth = textMaxWidth + panelPaddingX * 2;
  const panelCenterY = (panelTop + panelBottom) / 2;

  const panelGeometry = useMemo(
    () =>
      panelEnabled
        ? new THREE.ShapeGeometry(createRoundedRectShape(panelWidth, panelHeight, panelCornerRadius), 8)
        : null,
    [panelEnabled, panelWidth, panelHeight]
  );

  // Halo subtil derrière le panneau, teinté accent — effet "carte
  // vitrée" plutôt qu'un simple rectangle plat.
  const glowGeometry = useMemo(
    () =>
      panelEnabled
        ? new THREE.ShapeGeometry(
            createRoundedRectShape(panelWidth + 0.06, panelHeight + 0.06, panelCornerRadius + 0.02),
            8
          )
        : null,
    [panelEnabled, panelWidth, panelHeight]
  );

  // Barre d'accent nette collée en haut du panneau, remplace l'ancien
  // trait flottant au-dessus du titre.
  const topBarWidth = panelWidth * 0.42;
  const topBarGeometry = useMemo(
    () => (dividerEnabled ? new THREE.PlaneGeometry(topBarWidth, 0.012) : null),
    [dividerEnabled, topBarWidth]
  );
  const topBarY = panelTop - 0.012;

  // Refs vers les matériaux/Text du bloc texte, pour piloter leur
  // opacité directement à chaque frame (pas de re-render React).
  const glowMatRef = useRef();
  const panelMatRef = useRef();
  const topBarMatRef = useRef();
  const titleTextRef = useRef();
  const dateTextRef = useRef();

  // Le bloc texte doit se cacher si un AUTRE projet est actif
  // (isDimmed) OU si CE projet est lui-même actif (isActive).
  const textHidden = isDimmed || isActive;

  // Opacité courante du bloc texte, interpolée en continu vers 0
  // (caché) ou 1 (visible). Stockée dans un ref pour éviter un
  // re-render à 60fps.
  const LEVITATION_AMPLITUDE = 0.06;
  const baseY = project.position[1];
  const textOpacityRef = useRef(textHidden ? 0 : 1);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    // petite lévitation, coût quasi nul (juste un sin par frame)
    groupRef.current.position.y =
      baseY + Math.sin(performance.now() * 0.0006 + project.position[0]) * LEVITATION_AMPLITUDE;

    // Scale + offset au clic : logo.zoomed (configurable par projet,
    // avec override mobile via project.logo.mobile.zoomed). Appliqué
    // sur contentRef (interne au Billboard) plutôt que groupRef, pour
    // rester en coordonnées locales face caméra et ne pas interférer
    // avec la lévitation du group externe.
    const targetScale = isActive ? logo.zoomed.scale : hovered ? 1.12 : 1;
    const targetOffsetX = isActive ? logo.zoomed.offsetX : 0;
    const targetOffsetY = isActive ? logo.zoomed.offsetY : 0;

    if (contentRef.current) {
      const s = contentRef.current.scale;
      s.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), Math.min(1, delta * 8));

      contentRef.current.position.x = THREE.MathUtils.lerp(
        contentRef.current.position.x,
        targetOffsetX,
        Math.min(1, delta * 8)
      );
      contentRef.current.position.y = THREE.MathUtils.lerp(
        contentRef.current.position.y,
        targetOffsetY,
        Math.min(1, delta * 8)
      );
    }

    // fade in/out du bloc texte (titre + date + panneau)
    const targetTextOpacity = textHidden ? 0 : 1;
    textOpacityRef.current = THREE.MathUtils.lerp(
      textOpacityRef.current,
      targetTextOpacity,
      Math.min(1, delta * 6)
    );
    const to = textOpacityRef.current;
    const visible = to > 0.01;

    if (glowMatRef.current) {
      glowMatRef.current.opacity = to * 0.18;
    }
    if (panelMatRef.current) {
      panelMatRef.current.opacity = to * 0.6;
    }
    if (topBarMatRef.current) {
      topBarMatRef.current.opacity = to * 0.9;
    }
    if (titleTextRef.current) {
      titleTextRef.current.fillOpacity = to;
      titleTextRef.current.visible = visible;
    }
    if (dateTextRef.current) {
      dateTextRef.current.fillOpacity = to;
      dateTextRef.current.visible = visible;
    }
  });

  const targetOpacity = isDimmed ? 0.15 : 1;

  return (
    <group
      ref={groupRef}
      position={project.position}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(localizedProject);
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
        <group ref={contentRef}>
          {borderGeometry && (
            <mesh geometry={borderGeometry} position={[0, 0, 0]}>
              <meshBasicMaterial
                color={logo.border.color ?? project.theme?.accent ?? "#ffffff"}
                transparent
                opacity={targetOpacity * (logo.border.opacity ?? 1)}
              />
            </mesh>
          )}

          <mesh key={texture ? "with-texture" : "placeholder"} geometry={mainGeometry} position={[0, 0, 0.01]}>
            <meshBasicMaterial
              map={texture ?? undefined}
              color={texture ? "#ffffff" : project.theme?.background ?? "#111214"}
              transparent
              opacity={targetOpacity}
              toneMapped={false}
            />
          </mesh>

          {glowGeometry && (
            <mesh geometry={glowGeometry} position={[0, panelCenterY, 0.013]}>
              <meshBasicMaterial
                ref={glowMatRef}
                color={accentColor}
                transparent
                opacity={textHidden ? 0 : 0.18}
                toneMapped={false}
              />
            </mesh>
          )}

          {panelGeometry && (
            <mesh geometry={panelGeometry} position={[0, panelCenterY, 0.015]}>
              <meshBasicMaterial
                ref={panelMatRef}
                color={project.theme?.background ?? "#0a0a0c"}
                transparent
                opacity={textHidden ? 0 : 0.6}
                toneMapped={false}
              />
            </mesh>
          )}

          {topBarGeometry && (
            <mesh geometry={topBarGeometry} position={[0, topBarY, 0.016]}>
              <meshBasicMaterial
                ref={topBarMatRef}
                color={accentColor}
                transparent
                opacity={textHidden ? 0 : 0.9}
                toneMapped={false}
              />
            </mesh>
          )}

          <Text
            ref={titleTextRef}
            position={[0, titleY, 0.02]}
            fontSize={titleSize}
            color="#eef0f4"
            anchorX="center"
            anchorY="top"
            letterSpacing={0.01}
            fillOpacity={textHidden ? 0 : 1}
            onSync={(mesh) => {
              const info = mesh.textRenderInfo;
              if (info?.blockBounds) {
                setTitleWidth(info.blockBounds[2] - info.blockBounds[0]);
              }
            }}
          >
            {localizedProject.title}
          </Text>
          <Text
            ref={dateTextRef}
            position={[0, dateY, 0.02]}
            fontSize={dateSize}
            color={accentColor}
            anchorX="center"
            anchorY="top"
            letterSpacing={0.08}
            fillOpacity={textHidden ? 0 : 1}
            onSync={(mesh) => {
              const info = mesh.textRenderInfo;
              if (info?.blockBounds) {
                setDateWidth(info.blockBounds[2] - info.blockBounds[0]);
              }
            }}
          >
            {(localizedProject.date ?? "").toUpperCase()}
          </Text>
        </group>
      </Billboard>
    </group>
  );
}
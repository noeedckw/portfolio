import { useMemo, useRef, useState, useCallback, useEffect } from "react";
import "./ProjectWheel.css";

/**
 * Roue de navigation "hublot". Toujours 3 lignes visibles
 * (prev/current/next), clippées dans le cadre. Bouclée.
 *
 * Navigation par clic / drag-to-spin / flèches / molette / clavier.
 *
 * Le drag distingue clic-vs-drag par un SEUIL DE MOUVEMENT plutôt que
 * par la cible du pointerdown (l'ancienne version bailait sur tout
 * <button>, ce qui excluait la quasi-totalité de la zone utile — le
 * row courant recouvre presque tout le viewport). Au pointerdown, on
 * note juste la position de départ, sans rien décider. Tant que le
 * déplacement cumulé reste sous DRAG_THRESHOLD, on ne touche à rien —
 * ça laisse le <button> sous le doigt recevoir un clic natif normal.
 * Dès que ça dépasse le seuil, c'est un vrai drag : on ouvre la roue
 * et on la fait tourner en live, 1:1 avec le mouvement du pointeur
 * (pas de calcul de vélocité). Le commit de la position pendant le
 * drag est throttlé à une fois par frame via requestAnimationFrame
 * (voir dragFrameRef/pendingDragYRef) : sur iOS/tactile, les events
 * pointermove peuvent arriver plus vite que l'écran ne peint, et
 * enchaîner les setState à ce rythme-là produit à la fois du lag et
 * un effet de "dédoublement" visuel. Au relâchement, si un drag a eu
 * lieu, on cale directement sur l'item le plus proche via settle() —
 * pas d'inertie/fling qui continuerait à faire tourner la roue toute
 * seule — puis on "avale" le clic fantôme qui suivrait sinon le
 * pointerup (via justDraggedRef), pour ne pas parasiter la sélection
 * avec un clic non voulu sur le bouton relâché.
 *
 * IMPORTANT — capture de pointeur différée : on ne pose
 * setPointerCapture qu'une fois le drag confirmé (seuil dépassé), et
 * jamais dès le pointerdown. La capturer immédiatement faisait que le
 * navigateur redirigeait aussi les événements souris de compatibilité
 * — dont le `click` qui suit un simple clic — vers l'élément capturé
 * (la racine), même quand aucun drag n'avait réellement eu lieu. Un
 * clic sur un row voisin arrivait donc avec e.target = la racine et
 * non le <button> du row, et tombait dans handleRootClick au lieu de
 * déclencher settle() sur ce row : impossible de cliquer sur
 * prev/next sur desktop. En ne capturant qu'après confirmation du
 * drag, un simple clic ne capture jamais rien et suit son cours
 * normal jusqu'au <button>.
 *
 * `settle()` reste l'UNIQUE point qui referme la roue (clickedOpen →
 * false) et sélectionne, que la navigation vienne d'un clic, d'une
 * flèche, de la molette, du clavier OU de la fin d'un drag — donc
 * aucun chemin ne peut laisser la roue "coincée" ouverte.
 *
 * Le clic extérieur est écouté en permanence (pas seulement quand isOpen)
 * et lit l'état via une ref, pour fermer le menu de façon fiable dans tous
 * les cas.
 *
 * Sur tactile (isTouch), les flèches prev/next sont carrément retirées
 * du DOM (pas juste cachées) : trop petites pour être tapées de façon
 * fiable. Un tap sur la roue (fermée) l'ouvre ; un tap sur un row
 * voisin sélectionne et referme ; un swipe vertical fait tourner la
 * roue (sans inertie, elle suit le doigt 1:1 puis se cale au lâcher).
 *
 * Props:
 * - projects: [{ id, title }]
 * - activeId: string | null   (null = vue "Map")
 * - onSelect: (id: string | null) => void
 * - mapLabel: string  (label affiché pour l'entrée "vue d'ensemble")
 */

const ITEM_HEIGHT = 34; // DOIT être identique à --pwheel-row-h dans le CSS
const VISIBLE_RANGE = 1; // toujours prev / current / next
const DRAG_THRESHOLD = 6; // px — en dessous, on considère que c'est un tap/clic
// Atténuation de l'opacité des rows voisins selon leur distance au
// centre (it.pos, qui peut monter jusqu'à ~1.5 en cours de
// transition). Plus cette valeur est basse, plus le texte reste
// visible longtemps en s'éloignant du centre.
const NEIGHBOR_FADE = 0.35;

export default function ProjectWheel({ projects, activeId, onSelect, mapLabel = "Map" }) {
  const items = useMemo(
    () => [{ id: null, title: mapLabel }, ...projects.map((p) => ({ id: p.id, title: p.title }))],
    [projects, mapLabel]
  );
  const n = items.length;

  // Détection tactile en JS plutôt qu'en pur CSS : plus fiable que
  // `(hover: none) and (pointer: coarse)` seul, qui se comporte de
  // façon incohérente selon les navigateurs/webviews mobiles.
  const [isTouch, setIsTouch] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(hover: none), (pointer: coarse)");
    const update = () => {
      setIsTouch(
        mq.matches || "ontouchstart" in window || navigator.maxTouchPoints > 0
      );
    };
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  const activeIndex = useMemo(() => {
    const idx = items.findIndex((it) => it.id === activeId);
    return idx === -1 ? 0 : idx;
  }, [items, activeId]);

  const [rotation, setRotation] = useState(activeIndex);
  const rotationRef = useRef(rotation);
  rotationRef.current = rotation;

  const isInteracting = useRef(false);
  useEffect(() => {
    if (isInteracting.current) return;
    setRotation((r) => nearestEquivalent(r, activeIndex, n));
  }, [activeIndex, n]);

  const [hovered, setHovered] = useState(false);
  const [clickedOpen, setClickedOpen] = useState(false);
  const [spinning, setSpinning] = useState(false);
  // Sur tactile, le premier tap déclenche souvent un `mouseenter`
  // synthétique sans `mouseleave` derrière (pas de curseur qui "s'en
  // va") — donc `hovered` resterait bloqué à true indéfiniment et la
  // roue ne se refermerait jamais. On ignore complètement `hovered`
  // quand isTouch : seuls clickedOpen/spinning (tous deux remis à
  // false par settle()) pilotent l'ouverture sur tactile.
  const isOpen = (isTouch ? false : hovered) || clickedOpen || spinning;
  const isOpenRef = useRef(isOpen);
  isOpenRef.current = isOpen;

  const rootRef = useRef(null);
  const rafRef = useRef(null);
  const dragRef = useRef(null); // { pointerId, startY, startRotation, moved }
  // Throttle des pointermove : sur iOS/tactile, ces events peuvent
  // arriver bien plus souvent que l'écran ne peut peindre (jusqu'à
  // 120Hz sur ProMotion). Sans throttle, on empile des setState plus
  // vite que React ne peut rendre, ce qui produit du lag ET un effet
  // de "dédoublement" (les rows n'arrivent jamais à rattraper leur
  // position cible). On ne garde que la DERNIÈRE position connue et on
  // ne commit qu'une fois par frame via rAF.
  const dragFrameRef = useRef(null);
  const pendingDragYRef = useRef(null);
  // Vrai brièvement après la fin d'un drag réel : sert à avaler le
  // clic fantôme que le navigateur déclenche après un pointerup, pour
  // qu'il ne vienne pas parasiter la sélection gérée par settle().
  const justDraggedRef = useRef(false);

  const stopMomentum = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  // Unique point d'animation + de fermeture. Toute navigation (clic,
  // flèche, molette, clavier, fin de drag) passe par ici. C'est aussi
  // le SEUL endroit qui referme la roue (clickedOpen → false) une fois
  // la cible atteinte — plus de risque de roue coincée ouverte.
  const settle = useCallback(
    (finalRotation) => {
      const target = Math.round(finalRotation);
      let current = finalRotation;
      const step = () => {
        const diff = target - current;
        if (Math.abs(diff) < 0.001) {
          setRotation(target);
          isInteracting.current = false;
          setSpinning(false);
          setClickedOpen(false);
          onSelect(items[((target % n) + n) % n].id);
          rafRef.current = null;
          return;
        }
        current += diff * 0.25;
        setRotation(current);
        rafRef.current = requestAnimationFrame(step);
      };
      isInteracting.current = true;
      setSpinning(true);
      stopMomentum();
      rafRef.current = requestAnimationFrame(step);
    },
    [items, n, onSelect, stopMomentum]
  );

  const forceClose = useCallback(() => {
    stopMomentum();
    isInteracting.current = false;
    setSpinning(false);
    setClickedOpen(false);
    const nearest = Math.round(rotationRef.current);
    setRotation(nearest);
    onSelect(items[((nearest % n) + n) % n].id);
  }, [stopMomentum, items, n, onSelect]);

  // --- Drag-to-spin via Pointer Events, avec détection clic-vs-drag
  // par seuil de mouvement (voir commentaire en tête de fichier). On
  // exclut seulement la zone des flèches (.pwheel__rail), qui garde
  // un clic simple prev/next. Pas d'inertie : la roue suit le doigt
  // 1:1 pendant le drag, et se cale directement sur l'item le plus
  // proche au relâchement.
  //
  // setPointerCapture n'est PAS posée ici : voir le commentaire en
  // tête de fichier sur pourquoi la capture doit être différée
  // jusqu'à la confirmation du drag (fix du clic bloqué sur desktop).
  // ---
  const handlePointerDown = useCallback((e) => {
    if (e.target.closest(".pwheel__rail")) return;

    dragRef.current = {
      pointerId: e.pointerId,
      startY: e.clientY,
      startRotation: rotationRef.current,
      moved: false,
    };
    stopMomentum();
  }, [stopMomentum]);

  const handlePointerMove = useCallback((e) => {
    if (!dragRef.current) return;
    // On stocke juste la dernière position connue. Le vrai travail
    // (lecture + setState) est différé dans un rAF, planifié au plus
    // une fois par frame — voir commentaire sur dragFrameRef.
    pendingDragYRef.current = e.clientY;
    if (dragFrameRef.current) return; // un commit est déjà planifié pour cette frame

    dragFrameRef.current = requestAnimationFrame(() => {
      dragFrameRef.current = null;
      if (!dragRef.current) return; // drag terminé entre-temps

      const y = pendingDragYRef.current;
      const dyTotal = y - dragRef.current.startY;

      if (!dragRef.current.moved) {
        if (Math.abs(dyTotal) < DRAG_THRESHOLD) return; // encore sous le seuil, peut-être un simple tap
        dragRef.current.moved = true;
        isInteracting.current = true;
        setSpinning(true); // ouvre la roue dès que le drag est confirmé

        // Drag confirmé : on ne capture le pointeur QUE maintenant,
        // jamais au pointerdown (voir commentaire en tête de fichier).
        try {
          rootRef.current?.setPointerCapture(dragRef.current.pointerId);
        } catch {
          // no-op — peut échouer si le pointeur n'est déjà plus actif
        }
      }

      setRotation(dragRef.current.startRotation - dyTotal / ITEM_HEIGHT);
    });
  }, []);

  const handlePointerUp = useCallback((e) => {
    if (!dragRef.current) return;

    // Annule un éventuel commit de position encore planifié pour la
    // prochaine frame : sinon il pourrait s'exécuter après coup, une
    // fois dragRef déjà nettoyé plus bas, et tenter de lire une
    // position obsolète.
    if (dragFrameRef.current) {
      cancelAnimationFrame(dragFrameRef.current);
      dragFrameRef.current = null;
    }

    const wasDrag = dragRef.current.moved;
    dragRef.current = null;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // no-op si déjà relâché, ou si la capture n'a jamais été posée
      // (cas du simple clic, désormais le cas le plus fréquent)
    }

    if (!wasDrag) return; // simple tap/clic : on laisse le onClick natif du bouton gérer ça

    // vrai drag : on avale le clic fantôme qui suivrait ce pointerup
    justDraggedRef.current = true;
    requestAnimationFrame(() => {
      justDraggedRef.current = false;
    });

    // pas d'inertie : on cale directement sur l'item le plus proche
    settle(rotationRef.current);
  }, [settle]);

  // --- Molette : un cran = un item, pas de vélocité/inertie. On
  // ignore les événements wheel supplémentaires tant qu'une animation
  // est en cours (rafRef.current non nul), pour éviter qu'un scroll
  // de trackpad (qui envoie plein de petits deltaY) fasse défiler
  // plusieurs items d'un coup de façon imprévisible. ---
  const handleWheel = useCallback(
    (e) => {
      e.preventDefault();
      if (rafRef.current) return;
      settle(Math.round(rotationRef.current) + (e.deltaY > 0 ? 1 : -1));
    },
    [settle]
  );

  // --- Flèches (desktop uniquement, voir isTouch) ---
  const goPrev = useCallback((e) => {
    e.stopPropagation();
    if (justDraggedRef.current) return;
    settle(Math.round(rotationRef.current) - 1);
  }, [settle]);

  const goNext = useCallback((e) => {
    e.stopPropagation();
    if (justDraggedRef.current) return;
    settle(Math.round(rotationRef.current) + 1);
  }, [settle]);

  // clavier
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === "ArrowDown") settle(Math.round(rotationRef.current) + 1);
      if (e.key === "ArrowUp") settle(Math.round(rotationRef.current) - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, settle]);

  // Clic sur le fond du composant (pas sur un bouton — les boutons
  // stoppent déjà la propagation dans leur propre onClick) : ouvre la
  // roue. Sert surtout au tactile, qui n'a pas de hover pour révéler
  // prev/next.
  const handleRootClick = useCallback((e) => {
    if (justDraggedRef.current) return; // clic fantôme après un drag, on ignore
    if (e.target.closest("button")) return;
    setClickedOpen((v) => !v);
  }, []);

  // clic extérieur : listener TOUJOURS actif (monté une seule fois), lit
  // isOpenRef à l'instant du clic — évite tout souci de timing d'attach/detach
  useEffect(() => {
    const onDocPointerDown = (e) => {
      if (!isOpenRef.current) return;
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        forceClose();
      }
    };
    document.addEventListener("pointerdown", onDocPointerDown);
    return () => document.removeEventListener("pointerdown", onDocPointerDown);
  }, [forceClose]);

  useEffect(() => stopMomentum, [stopMomentum]);
  useEffect(() => () => {
    if (dragFrameRef.current) cancelAnimationFrame(dragFrameRef.current);
  }, []);

  const visibleItems = [];
  const base = Math.round(rotation);
  for (let offset = -VISIBLE_RANGE; offset <= VISIBLE_RANGE; offset++) {
    const idx = ((base + offset) % n + n) % n;
    visibleItems.push({
      ...items[idx],
      key: `${base + offset}`,
      pos: base + offset - rotation,
    });
  }

  return (
    <div
      ref={rootRef}
      className={`pwheel ${isOpen ? "pwheel--open" : ""} ${isTouch ? "pwheel--touch" : ""} ${spinning ? "pwheel--spinning" : ""}`}
      onMouseEnter={isTouch ? undefined : () => setHovered(true)}
      onMouseLeave={isTouch ? undefined : () => setHovered(false)}
      onClick={handleRootClick}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onWheel={handleWheel}
      role="listbox"
      aria-label="Navigation des projets"
      tabIndex={0}
    >
      <div className="pwheel__index">
        {String(((Math.round(rotation) % n) + n) % n).padStart(2, "0")}
      </div>

      <div className="pwheel__viewport">
        {visibleItems.map((it) => {
          const isCurrent = Math.abs(it.pos) < 0.05;
          return (
            <button
              key={it.key}
              type="button"
              className={`pwheel__row ${isCurrent ? "pwheel__row--current" : ""}`}
              style={{
                "--ty": `${it.pos * ITEM_HEIGHT}px`,
                "--sc": 1 - Math.abs(it.pos) * 0.14,
                opacity: isOpen ? Math.max(0, 1 - Math.abs(it.pos) * NEIGHBOR_FADE) : (isCurrent ? 1 : 0),
                zIndex: isCurrent ? 2 : 1,
                pointerEvents: isCurrent || isOpen ? "auto" : "none",
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (justDraggedRef.current) return; // clic fantôme après un drag, on ignore
                if (isCurrent) {
                  if (isOpen) {
                    // déjà sélectionné, on referme juste
                    setClickedOpen(false);
                  } else {
                    // fermé : un tap/clic sur le seul row visible ouvre la roue
                    setClickedOpen(true);
                  }
                } else {
                  settle(Math.round(rotation + it.pos));
                }
              }}
            >
              {it.title}
            </button>
          );
        })}
      </div>

      {/* Flèches retirées du DOM sur tactile : trop petites pour être
          tapées de façon fiable, et redondantes avec le tap-pour-ouvrir. */}
      {!isTouch && (
        <div className="pwheel__rail">
          <button
            type="button"
            className="pwheel__chevron-btn"
            aria-label="Projet précédent"
            onClick={goPrev}
            tabIndex={isOpen ? 0 : -1}
          >
            <span className="pwheel__chevron pwheel__chevron--up" />
          </button>
          <button
            type="button"
            className="pwheel__chevron-btn"
            aria-label="Projet suivant"
            onClick={goNext}
            tabIndex={isOpen ? 0 : -1}
          >
            <span className="pwheel__chevron pwheel__chevron--down" />
          </button>
        </div>
      )}
    </div>
  );
}

function nearestEquivalent(current, targetIndex, n) {
  const base = Math.round(current / n) * n;
  let best = base + targetIndex;
  let bestDist = Math.abs(best - current);
  for (const cand of [base + targetIndex - n, base + targetIndex + n]) {
    const dist = Math.abs(cand - current);
    if (dist < bestDist) {
      best = cand;
      bestDist = dist;
    }
  }
  return best;
}
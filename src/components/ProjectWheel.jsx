import { useMemo, useRef, useState, useCallback, useEffect } from "react";
import "./ProjectWheel.css";

/**
 * Roue de navigation "hublot". Drag/molette avec inertie (spin + ralentissement
 * progressif + snap sur l'item le plus proche), flèches, clavier. Toujours 3
 * lignes visibles (prev/current/next), clippées dans le cadre. Bouclée.
 *
 * Le drag utilise setPointerCapture : l'élément continue de recevoir
 * pointermove/pointerup même si le curseur sort de la zone en cours de
 * mouvement — indispensable vu la petite taille du composant, sinon un
 * relâchement hors zone laisse le drag "coincé" en état ouvert.
 *
 * Le clic extérieur est écouté en permanence (pas seulement quand isOpen)
 * et lit l'état via une ref, pour fermer le menu de façon fiable dans tous
 * les cas, y compris juste après un spin qui vient de se stabiliser.
 *
 * Props:
 * - projects: [{ id, title }]
 * - activeId: string | null   (null = vue "Map")
 * - onSelect: (id: string | null) => void
 * - mapLabel: string  (label affiché pour l'entrée "vue d'ensemble")
 */

const ITEM_HEIGHT = 34; // DOIT être identique à --pwheel-row-h dans le CSS
const FRICTION = 0.94;
const MIN_VELOCITY = 0.01;
const VISIBLE_RANGE = 1; // toujours prev / current / next

export default function ProjectWheel({ projects, activeId, onSelect, mapLabel = "Map" }) {
  const items = useMemo(
    () => [{ id: null, title: mapLabel }, ...projects.map((p) => ({ id: p.id, title: p.title }))],
    [projects, mapLabel]
  );
  const n = items.length;

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
  const isOpen = hovered || clickedOpen || spinning;
  const isOpenRef = useRef(isOpen);
  isOpenRef.current = isOpen;

  const rootRef = useRef(null);
  const rafRef = useRef(null);
  const velocityRef = useRef(0);
  const dragRef = useRef(null); // { startY, startRotation, lastY, lastT, moved }

  const stopMomentum = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

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
          onSelect(items[((target % n) + n) % n].id);
          rafRef.current = null;
          return;
        }
        current += diff * 0.25;
        setRotation(current);
        rafRef.current = requestAnimationFrame(step);
      };
      rafRef.current = requestAnimationFrame(step);
    },
    [items, n, onSelect]
  );

  const runMomentum = useCallback(() => {
    const step = () => {
      velocityRef.current *= FRICTION;
      if (Math.abs(velocityRef.current) < MIN_VELOCITY) {
        settle(rotationRef.current);
        return;
      }
      setRotation((r) => r + velocityRef.current);
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
  }, [settle]);

  const forceClose = useCallback(() => {
    stopMomentum();
    isInteracting.current = false;
    setSpinning(false);
    setClickedOpen(false);
    const nearest = Math.round(rotationRef.current);
    setRotation(nearest);
    onSelect(items[((nearest % n) + n) % n].id);
  }, [stopMomentum, items, n, onSelect]);

  // --- Drag via Pointer Events + capture : robuste même si le pointeur
  // sort de la zone du composant pendant le mouvement ---
  const handlePointerDown = useCallback((e) => {
    isInteracting.current = true;
    setSpinning(true);
    stopMomentum();
    velocityRef.current = 0;
    dragRef.current = {
      startY: e.clientY,
      startRotation: rotationRef.current,
      lastY: e.clientY,
      lastT: performance.now(),
    };
    setClickedOpen(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  }, [stopMomentum]);

  const handlePointerMove = useCallback((e) => {
    if (!dragRef.current) return;
    const y = e.clientY;
    const now = performance.now();
    const { startY, startRotation, lastY, lastT } = dragRef.current;

    const deltaItems = (y - startY) / ITEM_HEIGHT;
    setRotation(startRotation - deltaItems);

    const dt = Math.max(now - lastT, 1);
    velocityRef.current = -((y - lastY) / ITEM_HEIGHT) / (dt / 16);
    dragRef.current.lastY = y;
    dragRef.current.lastT = now;
  }, []);

  const handlePointerUp = useCallback((e) => {
    if (!dragRef.current) return;
    dragRef.current = null;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // no-op si déjà relâché
    }
    if (Math.abs(velocityRef.current) > MIN_VELOCITY) {
      runMomentum();
    } else {
      settle(rotationRef.current);
    }
  }, [runMomentum, settle]);

  // --- Molette ---
  const handleWheel = useCallback(
    (e) => {
      e.preventDefault();
      isInteracting.current = true;
      setSpinning(true);
      stopMomentum();
      velocityRef.current += (e.deltaY > 0 ? 1 : -1) * 0.12;
      runMomentum();
    },
    [runMomentum, stopMomentum]
  );

  // --- Flèches ---
  const goPrev = useCallback((e) => {
    e.stopPropagation();
    isInteracting.current = true;
    stopMomentum();
    settle(Math.round(rotationRef.current) - 1);
  }, [settle, stopMomentum]);

  const goNext = useCallback((e) => {
    e.stopPropagation();
    isInteracting.current = true;
    stopMomentum();
    settle(Math.round(rotationRef.current) + 1);
  }, [settle, stopMomentum]);

  // clavier
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === "ArrowDown") {
        isInteracting.current = true;
        stopMomentum();
        settle(Math.round(rotationRef.current) + 1);
      }
      if (e.key === "ArrowUp") {
        isInteracting.current = true;
        stopMomentum();
        settle(Math.round(rotationRef.current) - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, settle, stopMomentum]);

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
      className={`pwheel ${isOpen ? "pwheel--open" : ""}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
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
                transform: `translateY(${it.pos * ITEM_HEIGHT}px) rotateX(${it.pos * -28}deg) scale(${1 - Math.abs(it.pos) * 0.14})`,
                opacity: isOpen ? Math.max(0, 1 - Math.abs(it.pos) * 0.6) : (isCurrent ? 1 : 0),
                zIndex: isCurrent ? 2 : 1,
                pointerEvents: isCurrent || isOpen ? "auto" : "none",
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (isCurrent) {
                  onSelect(it.id);
                } else {
                  isInteracting.current = true;
                  stopMomentum();
                  settle(Math.round(rotation + it.pos));
                }
              }}
            >
              {it.title}
            </button>
          );
        })}
      </div>

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
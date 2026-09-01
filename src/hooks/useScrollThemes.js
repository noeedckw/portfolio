import { useEffect, useRef, useState } from "react";

/**
 * Suit le scroll de la page et calcule, en continu :
 * - activeIndex : l'index de la section actuellement "dominante"
 * - progress    : 0 → 1, la progression du fondu vers la section suivante
 *
 * Le fond (ThemeBackground) utilise ces deux valeurs pour superposer
 * le thème courant et le thème suivant avec une opacité qui suit
 * `progress` de façon continue et linéaire : pas de coupure nette,
 * juste un dégradé qui avance en même temps que le scroll.
 *
 * `count` = nombre total de sections (hero inclus).
 * Retourne aussi `register(index)` : un callback ref à poser sur
 * chaque section pour qu'on puisse mesurer sa position réelle.
 */
export function useScrollThemes(count) {
  const [state, setState] = useState({ activeIndex: 0, progress: 0 });
  const nodesRef = useRef(new Array(count).fill(null));
  const rafRef = useRef(null);

  function register(index) {
    return (node) => {
      nodesRef.current[index] = node;
    };
  }

  useEffect(() => {
    function measure() {
      const nodes = nodesRef.current;
      const starts = nodes.map((n) => (n ? n.offsetTop : 0));
      const heights = nodes.map((n) => (n ? n.offsetHeight : 0));

      const scrollCenter = window.scrollY + window.innerHeight / 2;

      let idx = 0;
      for (let i = 0; i < starts.length; i++) {
        if (scrollCenter >= starts[i]) idx = i;
      }

      const start = starts[idx] ?? 0;
      const height = heights[idx] || 1;
      let progress = (scrollCenter - start) / height;
      progress = Math.min(1, Math.max(0, progress));

      // Pas de section suivante -> pas de fondu au-delà.
      if (idx >= count - 1) progress = 0;

      setState((prev) =>
        prev.activeIndex === idx && Math.abs(prev.progress - progress) < 0.002
          ? prev
          : { activeIndex: idx, progress }
      );
    }

    function onScroll() {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        measure();
      });
    }

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [count]);

  return { ...state, register };
}
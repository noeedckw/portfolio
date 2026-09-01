import { useEffect, useRef, useState } from "react";

/**
 * Retourne un ref à poser sur un élément + un booléen `isVisible`
 * qui passe à true dès que l'élément entre dans le viewport.
 * Sert à faire apparaître le contenu de chaque section en douceur
 * (fade + léger déplacement) plutôt que tout afficher d'un coup.
 */
export function useReveal(threshold = 0.25) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, isVisible];
}
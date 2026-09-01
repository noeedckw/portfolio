import { useMemo } from "react";
import { Line } from "@react-three/drei";

/**
 * Relie chaque projet au suivant avec un tracé orthogonal
 * ("cubique"), un axe à la fois — comme des pistes de circuit
 * imprimé plutôt qu'une diagonale directe :
 *
 *   1. segment sur X   (gauche/droite, à hauteur et profondeur constantes)
 *   2. segment sur Z   (profondeur, à hauteur constante — invisible de face)
 *   3. segment sur Y   (descente vers le projet suivant)
 *
 * Cette décomposition est ce qui permet à la profondeur de rester
 * cachée quand on regarde la timeline de face (le segment Z s'écrase
 * en un point puisque la caméra regarde le long de l'axe Z), et de
 * se révéler uniquement quand on fait tourner la caméra.
 */
export default function TimelineLinks({ projects, activeProject }) {
  const segments = useMemo(() => {
    const segs = [];

    for (let i = 0; i < projects.length - 1; i++) {
      const a = projects[i];
      const b = projects[i + 1];
      const [ax, ay, az] = a.position;
      const [bx, , bz] = b.position;

      const corner1 = [bx, ay, az]; // déplacement sur X uniquement
      const corner2 = [bx, ay, bz]; // déplacement sur Z uniquement (caché de face)
      // le point final [bx, by, bz] = b.position, atteint via déplacement sur Y

      segs.push({
        key: `${a.id}-${b.id}`,
        points: [a.position, corner1, corner2, b.position],
        color: a.theme?.accent ?? "#ffffff",
        from: a.id,
        to: b.id,
      });
    }

    return segs;
  }, [projects]);

  return (
    <>
      {segments.map((seg) => {
        const isDimmed =
          Boolean(activeProject) &&
          activeProject.id !== seg.from &&
          activeProject.id !== seg.to;

        return (
          <Line
            key={seg.key}
            points={seg.points}
            color={seg.color}
            lineWidth={1.5}
            transparent
            opacity={isDimmed ? 0.12 : 0.55}
          />
        );
      })}
    </>
  );
}
/**
 * ============================================================
 * LAYOUT AUTOMATIQUE DE LA MAP — TIMELINE 3D EN "S" CUBIQUE
 * ============================================================
 * Calcule une position 3D pour chaque projet qui n'a pas de
 * `position` défini manuellement dans projects.config.js.
 *
 * Principe : les projets sont déjà triés par ordre chronologique
 * en entrée. Le premier projet est le plus haut (startY), puis
 * chaque projet suivant descend de spacingY. Sur X, les projets
 * alternent droite/gauche pour dessiner un zigzag en angles droits
 * (façon "S en marches"). Sur Z, ils alternent aussi (avant/arrière)
 * — mais cette profondeur ne se voit pas de face : de face, la
 * timeline a l'air d'un simple zigzag 2D. C'est TimelineLinks qui
 * révèle la profondeur uniquement quand on tourne la caméra, via
 * des liens orthogonaux (un axe à la fois, jamais en diagonale
 * directe).
 * ============================================================
 */

export function computeLayout(
  projects,
  {
    startY = 1.5,          // hauteur du tout premier projet (le plus haut)
    spacingY = 2.4,         // distance verticale entre deux projets
    xAmplitude = 1.8,       // amplitude du zigzag sur l'axe X (gauche/droite)
    depthAmplitude = 1.4,   // amplitude sur l'axe Z (profondeur, cachée de face)
    zPeriod = 1,            // tous les combien de projets le Z change de sens (1 = à chaque projet, 2 = un projet sur deux, etc.)
  } = {}
) {
  return projects.map((project, i) => {
    if (project.position) {
      return { ...project, position: project.position };
    }

    const y = startY - i * spacingY;
    const x = i % 2 === 0 ? xAmplitude : -xAmplitude;
    const z = Math.floor(i / zPeriod) % 2 === 0 ? depthAmplitude : -depthAmplitude;

    return { ...project, position: [x, y, z] };
  });
}
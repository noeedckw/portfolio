/**
 * ============================================================
 * LAYOUT AUTOMATIQUE DE LA MAP — TIMELINE 3D EN "S"
 * ============================================================
 * Calcule une position 3D pour chaque projet qui n'a pas de
 * `position` défini manuellement dans projects.config.js.
 *
 * Principe : de face (X/Y), la timeline se lit comme UN grand S
 * continu — pas un zigzag en dents de scie. X suit une sinusoïde
 * de basse fréquence (un cycle complet sur toute la hauteur de la
 * timeline), qui donne naturellement l'inflexion caractéristique
 * du S : ça part vers un côté, ça infléchit au milieu, ça repart
 * de l'autre côté.
 *
 * Par-dessus cette grande courbe, une ondulation secondaire plus
 * rapide et nettement plus discrète (xJitter, ~10% de l'amplitude
 * principale) évite l'effet "sinusoïde de manuel de maths" trop
 * parfaite, sans jamais casser la lisibilité du S.
 *
 * Z (profondeur) ne se voit pas de face — c'est lui qui porte
 * toute la variété "cachée" révélée seulement quand on tourne la
 * caméra. Il suit sa propre fréquence et son propre déphasage,
 * décorrélés de X, pour ne jamais créer de motif prévisible entre
 * X et Z même en tournant.
 *
 * computeBounds() calcule l'étendue totale du layout — à utiliser
 * pour cadrer la caméra de façon à voir tous les projets au
 * démarrage (voir setup caméra).
 * ============================================================
 */

export function computeLayout(
  projects,
  {
    startY = 3.5,             // hauteur du tout premier projet (le plus haut)
    spacingY = 2.4,            // distance verticale entre deux projets

    // --- Le grand S ---
    xAmplitude = 6.2,          // amplitude franche pour que le S se voie bien
    xCycles = 1,               // 1 cycle complet = un seul S propre sur toute la timeline
                               // (1.5 ou 2 si tu veux qu'il reparte une 2e fois sur une longue liste)

    // --- Grain organique, discret, pour ne pas casser le S ---
    xJitterAmplitude = 0.55,   // nettement plus petit que xAmplitude (≈10%)
    xJitterPeriod = 3.3,       // période courte, non entière exprès pour éviter tout repeat régulier
    xJitterPhase = 0.6,        // déphasage pour désynchroniser l'ondulation du grand S

    // --- Profondeur (Z), cachée de face, révélée en tournant ---
    depthAmplitude = 2.6,      // amplitude de base sur l'axe Z
    depthCycles = 1.6,         // fréquence différente de xCycles pour décorréler la profondeur du S vu de face
    depthPhase = 2.1,          // déphasage propre à Z
    depthVariation = [0.5, 1.6, 0.8, 2.0, 1.1, 0.35, 1.85], // variation ponctuelle par projet
  } = {}
) {
  const n = projects.length;

  return projects.map((project, i) => {
    if (project.position) {
      return { ...project, position: project.position };
    }

    const y = startY - i * spacingY;

    // Le tout premier projet reste centré en haut : point d'entrée visuel,
    // ne doit pas se fondre dans la courbe.
    if (i === 0) {
      return { ...project, position: [0, y, 0] };
    }

    // Progression normalisée le long de la timeline (0 → 1)
    const t = n > 1 ? i / (n - 1) : 0;

    // Grand S : sinusoïde basse fréquence sur toute la hauteur
    const xMain = xAmplitude * Math.sin(2 * Math.PI * xCycles * t);

    // Ondulation organique superposée, fréquence non entière pour
    // ne jamais retomber en phase avec le grand S
    const xJitter =
      xJitterAmplitude * Math.sin(2 * Math.PI * i / xJitterPeriod + xJitterPhase);

    const x = xMain + xJitter;

    // Profondeur : fréquence et phase différentes de X, + variation
    // ponctuelle par projet, richesse qui ne se lit qu'en tournant la caméra
    const zWave =
      depthAmplitude * Math.sin(2 * Math.PI * depthCycles * t + depthPhase);
    const zVariation = depthVariation[i % depthVariation.length];
    const z = zWave * (0.6 + 0.4 * zVariation);

    return { ...project, position: [x, y, z] };
  });
}

/**
 * Calcule l'étendue (bounding box) d'un layout déjà positionné.
 * Sert à cadrer la caméra pour que tous les projets soient visibles
 * au démarrage, quel que soit le nombre de projets ou l'amplitude
 * du S généré.
 */
export function computeBounds(positionedProjects) {
  const xs = positionedProjects.map((p) => p.position[0]);
  const ys = positionedProjects.map((p) => p.position[1]);
  const zs = positionedProjects.map((p) => p.position[2]);

  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const minZ = Math.min(...zs), maxZ = Math.max(...zs);

  return {
    minX, maxX, minY, maxY, minZ, maxZ,
    width: maxX - minX,
    height: maxY - minY,
    depth: maxZ - minZ,
    center: [(minX + maxX) / 2, (minY + maxY) / 2, (minZ + maxZ) / 2],
  };
}
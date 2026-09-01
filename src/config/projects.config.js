/**
 * ============================================================
 * CONFIG DES PROJETS — pilote toute la map 3D
 * ============================================================
 * Chaque objet = un point sur la map globale.
 *
 * CHAMPS OBLIGATOIRES : id, title, date, image
 * TOUT LE RESTE EST OPTIONNEL.
 *
 * `position` : optionnel. Si tu ne le mets pas, le layout est
 * calculé automatiquement (spirale équilibrée) — voir
 * src/config/layout.js. Mets-le seulement si tu veux placer un
 * projet précisément (ex: le mettre au centre, ou l'écarter des
 * autres).
 *
 * `theme` : c'est ce qui change quand on zoome sur le projet —
 * couleur de fond, couleur d'accent, style de particules. Chaque
 * projet peut avoir un thème totalement différent.
 *
 * `category` : "presentation" | "professional" | "personal"
 * Sert à filtrer/styliser différemment la carte "à propos" des
 * vraies cartes projets si besoin dans l'UI.
 *
 * `techStack` : objet catégorisé { languages, frameworks, tools }
 * plutôt qu'un tableau plat, pour un affichage plus propre par
 * projet (chaque projet peut choisir quelles catégories montrer).
 * ============================================================
 */

export const projects = [
  // ----------------------------------------------------------
  // 0. PRÉSENTATION — carte "à propos de moi", en premier
  // ----------------------------------------------------------
  {
    id: "presentation",
    title: "Noé Pereira",
    date: "Parcours",
    category: "presentation",

    shortDescription: "Développeur en formation — Epitech Lyon, promotion Grande École.",
    longDescription:
      "Étudiant en 4e année à Epitech Lyon (Programme Grande École), actuellement en cursus international à Soongsil University à Séoul. Je me prépare à effectuer mon stage de fin d'études. J'apprécie particulièrement la résolution de problèmes et je cherche à renforcer mes compétences techniques en contribuant à des projets concrets au sein d'une équipe ambitieuse.",

    image: "/assets/projects/presentation/cover.jpg",

    year: 2026,
    role: "Étudiant — Epitech Lyon (Grande École)",

    // Infos de parcours / contact, propres à la carte présentation
    profile: {
      school: "Epitech Lyon — Programme Grande École",
      exchange: "Soongsil University, Séoul (échange international)",
      email: "noe.pereira@epitech.eu",
      phone: "06 14 64 50 58",
      linkedin: "Noé Pereira",
      languages: [{ name: "Anglais", level: "C1" }],
      interests: ["Cinéma", "Basketball", "Musique"],
      availability: [
        {
          label: "Part-time (stage à temps partiel)",
          period: "14/09/2026 - 26/02/2027",
          detail: "3 jours par semaine, du lundi au mercredi",
        },
        {
          label: "Stage de fin d'études",
          period: "01/03/2027 - 31/08/2027",
          detail: "6 mois",
        },
      ],
    },

    tags: ["À propos", "Étudiant", "Epitech"],
    techStack: {
      languages: ["Java", "JavaScript", "C", "C++", "Haskell", "Python"],
      frameworks: ["React", "React Native", "Angular", "Node.js", "FastAPI", "JUCE"],
      tools: ["Docker", "Ansible", "OAuth2", "REST", "Expo", "EAS"],
    },

    links: {
      live: null,
      github: null,
      caseStudy: null,
      linkedin: "https://www.linkedin.com/in/noe-pereira",
      email: "mailto:noe.pereira@epitech.eu",
    },

    // Placée au centre de la spirale : c'est le point d'entrée.
    position: [0, 0, 0],

    theme: {
      background: "#0b0b0f",
      backgroundAccent: "#1c1c26",
      accent: "#c9a15b", // clin d'œil au liseré doré du site MCV
      particles: "drift",
    },

    featured: true,
  },

  // ----------------------------------------------------------
  // 1. NOSCO — 09/2023 - 12/2023
  // ----------------------------------------------------------
  {
    id: "nosco",
    title: "Nosco",
    date: "Sept. - Déc. 2023",
    category: "professional",

    shortDescription: "Développeur Full Stack — tests, optimisation et fiabilité produit.",
    longDescription:
      "Stage développeur full stack chez Nosco. Mise en place de tests unitaires, d'intégration et système pour garantir la qualité et la fiabilité du produit, identification et résolution de problèmes de performance, et reporting structuré des anomalies en lien étroit avec l'équipe.",

    image: "/assets/projects/nosco/cover.jpg",

    year: 2023,
    role: "Développeur Full Stack",
    tags: ["Stage", "Full Stack", "QA / Tests"],

    techStack: {
      languages: ["JavaScript"],
      frameworks: ["React", "Node.js"],
      tools: ["Tests unitaires", "Tests d'intégration", "Tests système"],
    },

    links: {
      live: null,
      github: null,
      caseStudy: null,
    },

    theme: {
      background: "#0d1b2a",
      backgroundAccent: "#1c3a5e",
      accent: "#7cc4ff",
      particles: "grid",
    },

    featured: false,
  },

  // ----------------------------------------------------------
  // 2. AETHER ENGINE — 10/2024 - 02/2025
  // ----------------------------------------------------------
  {
    id: "aether-engine",
    title: "Aether Engine",
    date: "Oct. 2024 - Fév. 2025",
    category: "professional",

    shortDescription: "Lead Cybersécurité, pôle Red Team — pentests et automatisation.",
    longDescription:
      "Responsable de la stratégie et des opérations du pôle cybersécurité (Red Team) : identification et exploitation de vulnérabilités, contournement de CAPTCHA et automatisation de collectes de données, analyse des failles et renforcement de la sécurité globale du système.",

    image: "/assets/projects/aether-engine/cover.jpg",

    year: 2025,
    role: "Lead Cybersécurité — Red Team",
    tags: ["Cybersécurité", "Red Team", "Pentest", "Automatisation"],

    techStack: {
      languages: ["Python"],
      frameworks: [],
      tools: ["Pentesting", "Scraping", "Bypass CAPTCHA"],
    },

    links: {
      live: null,
      github: null,
      caseStudy: null,
    },

    theme: {
      background: "#150d1a",
      backgroundAccent: "#341c3d",
      accent: "#c25cff",
      particles: "grid",
    },

    featured: true,
  },

  // ----------------------------------------------------------
  // 3. HARMONIA — 03/2025 - en cours
  // ----------------------------------------------------------
  {
    id: "harmonia",
    title: "Harmonia",
    date: "Mars 2025 - en cours",
    category: "professional",

    shortDescription: "Plugin audio VST piloté par IA, interface C++ avec JUCE.",
    longDescription:
      "Développement de l'interface C++ d'un plugin VST avec JUCE, backend FastAPI pour la communication et la gestion des données, et création d'un modèle d'IA from scratch dédié à la génération de paramètres audio.",

    image: "/assets/projects/harmonia/cover.jpg",

    year: 2025,
    role: "Développeur logiciel audio (JUCE / IA)",
    tags: ["Audio", "VST", "IA", "C++"],

    techStack: {
      languages: ["C++", "Python"],
      frameworks: ["JUCE", "FastAPI"],
      tools: ["Modèle IA from scratch"],
    },

    links: {
      live: "https://harmonia-eip.com",
      github: null, // "Github du projet" mentionné sur le CV, lien à compléter
      caseStudy: null,
    },

    theme: {
      background: "#1a0d0d",
      backgroundAccent: "#3d1c1c",
      accent: "#ff6a5c",
      particles: "drift",
    },

    featured: true,
  },

  // ----------------------------------------------------------
  // 4. WEBVOLUTION — 04/2025 - 06/2025
  // ----------------------------------------------------------
  {
    id: "webvolution",
    title: "Webvolution",
    date: "Avr. - Juin 2025",
    category: "professional",

    shortDescription: "Développeur Full Stack WordPress — migrations, workflows, DA.",
    longDescription:
      "Développement et intégration de fonctionnalités front/back-end sur WordPress, migration complète de sites (serveurs, bases de données, DNS, SSL), mise en place et optimisation de workflows techniques (formulaires, CRM), création de pages web design et responsive, et rédaction de documentation technique et fonctionnelle.",

    image: "/assets/projects/webvolution/cover.jpg",

    year: 2025,
    role: "Développeur Full Stack",
    tags: ["WordPress", "Full Stack", "Migration"],

    techStack: {
      languages: ["PHP", "JavaScript"],
      frameworks: ["WordPress"],
      tools: ["DNS", "SSL", "CRM"],
    },

    links: {
      live: "https://webvolution.fr",
      github: null,
      caseStudy: null,
    },

    theme: {
      background: "#0d1a12",
      backgroundAccent: "#1c3d28",
      accent: "#5cff9a",
      particles: "grid",
    },

    featured: false,
  },

  // ----------------------------------------------------------
  // 5. MCV — My Collection of Vinyl — Juillet 2026
  // ----------------------------------------------------------
  {
    id: "mcv",
    title: "MCV — My Collection of Vinyl",
    date: "Juillet 2026",
    category: "personal",

    shortDescription: "Votre collection Discogs, transformée en app mobile et web.",
    longDescription:
      "MCV transforme la collection Discogs déjà existante d'un utilisateur en une vraie application, disponible sur Android, iPhone et navigateur, sans rien ressaisir. L'app se connecte avec un jeton Discogs personnel stocké uniquement sur l'appareil de l'utilisateur : pas de compte MCV, pas de serveur qui conserve la collection. Conçue mobile-first (Android via APK, iPhone et desktop via PWA), elle affiche la collection et la wish list de l'utilisateur en lecture directe depuis Discogs.",

    image: "/assets/projects/mcv/cover.jpg",

    year: 2026,
    role: "Développeur solo",
    tags: ["Mobile", "PWA", "Discogs API", "Musique"],

    techStack: {
      languages: ["JavaScript"],
      frameworks: ["React Native", "Expo"],
      tools: ["EAS", "PWA", "OAuth2 / Token API", "Discogs API"],
    },

    links: {
      live: "https://mcv.example.com", // à remplacer par l'URL réelle du site MCV
      github: null,
      caseStudy: null,
    },

    theme: {
      background: "#0c0b0d",
      backgroundAccent: "#221f2b",
      accent: "#c9a15b",
      particles: "drift",
    },

    featured: true,
  },

  // ----------------------------------------------------------
  // 6. PORTFOLIO — ce site — Août 2026, en dernier
  // ----------------------------------------------------------
  {
    id: "portfolio",
    title: "Portfolio 3D",
    date: "Août 2026",
    category: "personal",

    shortDescription: "Ce portfolio : une map 3D interactive de mes projets.",
    longDescription:
      "Le site que vous êtes en train de visiter. Une map 3D navigable où chaque projet a son propre thème visuel, ses particules et son ambiance, plutôt qu'une liste statique de cartes.",

    image: "/assets/projects/portfolio/cover.jpg",

    year: 2026,
    role: "Développeur solo",
    tags: ["Portfolio", "3D", "Créatif"],

    techStack: {
      languages: ["JavaScript"],
      frameworks: ["React", "Three.js"],
      tools: ["Vite"],
    },

    links: {
      live: null, // s'ajoutera de lui-même une fois déployé
      github: null,
      caseStudy: null,
    },

    theme: {
      background: "#08080a",
      backgroundAccent: "#16161a",
      accent: "#ffffff",
      particles: "drift",
    },

    featured: true,
  },
];

/**
 * Projets triés (featured d'abord, puis par date décroissante).
 * La carte "presentation" reste toujours en tête grâce à sa
 * position fixée au centre — ce tri ne concerne que l'ordre dans
 * les listes/UI annexes, pas la disposition sur la map 3D.
 */
export function getSortedProjects() {
  return [...projects].sort((a, b) => {
    if (a.id === "presentation") return -1;
    if (b.id === "presentation") return 1;
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    return (b.year ?? 0) - (a.year ?? 0);
  });
}
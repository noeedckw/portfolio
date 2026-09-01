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
 *
 * `i18n.en` : optionnel. Contient la version anglaise des champs
 * texte (title, date, shortDescription, longDescription, role,
 * tags, et profile pour la carte présentation). Utilise
 * `getLocalizedProject(project, lang)` pour récupérer une version
 * fusionnée FR/EN prête à afficher.
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
      "Étudiant en 5e année à Epitech Lyon (Programme Grande École), de retour d'un échange académique d'un an à Soongsil University à Séoul (majeure Computer Science). Je me prépare à effectuer mon stage de fin d'études. J'apprécie particulièrement la résolution de problèmes et je cherche à renforcer mes compétences techniques en contribuant à des projets concrets au sein d'une équipe ambitieuse.",

    image: "/assets/projects/presentation/cover.png",

    year: 2026,
    role: "Étudiant — Epitech Lyon (Grande École), 5e année",

    // Infos de parcours / contact, propres à la carte présentation
    profile: {
      school: "Epitech Lyon — Programme Grande École, 5e année",
      exchange: "Soongsil University, Séoul — échange international d'un an (Computer Science)",
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
      languages: ["Java", "JavaScript", "TypeScript", "C", "C++", "Haskell", "Python"],
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

    // Pas de `position` manuelle : computeLayout la place automatiquement
    // tout en haut de la timeline, comme premier projet (voir layout.js).

    theme: {
      background: "#0b0b0f",
      backgroundAccent: "#1c1c26",
      accent: "#c9a15b", // clin d'œil au liseré doré du site MCV
      particles: "drift",
    },

    featured: true,

    i18n: {
      en: {
        title: "Noé Pereira",
        date: "Journey",
        shortDescription: "Developer in training — Epitech Lyon, Grande École program.",
        longDescription:
          "5th-year student at Epitech Lyon (Grande École Program), recently back from a one-year academic exchange at Soongsil University in Seoul (Computer Science major). Currently preparing for my end-of-studies internship. I particularly enjoy problem-solving and I'm looking to strengthen my technical skills by contributing to real projects within an ambitious team.",
        role: "Student — Epitech Lyon (Grande École), 5th year",
        tags: ["About", "Student", "Epitech"],
        profile: {
          school: "Epitech Lyon — Grande École Program, 5th year",
          exchange: "Soongsil University, Seoul — one-year international exchange (Computer Science)",
          languages: [{ name: "English", level: "C1" }],
          interests: ["Cinema", "Basketball", "Music"],
          availability: [
            {
              label: "Part-time internship",
              period: "09/14/2026 - 02/26/2027",
              detail: "3 days a week, Monday to Wednesday",
            },
            {
              label: "End-of-studies internship",
              period: "03/01/2027 - 08/31/2027",
              detail: "6 months",
            },
          ],
        },
      },
    },
  },

  // ----------------------------------------------------------
  // 1. NOSCO — Stage — 09/2023 - 12/2023
  // ----------------------------------------------------------
  {
    id: "nosco",
    title: "Nosco",
    date: "Sept. - Déc. 2023",
    category: "professional",

    shortDescription: "Stage développeur Full Stack — tests, optimisation et fiabilité produit.",
    longDescription:
      "Stage développeur full stack chez Nosco. Mise en place de tests unitaires, d'intégration et système pour garantir la qualité et la fiabilité du produit, identification et résolution de problèmes de performance, et reporting structuré des anomalies en lien étroit avec l'équipe.",

    image: "/assets/projects/nosco/cover.jpg",

    year: 2023,
    role: "Stagiaire Développeur Full Stack",
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

    i18n: {
      en: {
        title: "Nosco",
        date: "Sept. - Dec. 2023",
        shortDescription: "Full Stack developer internship — testing, optimization and product reliability.",
        longDescription:
          "Full stack developer internship at Nosco. Set up unit, integration and system tests to guarantee product quality and reliability, identified and fixed performance issues, and reported bugs in a structured way in close collaboration with the team.",
        role: "Full Stack Developer Intern",
        tags: ["Internship", "Full Stack", "QA / Testing"],
      },
    },
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

    i18n: {
      en: {
        title: "Aether Engine",
        date: "Oct. 2024 - Feb. 2025",
        shortDescription: "Cybersecurity Lead, Red Team — pentesting and automation.",
        longDescription:
          "Led the strategy and operations of the cybersecurity unit (Red Team): identifying and exploiting vulnerabilities, bypassing CAPTCHAs and automating data collection, analyzing weaknesses and strengthening the overall security of the system.",
        role: "Cybersecurity Lead — Red Team",
        tags: ["Cybersecurity", "Red Team", "Pentesting", "Automation"],
      },
    },
  },

  // ----------------------------------------------------------
  // 3. WEBVOLUTION — Stage — 04/2025 - 06/2025
  // ----------------------------------------------------------
  {
    id: "webvolution",
    title: "Webvolution",
    date: "Avr. - Juin 2025",
    category: "professional",

    shortDescription: "Stage développeur Full Stack WordPress — migrations, workflows, DA.",
    longDescription:
      "Stage développeur full stack chez Webvolution. Développement et intégration de fonctionnalités front/back-end sur WordPress, migration complète de sites (serveurs, bases de données, DNS, SSL), mise en place et optimisation de workflows techniques (formulaires, CRM), création de pages web design et responsive, et rédaction de documentation technique et fonctionnelle.",

    image: "/assets/projects/webvolution/cover.jpg",

    year: 2025,
    role: "Stagiaire Développeur Full Stack",
    tags: ["Stage", "WordPress", "Full Stack", "Migration"],

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

    i18n: {
      en: {
        title: "Webvolution",
        date: "Apr. - Jun. 2025",
        shortDescription: "Full Stack developer internship on WordPress — migrations, workflows, design.",
        longDescription:
          "Full stack developer internship at Webvolution. Developed and integrated front/back-end features on WordPress, ran full site migrations (servers, databases, DNS, SSL), set up and optimized technical workflows (forms, CRM), built responsive web design pages, and wrote technical and functional documentation.",
        role: "Full Stack Developer Intern",
        tags: ["Internship", "WordPress", "Full Stack", "Migration"],
      },
    },
  },

  // ----------------------------------------------------------
  // 4. ÉCHANGE ACADÉMIQUE — Soongsil University — 08/2025 - 07/2026
  // ----------------------------------------------------------
  {
    id: "exchange-soongsil",
    title: "Échange académique — Soongsil University",
    date: "Août 2025 - Juillet 2026",
    category: "personal", // conservé dans l'enum existant "presentation" | "professional" | "personal"

    shortDescription: "Une année d'échange académique à Séoul, majeure Computer Science.",
    longDescription:
      "Échange international d'un an à Soongsil University (Séoul, Corée du Sud), dans la majeure Computer Science. Cours suivis en anglais, immersion dans un nouvel environnement académique et culturel, et renforcement de mon autonomie et de mon adaptabilité en dehors du cadre habituel d'Epitech.",

    image: "/assets/projects/exchange/cover.jpg",

    year: 2025,
    role: "Étudiant en échange — Computer Science",
    tags: ["Échange académique", "Séoul", "Computer Science", "International"],

    links: {
      live: null,
      github: null,
      caseStudy: null,
    },

    theme: {
      background: "#0a1420",
      backgroundAccent: "#123a4d",
      accent: "#5cc9ff",
      particles: "drift",
    },

    featured: true,

    i18n: {
      en: {
        title: "Academic Exchange — Soongsil University",
        date: "Aug. 2025 - Jul. 2026",
        shortDescription: "A one-year academic exchange in Seoul, Computer Science major.",
        longDescription:
          "One-year international exchange at Soongsil University (Seoul, South Korea), in the Computer Science major. Took courses in English, immersed myself in a new academic and cultural environment, and strengthened my autonomy and adaptability outside of Epitech's usual framework.",
        role: "Exchange Student — Computer Science",
        tags: ["Academic Exchange", "Seoul", "Computer Science", "International"],
      },
    },
  },

  // ----------------------------------------------------------
  // 5. MCV — My Collection of Vinyl — Juillet 2026
  // ----------------------------------------------------------
  {
    id: "mcv",
    title: "MCV",
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
      languages: ["JavaScript", "TypeScript"],
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

    i18n: {
      en: {
        title: "MCV — My Collection of Vinyl",
        date: "July 2026",
        shortDescription: "Your Discogs collection, turned into a mobile and web app.",
        longDescription:
          "MCV turns a user's existing Discogs collection into a real app, available on Android, iPhone and the browser, without re-entering anything. The app connects with a personal Discogs token stored only on the user's device: no MCV account, no server keeping a copy of the collection. Built mobile-first (Android via APK, iPhone and desktop via PWA), it displays the user's collection and wish list read directly from Discogs.",
        role: "Solo Developer",
        tags: ["Mobile", "PWA", "Discogs API", "Music"],
      },
    },
  },

  // ----------------------------------------------------------
  // 6. PORTFOLIO — ce site — Août 2026
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

    i18n: {
      en: {
        title: "3D Portfolio",
        date: "Aug. 2026",
        shortDescription: "This portfolio: an interactive 3D map of my projects.",
        longDescription:
          "The site you're currently visiting. A navigable 3D map where each project has its own visual theme, particles and atmosphere, rather than a static list of cards.",
        role: "Solo Developer",
        tags: ["Portfolio", "3D", "Creative"],
      },
    },
  },

  // ----------------------------------------------------------
  // 7. HARMONIA — 03/2025 - en cours (placé en dernier : projet
  //    toujours actif, pas encore terminé)
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
    tags: ["Audio", "VST", "IA", "C++", "En cours"],

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

    i18n: {
      en: {
        title: "Harmonia",
        date: "Mar. 2025 - ongoing",
        shortDescription: "AI-driven VST audio plugin, C++ interface with JUCE.",
        longDescription:
          "Built the C++ interface of a VST plugin with JUCE, a FastAPI backend for communication and data management, and an AI model built from scratch dedicated to generating audio parameters.",
        role: "Audio Software Developer (JUCE / AI)",
        tags: ["Audio", "VST", "AI", "C++", "Ongoing"],
      },
    },
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

/**
 * Retourne une version "localisée" d'un projet : fusionne les
 * champs FR (par défaut) avec la traduction i18n[lang] si elle
 * existe, sans toucher aux champs non textuels (image, theme,
 * links, techStack, position, etc.).
 *
 * Usage : getLocalizedProject(project, "en")
 */
export function getLocalizedProject(project, lang = "fr") {
  if (lang === "fr" || !project.i18n?.[lang]) return project;

  const translation = project.i18n[lang];
  return {
    ...project,
    ...translation,
    profile: translation.profile
      ? { ...project.profile, ...translation.profile }
      : project.profile,
  };
}

/**
 * Agrège tous les languages / frameworks / tools utilisés à
 * travers l'ensemble des projets (hors carte "presentation") en
 * listes uniques triées — pratique pour afficher une vue globale
 * des compétences sans dupliquer l'info à la main.
 */
export function getAllTechStack() {
  const languages = new Set();
  const frameworks = new Set();
  const tools = new Set();

  for (const project of projects) {
    if (project.id === "presentation" || !project.techStack) continue;
    project.techStack.languages?.forEach((l) => languages.add(l));
    project.techStack.frameworks?.forEach((f) => frameworks.add(f));
    project.techStack.tools?.forEach((t) => tools.add(t));
  }

  return {
    languages: [...languages].sort(),
    frameworks: [...frameworks].sort(),
    tools: [...tools].sort(),
  };
}
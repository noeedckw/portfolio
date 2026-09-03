export const DEFAULT_LOGO_CONFIG = {
  width: 1.1,
  height: 1.1,
  shape: "square",
  fit: "contain",
  cornerRadius: 0.07,
  border: {
    enabled: true,
    thickness: 0.018,
    color: "#ffffff",
    opacity: 0.35,
  },
  text: {
    titleSize: 0.13,
    dateSize: 0.09,
    titleGap: 0.08,
    titleDateGap: 0.18,
    titleOffsetY: null,
    dateOffsetY: null,
  },
  // Comportement du logo au zoom : il reste centré, le panneau gauche
  // et le panneau droit s'ouvrent de part et d'autre.
  zoomed: {
    scale: 1.15,
    offsetX: 0,
    offsetY: 0,
  },
};

function mergeLogoOverride(base, override) {
  if (!override) return base;
  return {
    ...base,
    ...override,
    border: { ...base.border, ...override.border },
    text: { ...base.text, ...override.text },
    zoomed: { ...base.zoomed, ...override.zoomed },
  };
}

/**
 * Retourne la config logo finale d'un projet.
 * - `project.logo` override le défaut (desktop).
 * - `project.logo.mobile` s'applique par-dessus si isMobile.
 */
export function getLogoConfig(project, isMobile = false) {
  const { mobile: mobileOverride, ...logoOverride } = project.logo ?? {};
  const desktopConfig = mergeLogoOverride(DEFAULT_LOGO_CONFIG, logoOverride);
  return isMobile ? mergeLogoOverride(desktopConfig, mobileOverride) : desktopConfig;
}

/**
 * ============================================================
 * CONFIG DES PROJETS — pilote toute la map 3D
 * ============================================================
 * CHAMPS OBLIGATOIRES : id, title, date, image
 * TOUT LE RESTE EST OPTIONNEL.
 *
 * Panneau gauche (récit) : date, title, role, location, duration,
 * tags, longDescription/shortDescription.
 *
 * Panneau droit (technique / recruteur) : highlights, metrics,
 * techStack, skillsGained, profile (pour la carte présentation), links.
 *
 * `location` : ville/contexte du projet, ex "Lyon, France".
 * `duration` : durée lisible, ex "3 mois", "1 an", "En cours".
 * `highlights` : points concrets/techniques marquants (tableau de
 * strings courtes) — ce que retient un recruteur en un coup d'œil.
 * `metrics` : petites stats en grille, ex
 *   [{ label: "Rôle", value: "Solo" }, { label: "Stack", value: "React" }]
 * `skillsGained` : tableau de compétences/soft skills (tags) affiché
 * dans le panneau droit — utile pour les projets SANS techStack
 * (ex: échange académique) pour que le panneau droit ne soit pas vide.
 * ============================================================
 */

export const projects = [
  // ----------------------------------------------------------
  // 0. PRÉSENTATION
  // ----------------------------------------------------------
  {
    id: "presentation",
    title: "Noé Pereira",
    date: "Parcours",
    category: "presentation",

    position: [0, 3.8, 0],
    positionMobile: [0, 4.4, 0],
    logo: {
      width: 1.8,
      height: 1.8,
      border: { enabled: false, thickness: 0.0 },
      text: {
        titleSize: 0.25,
        dateSize: 0.2,
        titleGap: 0.0,
        titleDateGap: 0.35,
        titleOffsetY: null,
        dateOffsetY: null,
      },
      mobile: {
        width: 1.1,
        height: 1.1,
        text: { titleSize: 0.2, dateSize: 0.15, titleGap: 0.06, titleDateGap: 0.3 },
        zoomed: { scale: 0.6, offsetX: 0, offsetY: 0.8 },
      },
      zoomed: { scale: 1.0, offsetX: 0, offsetY: -0.1 },
    },

    location: "Lyon, France",

    shortDescription: "Développeur en formation — Epitech Lyon, promotion Grande École.",
    longDescription:
      "Étudiant en 5e année à Epitech Lyon (Programme Grande École), de retour d'un échange académique d'un an à Soongsil University à Séoul (majeure Computer Science). Je me prépare à effectuer mon stage de fin d'études. J'apprécie particulièrement la résolution de problèmes et je cherche à renforcer mes compétences techniques en contribuant à des projets concrets au sein d'une équipe ambitieuse.",

    image: "/assets/projects/presentation/cover.png",

    year: 2026,
    role: "Étudiant — Epitech Lyon (Grande École), 5e année",

    // Contact volontairement absent d'ici : déjà présent dans la bottom bar.
    profile: {
      school: "Epitech Lyon — Programme Grande École, 5e année",
      exchange: "Soongsil University, Séoul — échange international d'un an (Computer Science)",
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

    theme: {
      background: "#0b0b0f",
      backgroundAccent: "#1c1c26",
      accent: "#c9a15b",
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

    location: "Lyon, France",
    duration: "4 mois",

    shortDescription: "Stage développeur Full Stack — tests, optimisation et fiabilité produit.",
    longDescription:
      "Stage développeur full stack chez Nosco, avec un focus sur la qualité et la fiabilité du produit. Intégré à l'équipe technique, j'ai travaillé en binôme avec les développeurs pour couvrir les fonctionnalités existantes de tests automatisés, remonter les régressions le plus tôt possible dans le cycle de développement, et fiabiliser des parcours critiques de l'application avant chaque mise en production.",

    highlights: [
      "Mise en place de tests unitaires, d'intégration et système sur les parcours critiques",
      "Identification et résolution de problèmes de performance (requêtes lentes, rendu front)",
      "Reporting structuré des anomalies (reproduction, priorisation, suivi jusqu'à correction)",
      "Participation aux revues de code et aux points quotidiens de l'équipe produit",
    ],
    metrics: [
      { label: "Rôle", value: "Stagiaire" },
      { label: "Stack", value: "React / Node.js" },
      { label: "Durée", value: "4 mois" },
    ],

    image: "/assets/projects/nosco/nosco_logo.png",

    year: 2023,
    role: "Stagiaire Développeur Full Stack",
    tags: ["Stage", "Full Stack", "QA / Tests"],

    techStack: {
      languages: ["JavaScript"],
      frameworks: ["React", "Node.js"],
      tools: ["Tests unitaires", "Tests d'intégration", "Tests système"],
    },

    links: { live: null, github: null, caseStudy: null },

    theme: {
      background: "#0d1b2a",
      backgroundAccent: "#1c3a5e",
      accent: "#7cc4ff",
      particles: "grid",
    },

    position: [5.0, 1.2, -3.0],
    positionMobile: [-1.4, 2.2, 0.91],

    logo: {
      width: 2.0,
      height: 1.0,
      border: { enabled: false, thickness: 0.0 },
      text: {
        titleSize: 0.25,
        dateSize: 0.22,
        titleGap: 0.2,
        titleDateGap: 0.35,
        titleOffsetY: null,
        dateOffsetY: null,
      },
      mobile: {
        width: 1.2,
        height: 0.8,
        text: { titleSize: 0.16, dateSize: 0.1, titleGap: 0.2, titleDateGap: 0.3 },
        zoomed: { scale: 0.5, offsetX: 0, offsetY: 0.8 },
      },
      zoomed: { scale: 0.75, offsetX: 0, offsetY: -0.1 },
    },

    featured: false,

    i18n: {
      en: {
        title: "Nosco",
        date: "Sept. - Dec. 2023",
        shortDescription: "Full Stack developer internship — testing, optimization and product reliability.",
        longDescription:
          "Full stack developer internship at Nosco, focused on product quality and reliability. Working closely with the technical team, I paired with developers to cover existing features with automated tests, catch regressions as early as possible in the development cycle, and harden critical user flows ahead of each release.",
        role: "Full Stack Developer Intern",
        tags: ["Internship", "Full Stack", "QA / Testing"],
        duration: "4 months",
        highlights: [
          "Set up unit, integration and system tests on critical flows",
          "Identified and fixed performance issues (slow queries, front-end rendering)",
          "Structured bug reporting (reproduction, prioritization, follow-up to resolution)",
          "Took part in code reviews and daily team stand-ups",
        ],
        metrics: [
          { label: "Role", value: "Intern" },
          { label: "Stack", value: "React / Node.js" },
          { label: "Duration", value: "4 months" },
        ],
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

    location: "Lyon, France",
    duration: "5 mois",

    shortDescription: "Lead Cybersécurité, pôle Red Team — pentests et automatisation.",
    longDescription:
      "Responsable de la stratégie et des opérations du pôle cybersécurité (Red Team) au sein du projet Aether Engine. J'ai piloté les campagnes de tests d'intrusion sur les systèmes internes, coordonné une petite équipe sur la priorisation des cibles, et mis en place des outils d'automatisation pour accélérer la collecte d'informations et la détection de failles, avec un reporting régulier des risques identifiés.",

    highlights: [
      "Pilotage des campagnes de pentest et priorisation des cibles avec l'équipe",
      "Identification et exploitation de vulnérabilités sur les systèmes internes",
      "Contournement de CAPTCHA et automatisation de collectes de données",
      "Analyse des failles, documentation et renforcement de la sécurité globale",
    ],
    metrics: [
      { label: "Rôle", value: "Lead Red Team" },
      { label: "Stack", value: "Python" },
      { label: "Durée", value: "5 mois" },
    ],

    image: "/assets/projects/aether/epitech-logo.jpg",

    year: 2025,
    role: "Lead Cybersécurité — Red Team",
    tags: ["Cybersécurité", "Red Team", "Pentest", "Automatisation"],

    techStack: {
      languages: ["Python"],
      frameworks: [],
      tools: ["Pentesting", "Scraping", "Bypass CAPTCHA"],
    },

    links: { live: null, github: null, caseStudy: null },

    theme: {
      background: "#150d1a",
      backgroundAccent: "#341c3d",
      accent: "#c25cff",
      particles: "grid",
    },

    position: [9.5, -1.25, -1.25],
    positionMobile: [1.4, 0.4, 0.91],

    logo: {
      width: 1.4,
      height: 1.0,
      border: { enabled: false, thickness: 0.0 },
      text: {
        titleSize: 0.22,
        dateSize: 0.2,
        titleGap: 0.2,
        titleDateGap: 0.35,
        titleOffsetY: null,
        dateOffsetY: null,
      },
      mobile: {
        width: 1.4,
        height: 0.8,
        text: { titleSize: 0.18, dateSize: 0.12, titleGap: 0.2, titleDateGap: 0.3 },
        zoomed: { scale: 0.4, offsetX: 0, offsetY: 1.0 },
      },
      zoomed: { scale: 1.0, offsetX: 0, offsetY: 0.0 },
    },

    featured: true,

    i18n: {
      en: {
        title: "Aether Engine",
        date: "Oct. 2024 - Feb. 2025",
        shortDescription: "Cybersecurity Lead, Red Team — pentesting and automation.",
        longDescription:
          "Led the strategy and operations of the cybersecurity unit (Red Team) within the Aether Engine project. I drove penetration testing campaigns against internal systems, coordinated a small team on target prioritization, and built automation tooling to speed up reconnaissance and vulnerability detection, with regular reporting on identified risks.",
        role: "Cybersecurity Lead — Red Team",
        tags: ["Cybersecurity", "Red Team", "Pentesting", "Automation"],
        duration: "5 months",
        highlights: [
          "Drove pentest campaigns and prioritized targets with the team",
          "Identified and exploited vulnerabilities on internal systems",
          "Bypassed CAPTCHAs and automated data collection",
          "Documented weaknesses and strengthened overall security",
        ],
        metrics: [
          { label: "Role", value: "Lead Red Team" },
          { label: "Stack", value: "Python" },
          { label: "Duration", value: "5 months" },
        ],
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

    location: "Lyon, France",
    duration: "3 mois",

    shortDescription: "Stage développeur Full Stack WordPress — migrations, workflows, DA.",
    longDescription:
      "Stage développeur full stack chez Webvolution, agence spécialisée en création de sites web. J'ai développé des fonctionnalités front et back-end sur WordPress pour des clients variés, piloté plusieurs migrations complètes de sites (hébergement, base de données, DNS, certificats SSL), et mis en place des workflows techniques pour automatiser la remontée de leads (formulaires connectés aux CRM). J'ai également rédigé la documentation technique et fonctionnelle associée pour faciliter la passation aux équipes.",

    highlights: [
      "Migration complète de sites (serveurs, bases de données, DNS, SSL) sans interruption client",
      "Mise en place et optimisation de workflows techniques (formulaires, intégration CRM)",
      "Création de pages web sur-mesure, design et responsive, pour plusieurs clients",
      "Rédaction de documentation technique et fonctionnelle pour la passation",
    ],
    metrics: [
      { label: "Rôle", value: "Stagiaire Full Stack" },
      { label: "Stack", value: "WordPress / PHP" },
      { label: "Durée", value: "3 mois" },
    ],

    image: "/assets/projects/webvolution/webvolution_logo.png",

    year: 2025,
    role: "Stagiaire Développeur Full Stack",
    tags: ["Stage", "WordPress", "Full Stack", "Migration"],

    techStack: {
      languages: ["PHP", "JavaScript"],
      frameworks: ["WordPress"],
      tools: ["DNS", "SSL", "CRM"],
    },

    links: { live: "https://webvolution.fr", github: null, caseStudy: null },

    theme: {
      background: "#0d1a12",
      backgroundAccent: "#1c3d28",
      accent: "#5cff9a",
      particles: "grid",
    },

    position: [3.5, -3.4, 0],
    positionMobile: [-0.65, -2.5, -1.0],

    logo: {
      width: 1.4,
      height: 1.4,
      border: { enabled: true, thickness: 0.15 },
      text: {
        titleSize: 0.25,
        dateSize: 0.22,
        titleGap: 0.2,
        titleDateGap: 0.35,
        titleOffsetY: null,
        dateOffsetY: null,
      },
      mobile: {
        width: 1.0,
        height: 1.0,
        border: { enabled: true, thickness: 0.15 },
        text: { titleSize: 0.16, dateSize: 0.1, titleGap: 0.2, titleDateGap: 0.3 },
        zoomed: { scale: 0.5, offsetX: 0, offsetY: 0.75 },
      },
      zoomed: { scale: 0.8, offsetX: 0, offsetY: 0.0 },
    },

    featured: false,

    i18n: {
      en: {
        title: "Webvolution",
        date: "Apr. - Jun. 2025",
        shortDescription: "Full Stack developer internship on WordPress — migrations, workflows, design.",
        longDescription:
          "Full stack developer internship at Webvolution, a web agency. I built front and back-end features on WordPress for a range of clients, led several full site migrations (hosting, database, DNS, SSL certificates), and set up technical workflows to automate lead capture (forms wired into CRMs). I also wrote the accompanying technical and functional documentation to make handover to other teams easier.",
        role: "Full Stack Developer Intern",
        tags: ["Internship", "WordPress", "Full Stack", "Migration"],
        duration: "3 months",
        highlights: [
          "Full site migrations (servers, databases, DNS, SSL) with zero client downtime",
          "Set up and optimized technical workflows (forms, CRM integration)",
          "Built custom, responsive web pages for several clients",
          "Wrote technical and functional documentation for handover",
        ],
        metrics: [
          { label: "Role", value: "Full Stack Intern" },
          { label: "Stack", value: "WordPress / PHP" },
          { label: "Duration", value: "3 months" },
        ],
      },
    },
  },

  // ----------------------------------------------------------
  // 4. ÉCHANGE ACADÉMIQUE — Soongsil University — 08/2025 - 07/2026
  // ----------------------------------------------------------
  {
    id: "exchange-soongsil",
    title: "Soongsil University",
    date: "Août 2025 - Juillet 2026",
    category: "personal",

    location: "Séoul, Corée du Sud",
    duration: "1 an",

    shortDescription: "Une année d'échange académique à Séoul, majeure Computer Science.",
    longDescription:
      "Échange international d'un an à Soongsil University, dans la majeure Computer Science, entièrement suivi en anglais. Au-delà des cours, cette année a surtout été un exercice d'autonomie et d'adaptabilité en dehors du cadre habituel d'Epitech : trouver mes marques dans un nouveau système académique, m'intégrer à un environnement multiculturel, et gérer seul l'ensemble de la logistique d'une vie à l'étranger (logement, administratif, vie quotidienne).",

    highlights: [
      "Cours suivis intégralement en anglais dans un système académique différent",
      "Immersion académique et culturelle complète, loin du cadre habituel",
      "Intégration à un environnement international et multiculturel",
      "Gestion autonome de toute la logistique d'une année à l'étranger",
    ],
    metrics: [
      { label: "Programme", value: "Échange académique" },
      { label: "Majeure", value: "Computer Science" },
      { label: "Langue des cours", value: "Anglais" },
      { label: "Durée", value: "1 an" },
    ],

    // Pas de techStack ici (ce n'est pas un projet de dev) — skillsGained
    // remplit le panneau droit à la place, avec les compétences
    // transférables développées pendant l'échange.
    skillsGained: [
      "Autonomie",
      "Adaptabilité",
      "Anglais professionnel (C1)",
      "Travail en environnement multiculturel",
      "Gestion de projet personnel",
    ],

    image: "/assets/projects/soongsil/soongsil_logo.png",

    year: 2025,
    role: "Étudiant en échange — Computer Science",
    tags: ["Échange académique", "Séoul", "Computer Science", "International"],

    links: { live: null, github: null, caseStudy: null },

    theme: {
      background: "#0a1420",
      backgroundAccent: "#123a4d",
      accent: "#5cc9ff",
      particles: "drift",
    },

    position: [-4.0, -6.0, 1.0],
    positionMobile: [-2.2, -5.0, -0.6],

    logo: {
      width: 1.4,
      height: 1.4,
      shape: "none",
      text: {
        titleSize: 0.25,
        dateSize: 0.22,
        titleGap: 0.2,
        titleDateGap: 0.35,
        titleOffsetY: null,
        dateOffsetY: null,
      },
      mobile: {
        width: 1.2,
        height: 1.2,
        border: { enabled: false, thickness: 0.15 },
        text: { titleSize: 0.16, dateSize: 0.1, titleGap: 0.2, titleDateGap: 0.3 },
        zoomed: { scale: 0.5, offsetX: 0, offsetY: 0.7 },
      },
      zoomed: { scale: 0.9, offsetX: 0, offsetY: 0.2 },
    },

    featured: true,

    i18n: {
      en: {
        title: "Soongsil University",
        date: "Aug. 2025 - Jul. 2026",
        location: "Seoul, South Korea",
        shortDescription: "A one-year academic exchange in Seoul, Computer Science major.",
        longDescription:
          "One-year international exchange at Soongsil University, in the Computer Science major, entirely taught in English. Beyond coursework, this year was mostly an exercise in autonomy and adaptability outside Epitech's usual framework: finding my footing in a different academic system, integrating into a multicultural environment, and handling all the logistics of living abroad on my own (housing, admin, day-to-day life).",
        role: "Exchange Student — Computer Science",
        tags: ["Academic Exchange", "Seoul", "Computer Science", "International"],
        duration: "1 year",
        highlights: [
          "Courses taken entirely in English in a different academic system",
          "Full academic and cultural immersion, outside the usual framework",
          "Integration into an international, multicultural environment",
          "Independently handled all logistics of a year abroad",
        ],
        metrics: [
          { label: "Program", value: "Academic Exchange" },
          { label: "Major", value: "Computer Science" },
          { label: "Course language", value: "English" },
          { label: "Duration", value: "1 year" },
        ],
        skillsGained: [
          "Autonomy",
          "Adaptability",
          "Professional English (C1)",
          "Working in a multicultural environment",
          "Personal project management",
        ],
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

    location: "Projet perso",
    duration: "1 mois",

    position: [-9.5, -9, -6.5],
    positionMobile: [2.2, -7.0, -0.6],

    logo: {
      shape: "none",
      width: 1.4,
      height: 1.4,
      text: {
        titleSize: 0.25,
        dateSize: 0.22,
        titleGap: 0.2,
        titleDateGap: 0.35,
        titleOffsetY: null,
        dateOffsetY: null,
      },
      mobile: {
        width: 1.2,
        height: 1.2,
        border: { enabled: false, thickness: 0.15 },
        text: { titleSize: 0.16, dateSize: 0.1, titleGap: 0.2, titleDateGap: 0.3 },
        zoomed: { scale: 0.5, offsetX: 0, offsetY: 0.8 },
      },
      zoomed: { scale: 0.9, offsetX: 0, offsetY: -0.0 },
    },

    shortDescription: "Votre collection Discogs, transformée en app mobile et web.",
    longDescription:
      "MCV transforme la collection Discogs déjà existante d'un utilisateur en une vraie application, sans rien ressaisir. L'app se connecte avec un jeton Discogs personnel stocké uniquement sur l'appareil de l'utilisateur : pas de compte MCV, pas de serveur qui conserve la collection.",

    highlights: [
      "Aucun compte ni serveur — token Discogs stocké en local",
      "Mobile-first : APK Android + PWA iPhone/desktop",
      "Lecture directe de la collection et de la wish list Discogs",
    ],
    metrics: [
      { label: "Plateformes", value: "Android · iOS · Web" },
      { label: "Rôle", value: "Solo" },
    ],

    image: "/assets/projects/mcv/mcv_logo.png",

    year: 2026,
    role: "Développeur solo",
    tags: ["Mobile", "PWA", "Discogs API", "Musique"],

    techStack: {
      languages: ["JavaScript", "TypeScript"],
      frameworks: ["React Native", "Expo"],
      tools: ["EAS", "PWA", "OAuth2 / Token API", "Discogs API"],
    },

    // TODO: remplacer par les vrais liens (repo GitHub public / démo live)
    links: { live: "https://noeedckw.github.io/MCV/landing/", github: null, caseStudy: null },

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
        location: "Personal project",
        shortDescription: "Your Discogs collection, turned into a mobile and web app.",
        longDescription:
          "MCV turns a user's existing Discogs collection into a real app, without re-entering anything. The app connects with a personal Discogs token stored only on the user's device: no MCV account, no server keeping a copy of the collection.",
        role: "Solo Developer",
        tags: ["Mobile", "PWA", "Discogs API", "Music"],
        duration: "1 month",
        highlights: [
          "No account or server — Discogs token stored locally",
          "Mobile-first: Android APK + iPhone/desktop PWA",
          "Reads collection and wish list directly from Discogs",
        ],
        metrics: [
          { label: "Platforms", value: "Android · iOS · Web" },
          { label: "Role", value: "Solo" },
        ],
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

    location: "Projet perso",
    duration: "1 mois",

    position: [-5, -11.6, -12],
    positionMobile: [-2.0, -6.5, 1.35],

    shortDescription: "Ce portfolio : une map 3D interactive de mes projets.",
    longDescription:
      "Le site que vous êtes en train de visiter. Une map 3D navigable où chaque projet a son propre thème visuel, ses particules et son ambiance, plutôt qu'une liste statique de cartes. Construit avec React Three Fiber, avec un soin particulier porté à la fluidité (position et opacité pilotées à chaque frame plutôt que par re-render React) et à la cohérence visuelle entre desktop et mobile.",

    highlights: [
      "Map 3D navigable, un nœud par projet, avec zoom fluide au clic",
      "Thème visuel et particules propres à chaque projet",
      "Panneaux d'information desktop / bottom sheet swipable sur mobile",
    ],
    metrics: [
      { label: "Rôle", value: "Solo" },
      { label: "Stack", value: "React Three Fiber" },
    ],

    image: "/assets/projects/portfolio/portfolio-logo.png",

    year: 2026,
    role: "Développeur solo",
    tags: ["Portfolio", "3D", "Créatif"],

    techStack: {
      languages: ["JavaScript"],
      frameworks: ["React", "Three.js"],
      tools: ["Vite"],
    },

    // TODO: remplacer par le vrai repo GitHub une fois public
    links: { live: null, github: null, caseStudy: null },

    theme: {
      background: "#08080a",
      backgroundAccent: "#16161a",
      accent: "#ffffff",
      particles: "drift",
    },

    logo: {
      width: 1.4,
      height: 1.4,
      text: {
        titleSize: 0.25,
        dateSize: 0.22,
        titleGap: 0.2,
        titleDateGap: 0.35,
        titleOffsetY: null,
        dateOffsetY: null,
      },
      mobile: {
        width: 1.2,
        height: 1.2,
        text: { titleSize: 0.16, dateSize: 0.1, titleGap: 0.2, titleDateGap: 0.3 },
        zoomed: { scale: 0.45, offsetX: 0, offsetY: 0.7 },
      },
      zoomed: { scale: 0.8, offsetX: 0, offsetY: 0.0 },
    },

    featured: true,

    i18n: {
      en: {
        title: "3D Portfolio",
        date: "Aug. 2026",
        location: "Personal project",
        shortDescription: "This portfolio: an interactive 3D map of my projects.",
        longDescription:
          "The site you're currently visiting. A navigable 3D map where each project has its own visual theme, particles and atmosphere, rather than a static list of cards. Built with React Three Fiber, with particular attention to smoothness (position and opacity driven per-frame rather than through React re-renders) and visual consistency between desktop and mobile.",
        role: "Solo Developer",
        tags: ["Portfolio", "3D", "Creative"],
        duration: "1 month",
        highlights: [
          "Navigable 3D map, one node per project, smooth zoom on click",
          "Unique visual theme and particles per project",
          "Desktop info panels / swipable bottom sheet on mobile",
        ],
        metrics: [
          { label: "Role", value: "Solo" },
          { label: "Stack", value: "React Three Fiber" },
        ],
      },
    },
  },

  // ----------------------------------------------------------
  // 7. HARMONIA — 03/2025 - en cours
  // ----------------------------------------------------------
  {
    id: "harmonia",
    title: "Harmonia",
    date: "Mars 2025 - en cours",
    category: "professional",

    location: "Lyon, France",
    duration: "En cours",

    position: [11.5, -14.6, -4.0],
    positionMobile: [-0.2, -10.0, -1.4],

    shortDescription: "Plugin audio VST piloté par IA, interface C++ avec JUCE.",
    longDescription:
      "Développement de l'interface C++ d'un plugin VST avec JUCE, backend FastAPI pour la communication et la gestion des données, et création d'un modèle d'IA from scratch dédié à la génération de paramètres audio.",

    highlights: [
      "Interface C++ native avec JUCE",
      "Backend FastAPI pour la communication et la gestion des données",
      "Modèle d'IA développé from scratch pour la génération de paramètres audio",
    ],
    metrics: [
      { label: "Rôle", value: "Dev logiciel audio / IA" },
      { label: "Stack", value: "C++ / Python" },
    ],

    image: "/assets/projects/harmonia/icon.png",

    year: 2025,
    role: "Développeur logiciel audio (JUCE / IA)",
    tags: ["Audio", "VST", "IA", "C++", "En cours"],

    techStack: {
      languages: ["C++", "Python"],
      frameworks: ["JUCE", "FastAPI"],
      tools: ["Modèle IA from scratch"],
    },

    links: { live: "https://harmonia-eip.com", github: null, caseStudy: null },

    theme: {
      background: "#1a0d0d",
      backgroundAccent: "#3d1c1c",
      accent: "#ff6a5c",
      particles: "drift",
    },

    logo: {
      width: 1.4,
      height: 1.4,
      text: {
        titleSize: 0.25,
        dateSize: 0.22,
        titleGap: 0.2,
        titleDateGap: 0.35,
        titleOffsetY: null,
        dateOffsetY: null,
      },
      mobile: {
        width: 1.4,
        height: 1.4,
        text: { titleSize: 0.16, dateSize: 0.1, titleGap: 0.2, titleDateGap: 0.3 },
        zoomed: { scale: 0.4, offsetX: 0, offsetY: 0.75 },
      },
      zoomed: { scale: 0.8, offsetX: 0, offsetY: 0.0 },
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
        duration: "Ongoing",
        highlights: [
          "Native C++ interface with JUCE",
          "FastAPI backend for communication and data management",
          "AI model built from scratch to generate audio parameters",
        ],
        metrics: [
          { label: "Role", value: "Audio / AI Software Dev" },
          { label: "Stack", value: "C++ / Python" },
        ],
      },
    },
  },
];

export function getSortedProjects() {
  return [...projects].sort((a, b) => {
    if (a.id === "presentation") return -1;
    if (b.id === "presentation") return 1;
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    return (b.year ?? 0) - (a.year ?? 0);
  });
}

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
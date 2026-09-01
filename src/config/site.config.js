/**
 * ============================================================
 * CONFIG DU SITE / PAGE D'INTRO
 * ============================================================
 * Tout ce qui touche à toi (pas aux projets) vit ici.
 * Comme pour les projets : ce qui est null/vide n'est pas affiché.
 * ============================================================
 */

export const site = {
  // --- Identité ---
  name: "Pereira Noé",
  role: "Développeur", // sous-titre sous ton nom
  tagline: "Je construis des interfaces qui racontent quelque chose.",

  // --- Photo / avatar (optionnel) ---
  avatar: null, // ex: "/assets/avatar.jpg" — laisse null si tu ne veux pas de photo

  // --- Bio (optionnel) ---
  bio: "Développeur passionné par les expériences web originales. J'aime mélanger code et design pour créer des interfaces qui sortent du template.",

  // --- CV (optionnel) ---
  resumeUrl: null, // ex: "/assets/cv.pdf"

  // --- Téléphone (optionnel, affiché dans la bottom bar — laisse null pour le masquer) --

  // --- Réseaux (optionnels, mets null pour ceux que tu ne veux pas afficher) ---
  socials: {
    github: "https://github.com/noeedckw",
    linkedin: "https://www.linkedin.com/in/noe-pereira",
    twitter: null,
    email: "noe.pereira@epitech.eu",
    phone: "+33 6 14 64 50 58",
  },

  // --- Thème (optionnel, pour customiser rapidement les couleurs) ---
  theme: {
    accent: "#7C8CFF",
  },
};
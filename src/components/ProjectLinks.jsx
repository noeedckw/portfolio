const LINK_LABELS = {
  fr: { live: "Voir le site", github: "Code source", caseStudy: "Étude de cas", linkedin: "LinkedIn", email: "Contact" },
  en: { live: "Visit site", github: "Source code", caseStudy: "Case study", linkedin: "LinkedIn", email: "Contact" },
};
const LINK_ICONS = { live: "↗", github: "⌘", caseStudy: "▤", linkedin: "in", email: "✉" };

export default function ProjectLinks({ links, accent = "#ffffff", locale = "fr" }) {
  if (!links) return null;
  const labels = LINK_LABELS[locale] ?? LINK_LABELS.fr;
  const entries = Object.entries(links).filter(([, url]) => !!url);
  if (!entries.length) return null;

  return (
    <div className="project-links">
      {entries.map(([key, url]) => (
        <a
          key={key}
          href={url}
          target={key === "email" ? undefined : "_blank"}
          rel="noreferrer"
          className="project-links__item"
          style={{ borderColor: accent }}
        >
          <span className="project-links__icon" style={{ color: accent }}>{LINK_ICONS[key] ?? "↗"}</span>
          {labels[key] ?? key}
        </a>
      ))}
    </div>
  );
}
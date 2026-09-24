import "./ProjectLinks.css";

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
    <div className="project-links" style={{ "--accent": accent }}>
      {entries.map(([key, url], i) => (
        <a
          key={key}
          href={key === "email" && !url.startsWith("mailto:") ? `mailto:${url}` : url}
          target={key === "email" ? undefined : "_blank"}
          rel="noreferrer"
          className="project-links__item"
          style={{ "--i": i }}
        >
          <span className="project-links__icon" aria-hidden="true">{LINK_ICONS[key] ?? "↗"}</span>
          <span className="project-links__label">{labels[key] ?? key}</span>
        </a>
      ))}
    </div>
  );
}
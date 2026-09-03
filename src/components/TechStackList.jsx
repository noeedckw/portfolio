const CATEGORY_LABELS = {
  fr: { languages: "Langages", frameworks: "Frameworks", tools: "Outils" },
  en: { languages: "Languages", frameworks: "Frameworks", tools: "Tools" },
};

function initials(name) {
  const clean = name.replace(/\.js$/i, "").trim();
  const parts = clean.split(/[\s.+/-]+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return clean.slice(0, 2).toUpperCase();
}

export default function TechStackList({ techStack, locale = "fr" }) {
  if (!techStack) return null;
  const labels = CATEGORY_LABELS[locale] ?? CATEGORY_LABELS.fr;
  const categories = ["languages", "frameworks", "tools"].filter((k) => techStack[k]?.length > 0);
  if (!categories.length) return null;

  let globalIndex = 0;

  return (
    <div className="tech-stack">
      {categories.map((key) => (
        <div className="tech-stack__group" key={key}>
          <p className="tech-stack__label">{labels[key]}</p>
          <div className="tech-stack__grid">
            {techStack[key].map((item) => {
              const delay = (globalIndex++ % 16) * 0.035;
              return (
                <div className="tech-tile" key={item} style={{ animationDelay: `${delay}s` }}>
                  <span className="tech-tile__badge">{initials(item)}</span>
                  <span className="tech-tile__name">{item}</span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
export function resolveAsset(path) {
  if (!path) return path;
  const base = import.meta.env.BASE_URL; // "/portfolio/" en dev et en prod
  return `${base}${path.replace(/^\//, "")}`;
}
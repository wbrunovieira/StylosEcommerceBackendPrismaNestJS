import { Slug } from "../../enterprise/entities/value-objects/slug";

export function generateSlug(name: string, brandName: string): Slug {
  const baseSlug = `${name}-${brandName}`
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  const uniqueSuffix = Date.now().toString(36);
  return Slug.createFromText(`${baseSlug}-${uniqueSuffix}`);
}

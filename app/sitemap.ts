import type { MetadataRoute } from "next";

function siteOrigin(): URL | null {
  const configured = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  if (!configured) return null;
  try { return new URL(configured.includes("://") ? configured : `https://${configured}`); } catch { return null; }
}

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = siteOrigin();
  if (!origin) return [];
  const now = new Date();
  return ["/", "/download", "/feedback"].map((path) => ({ url: new URL(path, origin).toString(), lastModified: now }));
}

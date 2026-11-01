export const RELEASES_API = "https://api.github.com/repos/Sampath0411/glance-windows/releases?per_page=20";

export type GlanceRelease = {
  title: string;
  notesUrl: string;
  date: string;
  preview: boolean;
  installer: { name: string; url: string; size: number | null } | null;
};

function allowedReleaseUrl(value: unknown, pathname: RegExp): value is string {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "github.com" && !url.username && !url.password && !url.port && pathname.test(url.pathname);
  } catch {
    return false;
  }
}

export function normalizeRelease(value: unknown): GlanceRelease | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const release = value as Record<string, unknown>;
  const title = typeof release.tag_name === "string" ? release.tag_name.trim() : typeof release.name === "string" ? release.name.trim() : "";
  const date = typeof release.published_at === "string" ? new Date(release.published_at) : null;
  if (!title || !date || Number.isNaN(date.valueOf()) || !allowedReleaseUrl(release.html_url, /^\/Sampath0411\/glance-windows\/releases\/tag\/[^/]+\/?$/)) return null;
  const assets = Array.isArray(release.assets) ? release.assets : [];
  const installer = assets
    .filter((asset): asset is Record<string, unknown> => Boolean(asset) && typeof asset === "object" && !Array.isArray(asset))
    .filter((asset) => typeof asset.name === "string" && /\.exe$/i.test(asset.name))
    .filter((asset) => allowedReleaseUrl(asset.browser_download_url, /^\/Sampath0411\/glance-windows\/releases\/download\/[^/]+\/.+\.exe$/i))
    .sort((a, b) => Number(String(b.name).toLowerCase() === "glancesetup.exe") - Number(String(a.name).toLowerCase() === "glancesetup.exe"))[0];
  return {
    title,
    notesUrl: release.html_url,
    date: date.toISOString(),
    preview: release.prerelease === true,
    installer: installer ? { name: installer.name as string, url: installer.browser_download_url as string, size: typeof installer.size === "number" && installer.size > 0 ? installer.size : null } : null,
  };
}

export function normalizeReleases(payload: unknown): GlanceRelease[] | null {
  if (!Array.isArray(payload)) return null;
  return payload.map(normalizeRelease).filter((release): release is GlanceRelease => release !== null);
}

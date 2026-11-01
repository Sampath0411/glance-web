"use client";

import { useEffect, useState } from "react";
import { normalizeReleases, RELEASES_API, type GlanceRelease } from "@/lib/releases";

const fallback = {
  installer: "https://github.com/Sampath0411/glance-windows/releases/download/v0.1.7/GlanceSetup.exe",
  notes: "https://github.com/Sampath0411/glance-windows/releases/tag/v0.1.7",
};

function releaseDate(value: string) {
  return new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(value));
}

function ReleaseItem({ release }: { release: GlanceRelease }) {
  return <li className="history-item"><div><strong>{release.title}</strong><span>{releaseDate(release.date)} · {release.preview ? "Preview" : "Stable"}</span></div>{release.installer ? <a href={release.installer.url}>Download{release.installer.size ? ` · ${(release.installer.size / 1_000_000).toFixed(1)} MB` : ""}</a> : <span className="unavailable">Windows installer unavailable</span>}<a href={release.notesUrl} target="_blank" rel="noreferrer">Release notes ↗</a></li>;
}

export function ReleaseBrowser() {
  const [releases, setReleases] = useState<GlanceRelease[] | null>(null);
  const [status, setStatus] = useState("Showing the known stable website fallback.");

  useEffect(() => {
    const controller = new AbortController();
    fetch(RELEASES_API, { headers: { Accept: "application/vnd.github+json" }, signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Release request failed");
        return response.json();
      })
      .then((payload: unknown) => {
        const normalized = normalizeReleases(payload);
        if (!normalized) throw new Error("Invalid release response");
        setReleases(normalized);
        setStatus(normalized.length ? "Recent releases loaded from GitHub." : "No releases were returned. The known stable fallback is available below.");
      })
      .catch(() => {
        if (!controller.signal.aborted) setStatus("Could not load GitHub releases. The known stable fallback is available below.");
      });
    return () => controller.abort();
  }, []);

  const featured = releases?.[0];
  return <section className="release-browser" aria-labelledby="release-browser-heading">
    <h2 id="release-browser-heading" className="visually-hidden">GitHub release history</h2>
    <p className="release-status" role="status" aria-live="polite">{status}</p>
    {featured && <article className="release-card release-card--live"><div className="release-card__top"><div><p className="card-index">LATEST GITHUB RELEASE</p><h2>{featured.title}</h2><p>Published {releaseDate(featured.date)} · {featured.preview ? "Preview" : "Stable"}</p></div><span className="release-badge">{featured.preview ? "Preview" : "Stable"}</span></div><div className="release-card__actions">{featured.installer ? <a className="button-primary" href={featured.installer.url}>Download for Windows <span aria-hidden="true">↓</span></a> : <span className="unavailable">Windows installer unavailable</span>}<a className="quiet-link" href={featured.notesUrl} target="_blank" rel="noreferrer">View release notes ↗</a></div></article>}
    <div className="history-fallback"><span>Known stable website fallback · v0.1.7</span><a href={fallback.installer}>Download v0.1.7</a><a href={fallback.notes} target="_blank" rel="noreferrer">Release notes ↗</a></div>
    {releases && releases.length > 1 && <ul className="release-history">{releases.slice(1).map((release) => <ReleaseItem key={`${release.title}-${release.date}`} release={release} />)}</ul>}
    <p className="release-all"><a href="https://github.com/Sampath0411/glance-windows/releases" target="_blank" rel="noreferrer">All GitHub releases ↗</a></p>
  </section>;
}

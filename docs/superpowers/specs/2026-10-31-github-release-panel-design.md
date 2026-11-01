# GitHub Release Panel Design

**Date:** 2026-10-31

## Goal

Make Glance releases easier to browse and download from the website, using a release panel that fits the site's existing light, pale-blue, frosted-card visual language rather than copying the dark reference image literally.

## User experience

- Add a Windows-only release panel to `download.html`.
- Feature the newest GitHub release with its version/tag, publication date, Stable/Preview status, a primary installer download button, and a release-notes link.
- List older available releases in a compact, responsive release history. Each row shows version, publication date, Stable/Preview status, and links to its Windows installer and release notes.
- Use the actual release metadata and `.exe` assets so each download goes to the corresponding GitHub asset.
- Show a clear loading status while release metadata is requested.
- Keep the v0.1.7 installer link available in the panel even after a successful API response. If GitHub cannot be reached or the response is invalid, use the existing v0.1.7 installer as the featured fallback, retain the v0.1.7 notes link and All Releases link, and explain that the live release list could not be loaded.
- If the API returns a valid but empty list, retain the v0.1.7 fallback and explain that no releases were returned.
- If a release has no Windows installer asset, show its release-notes link but no misleading download button.
- Keep the panel accessible: semantic headings/lists/links, visible focus styling, status messaging, and narrow-screen layout without horizontal overflow.

## Data and behavior

- Fetch the public GitHub Releases API for `Sampath0411/glance-windows` from the browser, requesting a bounded recent history (up to 20 releases).
- GitHub's returned ordering is newest first. Use the newest available release as the featured item and render remaining entries as history. Label `prerelease: true` entries as Preview and other entries as Stable.
- Use the release tag/name, `published_at`, `html_url`, and matching `.exe` release asset `name`/`browser_download_url`/`size`. Do not render release Markdown or other API-provided HTML. Insert API strings as text, and only create installer links from valid GitHub release-asset URLs.
- Keep the current v0.1.7 link in the initial HTML as the immediate, no-JavaScript and network-failure fallback. On successful API load, update the featured release and populate history.
- The rest of the static site remains free of runtime network calls; the release panel is the sole exception and requires a graceful fallback.
- Existing homepage download links remain unchanged in this scope; the new dynamic selector is on the Download page.

## Visual direction

- Reuse existing page typography, spacing, button treatments, pale blue surfaces, rounded corners, and subtle frost/gradient styling.
- Create one prominent featured card with the Glance app icon, release metadata, a compact Stable/Preview indicator, and a high-contrast Download for Windows action. Do not add macOS or architecture selectors because Glance currently offers a Windows installer only.
- Place release history below as restrained rows/cards, with the active release visually distinct and older releases easy to scan.
- Preserve responsive behavior: desktop can use a two-column featured card; mobile stacks the icon, metadata, and action.

## Implementation scope

- `download.html`: replace or extend the current static download action area with an initially populated release panel and a history container/status region.
- `assets/css/site.css`: style featured release and history states within the existing site design system.
- `assets/js/site.js`: add the focused GitHub fetch, input validation, DOM rendering, and fallback handling. Keep the implementation isolated from unrelated carousel/video behavior.
- `tests/test_site_release.py` and/or a browser test: verify the static fallback, fetched stable/preview rendering, installer links, missing installer behavior, and API failure fallback.
- `README.md`: document that the Download page fetches public release metadata and uses a static installer fallback.

## Alternatives considered

1. **Curated static release list:** dependable and offline, but requires site edits for each release.
2. **Runtime API only:** automatically current, but an API outage would remove the primary download experience.
3. **Hybrid runtime API with a static v0.1.7 fallback (selected):** automatically shows recent releases when online while retaining a usable installer and release links if the API is unavailable.

## Out of scope

- Deploying the website; the site folder has no configured hosting target or Git remote.
- macOS/Linux release options or platform selection.
- Showing full release-note Markdown inside the site.
- Modifying GitHub releases or assets.

## Verification

- Static checks confirm the HTML contains a working v0.1.7 fallback and a release-history container.
- Browser tests mock GitHub API success (stable, preview, and missing-installer cases) and failure, then verify displayed metadata, safe rendering, links, and fallback behavior.
- Check desktop/mobile layout, keyboard access, loading/error messaging, and absence of browser console errors.

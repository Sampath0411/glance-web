# GitHub Release Panel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Add an automatically refreshed, Windows-only GitHub release browser to the Download page, with a reliable v0.1.7 installer fallback.

**Architecture:** Keep the site static and add one isolated progressive-enhancement controller in `assets/js/site.js`. The initial HTML remains a working v0.1.7 download panel; after load, JavaScript fetches up to 20 public GitHub releases, validates metadata and installer URLs, and renders the newest release plus history. API failure leaves the static installer and release links available.

**Tech Stack:** HTML5, existing CSS/vanilla JavaScript, GitHub Releases REST API, Python 3.12 `unittest`, Playwright.

---

## File map

- `download.html` — add an accessible release panel containing initial v0.1.7 fallback markup, a live status message, a featured release region, and a history list.
- `assets/js/site.js` — add a guarded initializer for the release panel; fetch GitHub release metadata, validate and render safe text/links, and preserve fallback content on failure.
- `assets/css/site.css` — add responsive featured-card, stable/preview badge, status, and history-row styles using existing theme colors, type, buttons, borders, and rounded cards.
- `tests/test_site_release.py` — extend static checks for a no-JavaScript download fallback, release-panel semantics, API endpoint reference, and fallback links.
- `tests/verify_site_browser.py` — extend the existing Playwright smoke test with mocked API success/failure cases and desktop/mobile checks.
- `README.md` — document automatic release-list loading, GitHub dependency, no-JavaScript fallback, and manual fallback update when publishing a new release.
- `docs/superpowers/specs/2026-10-31-github-release-panel-design.md` — approved design specification.

**Site directory:** `C:\Users\sampa\Downloads\glance-windows-site`

**Current fallback installer:** `https://github.com/Sampath0411/glance-windows/releases/download/v0.1.7/GlanceSetup.exe`

**GitHub API:** `https://api.github.com/repos/Sampath0411/glance-windows/releases?per_page=20`

## Task 1: Add failing regression tests for static fallback and panel contract

**Files:**
- Modify: `tests/test_site_release.py`

- [x] **Step 1: Add a static test for usable fallback markup.** Parse `download.html` with the existing `SiteParser` and assert it has a uniquely identified release panel, `role="status"` or `aria-live="polite"` loading region, featured release region, history list container, a v0.1.7 release-notes URL, an All Releases URL, and the exact v0.1.7 installer URL visible before JavaScript runs.
- [x] **Step 2: Add static assertions that the existing security/download facts remain unchanged.** Continue asserting the known release checksum and byte size, bundled-model notice, head-turn disclosure, and demo video path. Assert the static fallback installer is still present even after the new panel is added.
- [x] **Step 3: Run the tests against the current page and confirm the new panel assertions fail.**

Run: `python -m unittest discover -s tests -p test_site_release.py -v`

Expected: new release-panel assertions fail because the page has no release-panel/history containers; existing v0.1.7, model, security, and demo assertions remain passing.

## Task 2: Add semantic HTML with a no-JavaScript download fallback

**Files:**
- Modify: `download.html`
- Test: `tests/test_site_release.py`

- [x] **Step 1: Replace only the current top-level download action area with a release-panel section.** Preserve the existing warning, security disclosures, requirements, demo, and checksum sections. Use a section heading such as “Glance releases”; inside it, include a polite live status element, a featured card initially populated with v0.1.7, and a history list region initially hidden or marked as loading.
- [x] **Step 2: Preserve the exact v0.1.7 installer and notes links in the initial HTML.** Keep the current 92.8 MB/92,826,896-byte value and current SHA-256 nearby. Use the app icon as the card artwork; show the current version and Stable badge. Keep an All Releases link to GitHub and keep the v0.1.7 installer available as a secondary fallback even after successful API loading, so an API item without an installer never removes the known working download. The page remains useful if scripts are disabled.
- [x] **Step 3: Rerun static tests and confirm the fallback and semantics now pass.**

Run: `python -m unittest discover -s tests -p test_site_release.py -v`

Expected: fallback URL and accessible panel structure pass; existing release facts, security wording, and video tests remain passing.

## Task 3: Fetch and render GitHub releases safely

**Files:**
- Modify: `assets/js/site.js`
- Test: `tests/verify_site_browser.py`

- [x] **Step 1: Add mocked API browser cases before implementing the fetch.** In the existing Playwright browser test, intercept `https://api.github.com/repos/Sampath0411/glance-windows/releases?per_page=20` and serve fixtures for a stable release with an EXE, a preview release with an EXE, a release without an EXE, and an empty/malformed response. Add a separate failed-request case. Assert the current page's static fallback still renders before implementation.
- [x] **Step 2: Run the browser test and confirm the new dynamic assertions fail.**

Run: `python tests\verify_site_browser.py`

Expected: the old static fallback smoke checks pass, but dynamic version/history/status assertions fail because the release-panel controller does not exist yet.

- [x] **Step 3: Implement a guarded release-panel initializer in `assets/js/site.js`.** Return immediately when the release panel is absent so homepage and feedback behavior do not change. Fetch the API endpoint with an `Accept: application/vnd.github+json` header and a reasonable timeout using `AbortController`. Treat non-2xx responses, malformed JSON, or a non-array response as failure; on failure retain the existing v0.1.7 markup and update the live status with a readable fallback message. For an empty array, also retain v0.1.7 and report that no releases were returned.
- [x] **Step 4: Validate API values and installer URLs before rendering.** Format version from `tag_name` (falling back to `name`), date from `published_at`, and status from `prerelease`. Find the first `.exe` asset, preferring the exact `GlanceSetup.exe` name when present. Accept installer links only if they are HTTPS links on `github.com` with a release-download path; validate release-notes links as HTTPS GitHub repository release pages. Never insert the release body or API strings with `innerHTML`; populate text using `textContent` and build DOM nodes.
- [x] **Step 5: Render the first release as featured and remaining results in returned newest-first order.** Label prereleases “Preview” and other releases “Stable”. Include version/tag, formatted publication date, installer link when valid, size when available, and release-notes link. For a release with no valid `.exe`, show its release-notes link and a concise “Windows installer unavailable” label, not a broken download button. Limit rendered history to the returned 20 releases.
- [x] **Step 6: Run mocked browser cases and verify stable/preview/missing-installer/error states.**

Run: `python tests\verify_site_browser.py`

Expected: all fixture cases pass; a failed fetch leaves the v0.1.7 installer and release links working; API-provided HTML-like strings display as text and do not create markup; no uncaught page errors.

## Task 4: Style the release panel in the existing Glance theme

**Files:**
- Modify: `assets/css/site.css`
- Verify: `download.html`
- Test: `tests/verify_site_browser.py`

- [x] **Step 1: Add theme-consistent styles for the featured card.** Reuse existing CSS custom properties for ink, muted text, accent, video-frame/surface, spacing, and radii. The desktop featured panel may use a two-column icon/content layout. The icon must fit without distortion; primary download action should remain visually dominant.
- [x] **Step 2: Style status badges and release history.** Give Stable and Preview distinct but restrained treatments with text labels (not color alone). Use keyboard-visible focus styles and clear link affordances for download and notes. Keep older releases visually subordinate to the featured release.
- [x] **Step 3: Add a narrow-screen breakpoint.** Stack the icon, details, and button at mobile widths, wrap long tags/filenames safely, and ensure no horizontal overflow at 390px and 320px viewport widths.
- [x] **Step 4: Run browser layout checks at desktop and mobile sizes.**

Run: `python tests\verify_site_browser.py`

Expected: featured panel and history fit their containers at desktop/mobile viewports; no horizontal scroll; native navigation and focusable links remain available.

## Task 5: Document the release panel and run final verification

**Files:**
- Modify: `README.md`
- Verify: `download.html`, `assets/js/site.js`, `assets/css/site.css`, `tests/test_site_release.py`, `tests/verify_site_browser.py`

- [x] **Step 1: Update `README.md`.** Describe the Download page's public GitHub Releases API request, the list limit, stable/preview labels, and `.exe` asset selection. State that API availability is required for live history, while the initial v0.1.7 installer/notes/All Releases links work without JavaScript or when the API fails. Document that the static fallback must be updated when publishing a release.
- [x] **Step 2: Run the complete static-site regression suite.**

Run: `python -m unittest discover -s tests -p test_site_release.py -v`

Expected: all static regression tests pass.

- [x] **Step 3: Run the Playwright smoke and mocked API scenarios.**

Run: `python tests\verify_site_browser.py`

Expected: homepage and Download page load with no JavaScript errors; current fallback works; stable, preview, missing-installer, empty/invalid payload, and fetch-failure cases match the design; video metadata still loads; release panel fits desktop and mobile.

- [x] **Step 4: Check JavaScript syntax and obsolete/static details.**

Run: `node --check assets\js\site.js`

Expected: no syntax errors. Confirm homepage download links and the v0.1.7 fallback remain unchanged and no unrelated site sections were removed.

- [x] **Step 5: Report the local-only state accurately.** The site folder has no Git remote or hosting configuration. Summarize the changed files and tests, and do not claim the site is deployed.

## Spec coverage and self-review

- Theme-adapted Windows featured release card and release history: Tasks 2 and 4.
- Latest version/date, stable/preview status, installer and release-notes links: Task 3.
- Older release entries and missing-installer handling: Task 3.
- GitHub API loading, validation, safe rendering, and failure fallback: Tasks 1–3.
- Static v0.1.7 fallback and All Releases link: Task 2.
- Accessible status/focus behavior and responsive layout: Tasks 2 and 4.
- README documentation and static/browser verification: Task 5.
- No hosting or release mutation is in scope.

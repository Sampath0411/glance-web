# Glance Next.js Dark Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the static Glance site in place with a polished dark Next.js website, preserve accurate product/release behavior, and verify it for Vercel deployment.

**Architecture:** Use Next.js App Router with shared layouts and static/server-rendered page shells; keep the GitHub release request in a small client component so the v0.1.7 fallback is present in server-rendered HTML. Move current assets under `public/assets`, use the approved official React Bits components in visible roles, and avoid adding analytics or a feedback backend.

**Tech Stack:** Next.js App Router, React, TypeScript, React Bits source components, `motion`, GSAP, Node/npm, Python Playwright, axe-core.

---

## File map

- `package.json`, `package-lock.json`, `tsconfig.json`, `next.config.ts`, `eslint.config.mjs` — Next.js/TypeScript scripts, dependencies, lint configuration, legacy redirects, and security headers.
- `app/layout.tsx`, `app/globals.css` — shared metadata base, global dark design tokens, shared font stack, accessible skip link, and common page styles.
- `app/page.tsx`, `app/download/page.tsx`, `app/feedback/page.tsx`, `app/not-found.tsx` — home, releases/download, honest feedback destination, and branded not-found routes.
- `components/site-header.tsx`, `components/site-footer.tsx`, `components/hero.tsx`, `components/demo-video.tsx`, `components/release-browser.tsx` — reusable navigation/footer and isolated interactive elements.
- `components/react-bits/blur-text.tsx`, `components/react-bits/spotlight-card.tsx`, `components/react-bits/aurora.tsx`, `components/react-bits/animated-content.tsx`, their styles, and `THIRD_PARTY_NOTICES.md` — pinned React Bits source and required license notices.
- `lib/releases.ts` — pure release payload normalization, host/path validation, stable/preview labels, and display helpers; no DOM or React dependency.
- `public/assets/` — existing iconography, product imagery, design assets, and optimized demo video, moved without changing source bytes.
- `app/robots.ts`, `app/sitemap.ts`, `app/icon.png` — search/social crawler essentials and app icon.
- `tests/verify_next_site.py` — production-browser smoke tests, mocked release API states, responsive checks, console/network checks, and axe-core accessibility scan.
- `README.md`, `serve.ps1`, `serve.cmd` — Next.js/Vercel setup and Windows development commands.
- Remove after migration is verified: root `index.html`, `download.html`, and `feedback.html`, plus obsolete `tests/test_site_release.py` and `tests/verify_site_browser.py`; the old static `assets/` directory is moved into `public/assets/` rather than discarded.

**Project directory:** `C:\Users\sampa\Downloads\glance-windows-site`

**Release API:** `https://api.github.com/repos/Sampath0411/glance-windows/releases?per_page=20`

**Working fallback installer:** `https://github.com/Sampath0411/glance-windows/releases/download/v0.1.7/GlanceSetup.exe`

## Execution status (2026-11-01)

- Tasks 1–8 are implemented and verified in the local folder. The production build, ESLint, TypeScript, dependency audit for production dependencies, four project contract tests, and eleven production-browser tests pass.
- React Bits uses the official pinned `Aurora`, `BlurText`, `SpotlightCard`, and `AnimatedContent` sources, adapted for the Next.js client boundary, progressive rendering, reduced motion, and coarse pointers.
- Destination `Sampath0411/glance-web` was confirmed empty (no commits or branch refs) before the authorized push.
- Task 9 remains until the verified initial commit is pushed and the remote ref is confirmed.

## Task 1: Record the current baseline before replacing the static pages

**Files:**
- Verify: `tests/test_site_release.py`
- Verify: `tests/verify_site_browser.py`
- Verify: `index.html`, `download.html`, `feedback.html`, `assets/`

- [ ] **Step 1: Run the current static regression tests.**

Run: `python -m unittest discover -s tests -p test_site_release.py -v`

Expected: all 7 existing tests pass, recording the validated v0.1.7 URL/checksum, disclosure text, and demo-video facts before the migration.

- [ ] **Step 2: Run the existing browser smoke test.**

Run: `python tests\verify_site_browser.py`

Expected: homepage and Download page return HTTP 200, the demo video metadata loads, and there are no uncaught browser page errors.

- [ ] **Step 3: Confirm the optimized demo and app icon are present before moving assets.** Check `assets/demo/glance-demo.mp4` and `assets/icon.png`; do not re-encode, overwrite, or delete the video source.

## Task 2: Bootstrap Next.js and establish failing browser contracts

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `eslint.config.mjs`
- Create: `app/layout.tsx`, `app/page.tsx`, `app/download/page.tsx`, `app/feedback/page.tsx`, `app/not-found.tsx`
- Create: `tests/verify_next_site.py`
- Preserve temporarily: existing static HTML and `assets/`

- [ ] **Step 1: Initialize the package in the existing project root without deleting current site files.** Set the scripts to `dev: next dev`, `build: next build`, `start: next start`, `lint: eslint .`, and `typecheck: tsc --noEmit`. Install the current stable `next`, `react`, `react-dom`, `motion`, TypeScript, React/Node type packages, ESLint/Next config, and `axe-core`.
- [ ] **Step 2: Create minimal App Router route shells.** Each route should return a page-specific `<main>` with an `<h1>` and temporary route label; `not-found.tsx` should render an HTTP not-found page. Keep static pages in place during migration; do not let these route shells erase them.
- [ ] **Step 3: Add the production Playwright harness before implementing the new design.** The Python script starts `npm run start` in the project directory, waits for `http://127.0.0.1:3000/`, opens Chromium, records `pageerror` and console errors, and always terminates its own server process in `finally`.
- [ ] **Step 4: Add route-contract assertions.** Assert `/`, `/download`, and `/feedback` return HTTP 200 with the correct route heading; an unknown path returns 404; `/download.html` and `/feedback.html` redirect to clean paths. Assert direct page-load metadata exists. These assertions must fail against the route shells wherever the content/redirect contract is not yet implemented.
- [ ] **Step 5: Build the route skeleton and run baseline checks.**

Run: `npm run build`

Expected: the minimal Next app compiles. Then run `npm run lint` and `npm run typecheck`; resolve scaffold/config errors before proceeding.

## Task 3: Move assets and build the shared dark design system

**Files:**
- Move: `assets/` → `public/assets/`
- Modify: `app/layout.tsx`, `app/globals.css`
- Create: `components/site-header.tsx`, `components/site-footer.tsx`
- Create: `components/react-bits/blur-text.tsx`, `components/react-bits/spotlight-card.tsx`, `components/react-bits/aurora.tsx`, `components/react-bits/animated-content.tsx` and styles
- Create: `THIRD_PARTY_NOTICES.md`
- Test: `tests/verify_next_site.py`

- [ ] **Step 1: Extend browser tests for the Quiet Premium design system.** On each route assert the page background is dark, the shared header contains working Home/Download/Feedback links, a keyboard skip link is available, and the page has no horizontal overflow at 1440px, 390px, or 320px widths. Run the test and confirm the new design assertions fail against the temporary light route shells.
- [ ] **Step 2: Move the existing `assets` directory into `public/assets` without changing files.** Verify `public/assets/demo/glance-demo.mp4` retains its original 14,867,388-byte size and `public/assets/icon.png` remains readable. Update all new code to use `/assets/...` paths.
- [ ] **Step 3: Create the shared page shell and dark global CSS.** Use charcoal surfaces, restrained silver/blue accent, readable text contrast, responsive max-width/gutters, visible `:focus-visible`, skip-link reveal, and `prefers-reduced-motion` rules. Use a system font stack; do not add a remote font request.
- [ ] **Step 4: Add shared header and footer with real local navigation.** Use semantic `<header>`, `<nav aria-label="Primary">`, `<main>`, and `<footer>` landmarks. Highlight the active page and ensure all nav links work with keyboard and touch.
- [ ] **Step 5: Integrate the approved React Bits components from the pinned official source revision.** Use BlurText for the hero headline, Aurora as the visible hero color field, SpotlightCard on multiple featured cards, and AnimatedContent for selected sections. Preserve the full accessible headline in server-rendered content; Aurora must have a CSS fallback and stop rendering when offscreen, explicitly paused, or reduced motion is requested. Disable its pointer interaction and cap DPR. AnimatedContent must be one-shot and render normally with reduced motion. SpotlightCard intensity must remain at or below `0.12`, with effects disabled on coarse-pointer devices. Include the official MIT + Commons Clause and David Haz copyright notice plus source links/commit in `THIRD_PARTY_NOTICES.md`.
- [ ] **Step 6: Run the production build, lint/typecheck, and theme browser checks.**

Run: `npm run build`

Expected: build, lint, and typecheck pass; route shells show the dark shared shell with no mobile overflow or browser errors.

## Task 4: Build the centered homepage and carry forward accurate disclosures

**Files:**
- Modify: `app/page.tsx`
- Create: `components/hero.tsx`, `components/demo-video.tsx`
- Test: `tests/verify_next_site.py`

- [ ] **Step 1: Add failing homepage assertions.** Assert the centered hero contains a concise Windows face-unlock headline, direct v0.1.7 installer CTA, product demo video with native controls and no autoplay, and a release-notes link. Assert the security section describes forward → left → right → forward, says RGB motion is not proof of a live person and replay may pass, and retains the Windows Hello security comparison.
- [ ] **Step 2: Implement the homepage using the selected centered composition.** Place headline and action first, then the product demo; include concise feature/security summaries and a download CTA. Do not add unverified performance/security claims.
- [ ] **Step 3: Implement `DemoVideo` as a native `<video controls playsInline preload="metadata">`.** Use `/assets/demo/glance-demo.mp4`, a meaningful accessible label, caption, and a link to download the video. Do not autoplay or use a screenshot as poster.
- [ ] **Step 4: Apply Blur Text to the hero only as progressive enhancement.** If reduced motion is enabled or animation initialization fails, retain the normal visible heading and layout. Do not animate informational security copy.
- [ ] **Step 5: Run the homepage browser assertions and review desktop/mobile rendering.**

Run: `python tests\verify_next_site.py`

Expected: `/` renders the correct headline/actions, all security disclosures, a playable user-started demo, and no `pageerror`, console error, failed local asset, or overflow at 320px.

## Task 5: Implement the release browser with a safe static fallback

**Files:**
- Create: `lib/releases.ts`
- Create: `components/release-browser.tsx`
- Modify: `app/download/page.tsx`
- Test: `tests/verify_next_site.py`

- [ ] **Step 1: Add API fixture browser tests before implementing the release browser.** Intercept the releases endpoint and provide: a stable release with `GlanceSetup.exe`; a prerelease; a release with no `.exe`; an invalid external-URL asset; a valid empty array; a non-array response; and a failed request. Assert the static v0.1.7 installer/release-notes/All Releases fallback exists in the initial server-rendered HTML before JavaScript runs.
- [ ] **Step 2: Run the release tests and verify expected failures.**

Run: `python tests\verify_next_site.py`

Expected: route-shell checks pass, but release card/API-state assertions fail because the release feature does not exist yet.

- [ ] **Step 3: Implement pure normalization helpers in `lib/releases.ts`.** Validate object shape, version/tag text, `published_at`, GitHub release notes URLs, `.exe` asset names and URLs, and optional byte sizes. Allow only HTTPS `github.com` URLs with the expected repository release path, no credentials, and no non-standard port. Prefer an exact `GlanceSetup.exe` filename when more than one `.exe` exists. Do not parse/render release Markdown.
- [ ] **Step 4: Implement `ReleaseBrowser` with SSR fallback plus client enhancement.** Initial JSX contains v0.1.7’s direct installer, version, Windows requirements, release-notes URL, and All Releases URL. On mount, fetch up to 20 public releases from GitHub; render the newest valid release as featured and the rest in newest-first history. Keep the static v0.1.7 download link available even after success.
- [ ] **Step 5: Implement readable loading, no-release, invalid-response, request-failure, and missing-installer states.** Empty/failed payloads keep the v0.1.7 featured fallback; a release without a safe installer shows its notes link and an unavailable label instead of a download button. Use `textContent`/React text children and validated links only; never use `dangerouslySetInnerHTML`.
- [ ] **Step 6: Apply Spotlight Card subtly to featured release/limited feature cards.** Keep actions and status readable without hover, avoid ambient animations, and preserve focus/keyboard behavior.
- [ ] **Step 7: Run all mocked release cases, including JavaScript-disabled fallback.**

Run: `python tests\verify_next_site.py`

Expected: stable/preview labels, dates, size, valid download/notes links, no-installer and invalid-host behavior, empty/error fallback, and SSR download links all pass with no browser errors.

## Task 6: Replace feedback form behavior and add branded error/legacy routes

**Files:**
- Modify: `app/feedback/page.tsx`, `app/not-found.tsx`, `next.config.ts`
- Test: `tests/verify_next_site.py`

- [ ] **Step 1: Add failing tests for feedback and 404 behavior.** Assert Feedback describes how to submit via the Glance GitHub Issues page, has no form submission or fake “sent” state, and uses a safe external link. Assert an invalid URL shows the branded 404 with usable Home and Download links.
- [ ] **Step 2: Implement `/feedback` as a focused, honest GitHub Issues destination.** Do not collect data, store credentials, or show a fabricated submission state.
- [ ] **Step 3: Implement the custom not-found page.** Use a clear title/message, shared header/footer, and links to `/` and `/download`.
- [ ] **Step 4: Add permanent redirects from `/download.html` to `/download` and `/feedback.html` to `/feedback`.** Ensure redirect handling does not intercept Next assets or `/assets/...`.
- [ ] **Step 5: Run route, redirect, feedback, and 404 browser tests.**

Run: `python tests\verify_next_site.py`

Expected: clean routes return 200, legacy paths redirect, invalid routes return 404, and no feedback form or fake success behavior remains.

## Task 7: Add SEO, Vercel configuration, and migration documentation

**Files:**
- Modify: `app/layout.tsx`, `app/page.tsx`, `app/download/page.tsx`, `app/feedback/page.tsx`, `next.config.ts`, `README.md`, `serve.ps1`, `serve.cmd`
- Create: `app/robots.ts`, `app/sitemap.ts`, `app/icon.png`
- Remove after verification: root `index.html`, `download.html`, `feedback.html`

- [ ] **Step 1: Add route metadata tests.** Assert unique title/description per route, Open Graph/Twitter metadata, app icon, robots response, sitemap includes `/`, `/download`, `/feedback` and excludes 404, and legacy `.html` paths do not produce duplicate page content.
- [ ] **Step 2: Add metadata with a configurable base URL.** Prefer `NEXT_PUBLIC_SITE_URL`; support Vercel production/project URL environment when set; use localhost in development. Do not hard-code an unknown custom domain. Add per-page titles/descriptions and relevant Open Graph/Twitter card metadata.
- [ ] **Step 3: Add `app/robots.ts` and `app/sitemap.ts`.** Include only public canonical paths and derive absolute URLs from the configured metadata base.
- [ ] **Step 4: Configure security headers in `next.config.ts`.** Set `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: DENY`, a restrictive `Permissions-Policy` that disables camera/microphone/geolocation, and HTTPS-only HSTS. Do not add a CSP that breaks Next’s generated scripts without nonce support.
- [ ] **Step 5: Update Windows local-server scripts and README.** `serve.ps1`/`serve.cmd` should invoke the Next dev server instead of Python’s static server. Document Node/npm prerequisites, `npm install`, `npm run dev`, build/lint/typecheck/browser commands, Vercel import/build settings, clean routes, current release fallback, React Bits notices, no analytics, GitHub Issues feedback, and the domain URL environment variable.
- [ ] **Step 6: Remove old root static HTML pages only after Next routes and redirects pass.** Keep `public/assets` intact; do not delete the original Recordly recording (it is outside the project).
- [ ] **Step 7: Remove the two legacy static-site tests after the new Playwright suite covers their release facts, video checks, and page behavior.** Keep `tests/verify_next_site.py` as the single browser quality entry point.
- [ ] **Step 8: Run metadata/robots/sitemap/security-header/redirect tests.**

Run: `python tests\verify_next_site.py`

Expected: every page has distinct metadata, crawler routes are correct, redirects resolve, required headers exist, and no placeholder domain is emitted.

## Task 8: Full regression, accessibility, and Vercel build verification

**Files:**
- Verify: all `app/`, `components/`, `lib/`, `public/`, `next.config.ts`, `package.json`, `README.md`
- Test: `tests/verify_next_site.py`

- [ ] **Step 1: Extend browser coverage to all pages at desktop, tablet, and 320px mobile widths.** Verify navigation, CTAs, download/release links, video controls, focus visibility, no horizontal scroll, and reduced-motion behavior.
- [ ] **Step 2: Run axe-core on Home, Download, Feedback, and 404.** Configure WCAG 2.2 AA checks; fix critical/serious violations (including low contrast, missing accessible names, landmarks, and heading order) instead of suppressing rules without evidence.
- [ ] **Step 3: Capture and assert page/console/network diagnostics against the production server.** Record uncaught `pageerror`, console errors, failed same-origin requests, and missing images/video; ignore only intentionally mocked GitHub API aborts in the corresponding failure scenario.
- [ ] **Step 4: Run clean production checks.**

```powershell
npm run lint
npm run typecheck
npm run build
python tests\verify_next_site.py
```

Expected: all commands exit 0; route/build output contains no errors; the Playwright report has zero accessibility violations in the agreed scope, zero uncaught browser errors, and no failed critical requests.

- [ ] **Step 5: Review the deployed-build assumptions.** Confirm the standard Next.js Vercel framework preset and `npm run build` are sufficient; do not create Vercel credentials, deploy, or configure domains. GitHub push is handled separately in Task 9.

## Task 9: Push the verified site to the user-provided GitHub repository

**Destination:** `https://github.com/Sampath0411/glance-web.git`

- [ ] **Step 1: Verify no Git repository is already present and inspect the destination default branch/contents.** Do not overwrite a non-empty remote history; if a branch appears before publishing, inspect and reconcile rather than force-push.
- [ ] **Step 2: Add a root `.gitignore` for `node_modules`, `.next`, build output, local env files, and Python caches.** Confirm source, assets, tests, docs, and lockfile are included; do not include secrets or generated artifacts.
- [ ] **Step 3: Initialize Git in the site directory only if it is still not a repository, add the user-provided remote, and create an initial commit only after final verification.**
- [ ] **Step 4: Push the verified branch to the remote default branch.** Never force-push. If remote state or permissions differ from assumptions, stop and report instead of overwriting.

## Spec coverage and self-review

- Next.js App Router, Vercel readiness, clean routes, and `.html` redirects: Tasks 2, 6, and 7.
- Quiet Premium dark theme and centered hero: Tasks 3–4.
- React Bits Aurora/BlurText/SpotlightCard/AnimatedContent and license: Task 3 and `THIRD_PARTY_NOTICES.md`.
- Preserved product/security/password/model facts and user-started video: Task 4.
- Live GitHub release list, safe normalization, and static v0.1.7 fallback: Task 5.
- Honest Feedback-to-GitHub-Issues behavior: Task 6.
- Metadata, social previews, robots, sitemap, icons, security headers, configurable domain: Task 7.
- No analytics/cookies or user-data collection: Tasks 6–7.
- Console, network, responsive, accessibility, and production build audit: Task 8.
- Git push to `Sampath0411/glance-web` is explicitly authorized after verification. Vercel deployment, domain/DNS changes, and Vercel project mutation remain out of scope.

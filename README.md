# Glance for Windows website

Next.js App Router site for Glance, a Windows 11 face-unlock utility. The website is prepared for Vercel but is not connected to a Git repository, domain, or Vercel project.

## Local development

Requirements: Node.js 22+ and npm.

```powershell
npm install
npm run dev
```

Open `http://localhost:3000`. On Windows, `serve.cmd` or `serve.ps1` starts the same Next.js development server. For a production build:

```powershell
npm run lint
npm run typecheck
npm run build
npm run start
python -m unittest discover -s tests -v
python -m unittest tests.verify_next_site -v
```

The browser test suite requires Playwright for Python and an installed Chromium browser. It tests the production server, route redirects, release fallback/API failure, responsive behavior, accessibility, and product disclosures.

## Routes

- `/` — centered product introduction, direct installer link, muted looping demo with a pause/play control, feature highlights, and liveness/security disclosures.
- `/download` — GitHub release browser, stable v0.1.7 fallback, release notes, install requirements, security notices, demo, and checksum.
- `/feedback` — links directly to GitHub Issues. There is no fake submission form or local collection of user data.
- `/download.html` and `/feedback.html` — permanent redirects to the clean routes.

## Release behavior

The Download page requests up to 20 public releases from the GitHub Releases API. It validates release notes and `.exe` asset URLs against the expected GitHub repository; release notes are rendered as text, never as HTML. Previews are labeled separately. If the API is unreachable, malformed, or empty, the static v0.1.7 installer remains available in the server-rendered page.

- **Fallback installer:** `https://github.com/Sampath0411/glance-windows/releases/download/v0.1.7/GlanceSetup.exe`
- **Release notes:** `https://github.com/Sampath0411/glance-windows/releases/tag/v0.1.7`
- **SHA-256:** `D1E30C49FB27F47D079266DDFACF4CBDC0A7959DBBEB3127FF973CA20FAB90CF`

The v0.1.7 installer bundles the face models and license notices. The models are licensed for non-commercial research use; the Glance MIT license does not cover them. The installer is not code-signed. See `/download` for requirements and the Windows SmartScreen note.

## Product disclosures

Glance is less secure than Windows Hello. Its RGB head-motion challenge asks the user to face forward, turn left, turn right, then face forward; this is not proof of a live person, and moved photos or replay videos may still pass. The Windows password fallback applies only to failed in-app checks when opening Your Face or Password. Windows verifies the password; Glance does not save it. It does not apply to Windows unlock.

## Assets, privacy, and metadata

Static files live under `public/assets/`. The optimized product demo is `public/assets/demo/glance-demo.mp4`; it autoplays muted and loops with a single pause/play control, starts paused when reduced motion is preferred, and preloads metadata only. The site has no analytics, tracking pixels, feedback backend, or data-collection form.

The site uses official React Bits `GradientASCII` and `TechText` in the home hero, `Shuffle` on key headings, `GradientWaves` on secondary pages, and `BlurText`, `SpotlightCard`, and `AnimatedContent` for supporting motion and interactive cards. Source revision and license details are documented in `THIRD_PARTY_NOTICES.md`. Text remains readable without JavaScript and animations respect reduced-motion settings; no external React Bits runtime is loaded.

Set `NEXT_PUBLIC_SITE_URL` to the eventual canonical production origin (for example, the custom domain after it is chosen). Vercel's `VERCEL_URL` is used as a fallback when available. Without a configured origin, no sitemap entries are emitted and no placeholder canonical domain is published.

## Vercel

The finished site is intended to be pushed to `https://github.com/Sampath0411/glance-web.git` after final verification. It will not be deployed automatically. After connecting that repository to Vercel, use the **Next.js** framework preset and default `npm run build` command. No custom output directory is needed. Set `NEXT_PUBLIC_SITE_URL` after choosing the production domain.

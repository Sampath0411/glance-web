# Glance Website Next.js Dark Redesign

**Date:** 2026-11-01

## Goal

Replace the existing static Glance marketing site with a polished, responsive, dark-themed Next.js site that is ready to deploy on Vercel, incorporates selected React Bits components, and is verified across its pages and interactive states.

## Decisions

- **Framework and hosting:** Next.js App Router, deployed as a Vercel project. The site folder has no Git repository or Vercel project configured; implementation prepares the app and deployment documentation but does not publish it.
- **Visual system:** Quiet Premium dark theme: warm charcoal surfaces, restrained silver/blue accents, clear typography, low-noise gradients, and limited purposeful motion.
- **Homepage composition:** Centered launch hero, chosen from the visual companion. Place the primary Windows download action before the user-started product demo.
- **Content:** Keep Glance branding and verified product/release/security facts, while improving organization, hierarchy, and copy.
- **React Bits:** Use the actual React Bits source components `Aurora`, `BlurText`, `SpotlightCard`, and `AnimatedContent` in visible, purposeful roles: Aurora is the hero's signature color field, BlurText animates the hero headline, SpotlightCard is used on multiple featured cards, and AnimatedContent introduces selected sections. Use the official TypeScript source pinned to React Bits commit `4dc7b5b7772e1217c8fb8d2a7aa074302180e5b4`. Keep shader cost bounded, disable pointer interaction, honor reduced-motion with a static visual fallback, and include the required MIT + Commons Clause and source attribution.
- **Analytics:** No analytics, tracking pixels, or optional analytics cookies.
- **Feedback:** Replace the fake, non-submitting feedback form with a clear GitHub Issues link.
- **Domain:** No custom domain has been chosen. Keep production origin configurable and avoid hard-coding a temporary canonical URL.

## Site structure and behavior

- `/` — product landing page with shared navigation/footer, centered hero, direct Windows download, the optimized demo with native controls/no autoplay, product feature/security sections, accurate liveness limitations, and a clear CTA.
- `/download` — featured latest release and recent release history, using the public GitHub Releases API. Keep the current v0.1.7 installer, release-notes, and All Releases links in the initial rendered page as a working fallback. Render Stable/Preview labels, dates, and valid Windows `.exe` assets; handle empty, unavailable, malformed, or missing-asset states clearly. Render API content as text, never raw Markdown/HTML.
- `/feedback` — concise feedback page that directs users to the Glance GitHub Issues page; do not collect form data locally or show a false “sent” state.
- A branded not-found page for invalid paths, including a link back home and to Download. Redirect legacy `/download.html` and `/feedback.html` URLs to their clean Next.js routes so existing bookmarks do not break.

Preserve the verified product disclosures: face checks prompt forward → left → right → forward; RGB head motion is not proof of a live person and replay video may pass; the Windows password fallback is only for failed in-app checks of Your Face or Password, Windows verifies it, Glance does not store it, and it does not apply to Windows unlock. Keep the comparison that Glance is less secure than Windows Hello. Continue to state that v0.1.7 bundles face models and include applicable license information.

## React Bits and motion

- Integrate the selected React Bits components as source owned by the site, not as a runtime dependency on the React Bits website.
- Use BlurText on the hero headline; render the full accessible heading immediately so it remains readable if JavaScript/motion initialization fails.
- Use Aurora as a visible hero background and provide a CSS-gradient fallback if WebGL is unavailable. Stop its render loop when offscreen, paused, or reduced motion is requested; disable mouse interaction and cap pixel ratio.
- Use SpotlightCard on multiple feature/release cards with restrained intensity. Effects must not carry information and must be disabled on coarse pointer/reduced-motion contexts.
- Use AnimatedContent on selected below-the-fold sections only, once per entry, and disable transforms/opacity transitions when reduced motion is requested.
- Include required React Bits MIT + Commons Clause attribution/license notice and the pinned source commit in `THIRD_PARTY_NOTICES.md`.

## Vercel and website essentials

- Use Next.js routes and Vercel-compatible build/deploy defaults; preserve direct deep-link access for all pages and the not-found route. Redirect old `.html` paths rather than serving duplicate page content.
- Add per-page title/description, Open Graph/Twitter metadata, favicon/app icons, `robots.txt`, and a sitemap.
- Derive canonical/social absolute URLs from a configurable production URL; do not publish a placeholder or assume a custom domain.
- Add appropriate security headers through Next.js/Vercel configuration without breaking video ranges, static assets, or required GitHub release links.
- Keep the site privacy-friendly: no analytics, tracking, form-data collection, or unneeded consent banner.
- Include a clear README for local development, production build, Vercel project setup, and the environment variable used when the domain is selected.

## Quality and acceptance criteria

- Production build, lint, and TypeScript checks pass.
- Every route loads directly and renders its correct page metadata; invalid routes show the custom 404.
- Browser checks show no uncaught JavaScript exceptions, missing local assets, or failed critical requests.
- GitHub API success, API failure, invalid/empty payload, and missing-installer cases preserve working downloads and readable status messages.
- Download links target the intended GitHub release assets; no unexpected host, URL injection, or unsafe HTML rendering.
- Desktop and mobile layouts work without horizontal overflow; keyboard navigation, visible focus, semantic headings/landmarks, useful image alt text, contrast, and reduced-motion behavior are checked.
- Product video remains user-started with accessible controls and a fallback; no autoplay or third-party runtime embed.
- No claim is made that the site is deployed until the user connects it to a Vercel project/repository.

## Scope and deployment boundaries

- This is one cohesive site migration and quality pass covering the existing Home, Download/Release, and Feedback experience.
- Replace the current website files in place as explicitly requested; the user chose not to preserve the current static version as a separate copy.
- User authorized publishing the finished site to `https://github.com/Sampath0411/glance-web.git`. After all checks pass, initialize/connect the site folder if needed and push the verified work to the repository's default branch. Do not deploy to Vercel, create DNS, add analytics, or add a feedback backend.
- The custom domain can be wired into the configurable URL metadata after the user chooses it.

# React Bits Hero Refresh

**Date:** 2026-11-01

## Goal

Refresh the Glance homepage hero with the user-selected React Bits `GradientASCII` background and `TechText` headline while keeping the product site readable, accessible, responsive, and reliable when JavaScript, WebGL2, or motion is unavailable.

## Approved direction and scope

- Keep the marketing site focused; “use all” means use the selected and relevant React Bits components, not every library demo on the homepage. Keep SpotlightCard and AnimatedContent in their current sections; move BlurText from the replaced hero headline to the closing CTA heading so it remains a purposeful part of the site.
- Replace Aurora as the hero background with GradientASCII, using a restrained blue/cyan palette. Keep the existing dark CSS gradient beneath it as the no-WebGL fallback. Limit the effect to the hero, keep it decorative and non-interactive, and cap rendering cost.
- Render “Face unlock, made simple.” as the full TechText hero headline (visual option A). Use settings that do not require pointer interaction, dragging, click effects, or idle sweeping. Keep an accessible and visible static-text fallback until the canvas is ready, and honor reduced-motion preferences.
- Preserve the current page content, release links, disclosures, and site structure. Do not add a library showcase page or import unrelated React Bits components.

## Hydration warning

The reported mismatch is an extra `data-dex-recorder-ready="true"` attribute on `<html>`, consistent with a browser extension modifying the document before React hydrates. Do not add `suppressHydrationWarning` preemptively. Verify in a clean browser profile with extensions disabled; treat a warning reproducible there as an application defect to diagnose and fix.

## Implementation boundaries

- Add source-owned React Bits components and their CSS under `components/react-bits/`; include source attribution and applicable license information in `THIRD_PARTY_NOTICES.md`.
- Preserve server-rendered semantic page structure and metadata. The title remains an `<h1>` with an accessible name independent of canvas rendering.
- GradientASCII must degrade to the existing CSS background when WebGL2 is unavailable and must not intercept pointer input. Motion and rendering are reduced or stopped under reduced-motion and when offscreen where supported.
- TechText must keep its canvas decorative to assistive technology when a semantic heading is present, avoid competing accessible names, and leave usable static text if canvas drawing cannot initialize.
- Do not modify the existing user change in `next-env.d.ts`.

## Verification and acceptance

- Production build, lint, and TypeScript checks pass.
- Browser checks at desktop and mobile widths verify headline fit, no horizontal overflow, working download CTA, and readable fallback states.
- Verify WebGL2-supported and unsupported behavior, reduced-motion behavior, keyboard navigation, and the accessible H1 name.
- A clean browser run has no uncaught exceptions, failed critical assets, or application-originated hydration warnings. An extension-only `data-dex-recorder-ready` mismatch is not “fixed” by suppressing all root warnings.
- Run the existing route, responsive, accessibility, and console checks.

## Deployment boundary

Do not deploy to Vercel. Push the verified changes to the already authorized GitHub repository only after quality checks pass.

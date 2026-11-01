# React Bits Hero Refresh

**Date:** 2026-11-01

## Goal

Refresh the Glance homepage hero with the user-selected React Bits `GradientASCII` background and `TechText` headline while keeping the product site readable, accessible, responsive, and reliable when JavaScript, WebGL2, or motion is unavailable.

## Approved direction and scope

- Keep the marketing site focused; “use all” means use the selected and relevant React Bits components, not every library demo on the homepage. Keep SpotlightCard and AnimatedContent in their current sections; move BlurText from the replaced hero headline to the closing CTA heading so it remains a purposeful part of the site.
- Replace Aurora as the hero background with GradientASCII, using a restrained blue/cyan palette. Keep the existing dark CSS gradient beneath it as the no-WebGL fallback. Limit the effect to the hero, keep it decorative and non-interactive, and cap rendering cost.
- Render “Face unlock, made simple.” as the full TechText hero headline (visual option A). Use settings that do not require pointer interaction, dragging, click effects, or idle sweeping. Keep an accessible and visible static-text fallback until the canvas is ready, and honor reduced-motion preferences.
- Restyle the shared header as a centered floating pill with rounded corners, translucent dark liquid-glass fill, backdrop blur/saturation, a fine border, and restrained shadow. Keep it readable and within the viewport at desktop and mobile widths; add enough content offset that it never covers page headings.
- Keep the hero and body dark even when the WebGL background is unavailable. Use explicit high-contrast heading colors and retain the CSS gradient as the hero fallback so the light text never sits on white.
- Extend motion beyond the hero: use React Bits Shuffle on key headings across home, download, and feedback; use GradientWaves as a restrained ambient background on the download and feedback routes; and use AnimatedContent to reveal their content sections/cards. Keep the existing GradientASCII/TechText hero and avoid stacking both WebGL backgrounds on the homepage.
- Preserve readable server-rendered text before hydration and when reduced motion is enabled. Shuffle headings should become visible even if animation libraries or browser motion are unavailable; background shaders remain decorative and non-interactive.
- Preserve the current page content, release links, disclosures, and site structure. Do not add a library showcase page or import unrelated React Bits components.

## Hydration warning

The reported mismatch is an extra `data-dex-recorder-ready="true"` attribute on `<html>`, consistent with a browser extension modifying the document before React hydrates. Add `suppressHydrationWarning` only to the root `<html>` element to silence this known extension-only root-attribute mismatch; do not suppress warnings on child components. Also verify with an extension-free browser and investigate any hydration warning that still reproduces there.

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
- A clean browser run has no uncaught exceptions, failed critical assets, or application-originated hydration warnings. The known extension attribute mismatch is suppressed only on `<html>`; child/component hydration warnings remain visible and must be fixed.
- Browser assertions confirm the floating glass header is translucent, rounded, and responsive, and that hero text remains high-contrast over both the normal background and the WebGL fallback.
- Run the existing route, responsive, accessibility, and console checks.

## Deployment boundary

Do not deploy to Vercel. Push the verified changes to the already authorized GitHub repository only after quality checks pass.

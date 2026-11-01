# Hero Branding, Motion, and Demo Player Polish

**Date:** 2026-11-01

## Goal

Polish the homepage identity and hero controls using the user-provided Glance app icon, improve the hero label’s legibility, give arrows and buttons purposeful interaction motion, and remove distracting video chrome and black side margins.

## Approved design

### App icon and hero label

- Use the exact user-provided image at `C:\Users\sampa\AppData\Local\Temp\orca-paste-1793537302347-902d0ef7-9a8d-4996-9c92-14c216dedce5.png` as the Glance app icon; do not redraw it.
- Add the icon beside the Glance wordmark in the shared navigation and as a compact hero brand mark above the eyebrow.
- Replace the existing `/assets/icon.png` site/browser icon with the provided artwork so on-page and browser branding match.
- Put “Made for your Windows PC” on a small translucent pill with brighter white/cyan text and sufficient spacing from the headline.

### Arrows and button motion

- Replace plain arrow glyphs used across the site with consistent inline SVG directional arrows. Keep them decorative to assistive technology.
- Animate arrows and CTA buttons only on hover, keyboard focus, or press: subtle lift/scale and a short arrow slide. Do not animate continuously at rest.
- Preserve clear focus indicators, usable tap targets, and reduced-motion behavior.

### Demo video

- Keep the existing 16:9 demo asset and crop/scale it slightly inside its frame to trim dark side margins without aggressively cutting useful content.
- Autoplay the demo muted and looped on devices/preferences that allow motion; do not show native controls or a timeline.
- Add one accessible pause/play control only. Do not show a video download link or a download control.
- For `prefers-reduced-motion: reduce`, start paused and require the visitor to activate play. Keep meaningful fallback text if video playback is unsupported.

## Accessibility and performance

- Preserve semantic hero heading and descriptive text; the icon is decorative next to the existing accessible Glance brand link.
- Give the custom video toggle an accessible name and pressed/state semantics, support keyboard activation, and keep it visible over the video.
- Keep video muted for autoplay, retain `playsInline`, and handle rejected `play()` promises without unhandled errors.
- Respect reduced motion for autoplay and all interaction transitions; do not add a timeline, downloads, or remote media dependencies.

## Verification

- Add browser coverage for app icon placement and image source, readable hero eyebrow, decorative arrow semantics and button interaction states, muted looping video, hidden native controls/download links, pause/play behavior, and reduced-motion startup.
- Run contract and browser suites, axe accessibility checks, `npm run lint`, `npm run typecheck`, and `npm run build`.
- Do not deploy to Vercel.

## Scope boundaries

- Preserve product copy, release destination links, and the existing video file.
- Do not add persistent/pulsing button animation, autoplay with sound, a scrubber/timeline, or any download affordance for the demo video.
- Do not add an icon library or external runtime; use the supplied asset and local inline SVGs.

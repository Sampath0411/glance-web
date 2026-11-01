# Full-Bleed React Bits Motion Refresh

**Date:** 2026-11-01

## Goal

Make the Glance site feel more immersive and polished by making its React Bits background effects visibly intentional, compacting the floating navigation, and giving the homepage feature cards more depth. Preserve all existing product copy, links, page structure, contrast, and accessibility behavior.

## Approved direction

### Backgrounds and hero

- Make the homepage hero’s React Bits `GradientASCII` background full-bleed across the viewport rather than constrained to the centered content shell.
- Give the animated blue/cyan field enough height to fill at least the initial viewport, with stronger but controlled color and a gradual fade into the dark content below.
- Keep the full-screen blue treatment scoped to the homepage hero. Do not place a fixed animation behind the entire long page.
- Keep React Bits `GradientWaves` as the ambient background on Download and Feedback so those routes retain animated backgrounds without stacking the hero effect.
- Keep background effects decorative, non-interactive, and behind readable content. Preserve CSS fallbacks when WebGL is unavailable.

### Navigation

- Reduce the floating navigation’s vertical height and internal padding while retaining the brand, Product, Download, Feedback, and primary download action.
- Keep the navigation legible, usable on mobile, and visually distinct from the animated background.

### Feature cards and motion

- Retain the dark glass card surfaces, with more visible blue/cyan edge lighting, layered depth, and an enhanced React Bits spotlight effect.
- Keep hover/focus motion restrained and avoid effects that obscure card text or create distracting continuous movement.
- Preserve current card copy and information hierarchy.

## Accessibility and performance

- Maintain readable foreground/background contrast over every animated frame and fallback state.
- Respect `prefers-reduced-motion`; motion must not be required to reveal content or operate controls.
- Keep decorative canvases hidden from assistive technology and out of pointer interaction.
- Keep effects responsive and avoid unnecessarily high rendering quality or device-pixel ratios.

## Verification

- Add or update browser assertions for full-bleed hero background bounds, compact navigation, card styling, mobile overflow, and animated backgrounds on all primary routes.
- Run the existing contract and browser suites, accessibility checks, `npm run lint`, `npm run typecheck`, and `npm run build`.
- Do not deploy to Vercel.

## Scope boundaries

- Do not redesign page copy, add new routes, or change product/security claims.
- Do not extend the full-screen GradientASCII treatment behind the entire homepage scroll; the homepage hero alone receives the full-viewport blue field.
- Do not add React Bits components solely for decoration if the existing GradientASCII, GradientWaves, and SpotlightCard components satisfy the visual direction.

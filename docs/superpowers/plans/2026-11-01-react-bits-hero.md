# React Bits Full-Site Motion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep the dark GradientASCII/TechText homepage hero and extend React Bits motion across the homepage, download, and feedback routes with Shuffle headings, GradientWaves secondary-page ambience, and AnimatedContent reveals.

**Architecture:** Keep isolated React Bits client components under `components/react-bits/`, using the supplied Shuffle and GradientWaves JavaScript+CSS variants. Shuffle enhances server-rendered heading strings, with visible-by-default CSS for no-JS safety; GradientWaves runs only on secondary routes while the home hero keeps GradientASCII. AnimatedContent reveals page sections, with reduced-motion and low-quality shader settings to manage performance. Use Python unittest/Playwright, npm build, ESLint, and TypeScript checks.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript 6, GSAP, WebGL2, Canvas 2D, CSS, Playwright Python, axe-core.

---

## File map

- `components/react-bits/gradient-ascii.tsx` and `gradient-ascii.css` — official React Bits TypeScript WebGL background source at the pinned commit, aligned with the supplied JavaScript variant.
- `components/react-bits/tech-text.tsx` and `tech-text.css` — official React Bits TypeScript canvas wordmark at the pinned commit, with a static fallback and a non-interactive/decorative hero mode.
- `app/page.tsx` — replace the hero Aurora layer with GradientASCII; replace the hero BlurText with TechText; move BlurText to the existing closing CTA heading; preserve page copy, links, sections, and other components.
- `app/globals.css` — keep the CSS hero background as fallback, add the responsive floating liquid-glass header and TechText/fallback layout, and preserve stacking/pointer/reduced-motion behavior.
- `app/layout.tsx` — narrowly suppress the documented extension-injected mismatch on the root `<html>` element only.
- `components/react-bits/shuffle.jsx` and `shuffle.css` — upstream GSAP/ScrollTrigger/SplitText heading animation with static-text-safe default visibility.
- `components/react-bits/gradient-waves.jsx` and `gradient-waves.css` — upstream secondary-page WebGL ambience.
- `app/download/page.tsx` and `app/feedback/page.tsx` — animate headings and content, and add non-interactive GradientWaves backgrounds.
- `tests/test_next_contract.py` — source/attribution/component-use contract.
- `tests/verify_next_site.py` — desktop/mobile, fallback, H1, reduced-motion, accessibility, and console coverage.
- `THIRD_PARTY_NOTICES.md` — include React Bits source pages for GradientASCII and TechText under the existing applicable license text.
- `README.md` — update the React Bits component list and explain visual fallbacks.
- `package.json` / `package-lock.json` — add the upstream-required `@gsap/react` peer integration for Shuffle.
- `docs/superpowers/specs/2026-11-01-react-bits-hero-design.md` — approved scope and accessibility decisions; already committed.

The pre-existing modification to `next-env.d.ts` is user work and must remain untouched and unstaged.

## Task 1: Add failing source and browser contracts

**Files:**
- Modify: `tests/test_next_contract.py`
- Modify: `tests/verify_next_site.py`

- [ ] **Step 1: Update the source contract to require the selected components and preserve the existing purposeful set.** In `test_selected_react_bits_components_are_integrated_and_noticed`, assert source files and homepage imports/usage for `blur-text`, `spotlight-card`, `gradient-ascii`, `tech-text`, and `animated-content`. Do not require Aurora to be rendered by the homepage. Assert the notice file contains `Gradient ASCII`, `Tech Text`, `reactbits.dev/backgrounds/gradient-ascii`, `reactbits.dev/text-animations/tech-text`, and `Commons Clause`.

- [ ] **Step 2: Update the browser contracts before implementation.** In `test_react_bits_effects_are_visible_across_the_page`, replace the Aurora canvas assertion with `.gradient-ascii-container canvas` and `.tech-text-canvas`, assert the H1 contains “Face unlock” and “made simple”, and retain SpotlightCard/AnimatedContent assertions. In `test_react_bits_content_remains_visible_without_javascript`, assert `.tech-text-fallback` is visible and the semantic H1 still contains the full title. Add dedicated tests for WebGL2-unavailable CSS fallback, injection of `data-dex-recorder-ready="true"` before hydration, and the shared floating glass header (fixed, pill-rounded, translucent, backdrop-blurred) with dark body/high-contrast hero text.

- [ ] **Step 3: Run focused tests and confirm the new contract fails for missing implementation.**

Run: `python -m unittest tests.test_next_contract -v`

Expected: existing contracts pass and the new component/source assertions fail because the two selected component files and notice entries do not exist yet.

## Task 2: Implement GradientASCII with graceful fallback

**Files:**
- Create: `components/react-bits/gradient-ascii.tsx`
- Create: `components/react-bits/gradient-ascii.css`
- Modify: `app/page.tsx`
- Modify: `app/globals.css`
- Test: `tests/verify_next_site.py`

- [ ] **Step 1: Add the official GradientASCII TypeScript source as a client component.** Use the source pinned to React Bits commit `4dc7b5b7772e1217c8fb8d2a7aa074302180e5b4`, matching the supplied JavaScript variant. Preserve its WebGL2 shader, resize/intersection observers, context/resource cleanup, and reduced-motion handling. Do not add dependencies or replace the shader with an unrelated implementation.

- [ ] **Step 2: Integrate the new background and CSS fallback.** Replace only the Aurora background wrapper in `app/page.tsx` with a `.hero__gradient-ascii` wrapper rendering GradientASCII. Keep the existing BlurText hero unchanged in this task. In `app/globals.css`, preserve the existing radial/linear gradient values under the new wrapper class, keep the container masked and behind hero content, and set `pointer-events: none`.

- [ ] **Step 3: Run typecheck and the focused fallback test.**

Run: `npm run typecheck`

Expected: TypeScript reports no errors. Then run `npm run build` and `python -m unittest tests.verify_next_site.NextSiteBrowserTests.test_gradient_ascii_webgl_fallback -v`; expected: PASS with WebGL2 available and when the test forces WebGL2 unavailable.

## Task 3: Implement TechText with non-canvas text fallback

**Files:**
- Create: `components/react-bits/tech-text.tsx`
- Create: `components/react-bits/tech-text.css`
- Modify: `app/page.tsx`
- Modify: `app/globals.css`
- Test: `tests/verify_next_site.py`

- [ ] **Step 1: Add the official TechText TypeScript source as a client component.** Use the source pinned to React Bits commit `4dc7b5b7772e1217c8fb8d2a7aa074302180e5b4`, matching the supplied JavaScript variant. Preserve font readiness, responsive canvas sizing, reduced-motion behavior, layout measurement, and cleanup. Add an `interactive` prop defaulting to `true`; when `false`, do not start drag, click-kick, pointer-reveal, or idle-sweep behavior. The hero will pass `interactive={false}`.

- [ ] **Step 2: Add first-render fallback and decorative rendering support.** Render the supplied `text` in a `.tech-text-fallback` span before canvas readiness. Mark that fallback `aria-hidden="true"`; hide it visually only after a successful canvas draw. Support `decorative` mode so the hero canvas wrapper is `aria-hidden="true"` and does not add a competing image role/name. On absent 2D context or when JavaScript is disabled, leave the fallback visible.

- [ ] **Step 3: Integrate TechText into the semantic hero heading.** Keep the full title in a visually-hidden text span inside `<h1 id="hero-title">`; render TechText as a decorative sibling inside that H1 with `interactive={false}`, `reveal="off"`, `selection={false}`, `labels={false}`, `draggable={false}`, `clickKick={false}`, `sweep={false}`, `specks={0}`, and `intro="none"`. Move BlurText to the existing closing CTA `<h2>` using “Ready when you are.” Preserve the remaining page content and all release/disclosure links.

- [ ] **Step 4: Add CSS and verify no-JavaScript fallback.** Position the canvas over the static fallback without shifting the heading. Keep the static fallback visible until a ready marker is set, and keep the canvas transparent/hidden if it cannot draw. Add responsive width/height rules without horizontal overflow. Run `npm run build` and `python -m unittest tests.verify_next_site.NextSiteBrowserTests.test_react_bits_content_remains_visible_without_javascript tests.verify_next_site.NextSiteBrowserTests.test_react_bits_effects_are_visible_across_the_page -v`; expected: the title and fallback are visible when scripts are disabled, and the normal hero renders both selected components.

- [ ] **Step 5: Run TypeScript checks.**

Run: `npm run typecheck`

Expected: PASS; both components retain strict TypeScript types without changing project compiler settings.

## Task 4: Integrate the hero and update notices

**Files:**
- Modify: `app/globals.css`
- Modify: `app/layout.tsx`
- Modify: `THIRD_PARTY_NOTICES.md`
- Modify: `README.md`
- Test: `tests/test_next_contract.py`
- Test: `tests/verify_next_site.py`

- [ ] **Step 1: Make hero fallback and text contrast explicit.** Keep the body and hero background dark below all effects, set the hero heading to an explicit high-contrast light color, and ensure the CSS gradient remains visible without WebGL and before hydration.

- [ ] **Step 2: Implement the floating liquid-glass header.** In `app/globals.css`, make `.site-header` a fixed, centered, viewport-safe pill with translucent dark fill, backdrop blur/saturation, a fine border, and a restrained shadow. Keep the header above page content, preserve the skip link and visible keyboard focus, and verify all nav links/CTA fit at 320px without covering headings.

- [ ] **Step 3: Suppress only the known extension-injected root mismatch.** Add `suppressHydrationWarning` to `<html lang="en">` in `app/layout.tsx`, with no suppression on body or child elements. The injected-attribute browser test must still report any page error or non-root console error.

- [ ] **Step 4: Update React Bits attribution and README.** Keep the existing license/copyright text. Add links to the pinned upstream source files for GradientASCII and TechText and state the revision is `4dc7b5b7772e1217c8fb8d2a7aa074302180e5b4`. Update the README list to name GradientASCII, TechText, BlurText, SpotlightCard, and AnimatedContent; describe CSS and static-text fallbacks. Do not claim Aurora is currently rendered on the homepage.

- [ ] **Step 5: Run focused contracts and browser checks.**

Run: `python -m unittest tests.test_next_contract -v`

Expected: all contract tests pass. Then run `npm run build` followed by `python -m unittest tests.verify_next_site.NextSiteBrowserTests.test_react_bits_effects_are_visible_across_the_page tests.verify_next_site.NextSiteBrowserTests.test_react_bits_content_remains_visible_without_javascript tests.verify_next_site.NextSiteBrowserTests.test_no_uncaught_errors_or_failed_local_assets -v`.

Expected: selected React Bits render, the full H1 remains readable, JS-disabled and WebGL2-disabled fallbacks work, and no browser page/console errors or failed local requests occur.

## Task 5: Verify accessibility, hydration, responsive behavior, and final quality

**Files:**
- Verify: all changed source and test files
- Preserve: `next-env.d.ts`

- [ ] **Step 1: Run complete build, lint, and TypeScript checks.**

Run: `npm run build`

Expected: production build succeeds. Then run `npm run lint` and `npm run typecheck`; expected: both exit successfully.

- [ ] **Step 2: Run the complete project contract suite.**

Run: `python -m unittest tests.test_next_contract -v`

Expected: all contract tests pass.

- [ ] **Step 3: Run the full production browser suite.**

Run: `python -m unittest tests.verify_next_site -v`

Expected: routes, release behavior, desktop/mobile overflow, critical accessibility, reduced motion, JS-disabled content, and no-error/no-failed-local-asset tests pass.

- [ ] **Step 4: Confirm hydration behavior with and without the injected attribute.** Run the targeted browser test in development mode with `data-dex-recorder-ready="true"` injected before hydration; confirm the known root warning is absent. Run production tests in a fresh Chromium context without extensions; confirm there are no application-originated hydration warnings or other console/page errors.

- [ ] **Step 5: Review the final diff and preserve user work.** Run `git status --short` and `git diff --check`; verify `next-env.d.ts` remains unchanged by this work and is not staged. Stage only the implementation, tests, README, and notice files, then commit the verified changes with message `feat: refresh homepage with React Bits hero`.

## Full-site motion additions

- Keep the hero as GradientASCII + TechText; use Shuffle for key section headings instead of duplicating hero effects.
- Use GradientWaves on download and feedback pages only, not layered over the homepage's separate WebGL hero.
- Wrap the home feature grid, download sections, and feedback content in AnimatedContent transitions.
- Use two shuffle passes with staggered slide/flip presets, rerun on hover, and keep reduced-motion text immediately visible.
- Add source links for Shuffle and GradientWaves to `THIRD_PARTY_NOTICES.md`; update README and browser coverage for all three primary routes.

## Scope boundaries

- Do not add every React Bits library component or a showcase page; use the agreed curated set.
- Do not add analytics or remote runtime scripts.
- Do not deploy to Vercel. Push the verified commit to the authorized GitHub repository only after the full quality gate passes.

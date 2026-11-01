# React Bits Hero Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the homepage Aurora/BlurText hero treatment with a resilient GradientASCII background and TechText headline while preserving accessible HTML text, reduced-motion behavior, and the rest of the approved Glance site.

**Architecture:** Add two source-owned client components under `components/react-bits/`. Keep the existing hero CSS gradient as a fallback below GradientASCII; TechText renders its canvas only after initialization and includes visible fallback text, while the enclosing semantic `<h1>` always contains real accessible text. Use the existing Python unittest/Playwright suite, npm build, ESLint, and TypeScript checks; do not add dependencies.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript 6, WebGL2, Canvas 2D, CSS, Playwright Python, axe-core.

---

## File map

- `components/react-bits/gradient-ascii.tsx` and `gradient-ascii.css` — user-supplied React Bits WebGL background source, typed to fit this TypeScript app.
- `components/react-bits/tech-text.tsx` and `tech-text.css` — user-supplied React Bits canvas wordmark with a static fallback and a non-interactive/decorative mode for the hero.
- `app/page.tsx` — replace the hero Aurora layer with GradientASCII; replace the hero BlurText with TechText; move BlurText to the existing closing CTA heading; preserve page copy, links, sections, and other components.
- `app/globals.css` — keep the CSS hero background as fallback, add responsive TechText/fallback layout, stacking, pointer behavior, and reduced-motion-safe presentation.
- `tests/test_next_contract.py` — source/attribution/component-use contract.
- `tests/verify_next_site.py` — desktop/mobile, fallback, H1, reduced-motion, accessibility, and console coverage.
- `THIRD_PARTY_NOTICES.md` — include React Bits source pages for GradientASCII and TechText under the existing applicable license text.
- `README.md` — update the React Bits component list and explain visual fallbacks.
- `docs/superpowers/specs/2026-11-01-react-bits-hero-design.md` — approved scope and accessibility decisions; already committed.

The pre-existing modification to `next-env.d.ts` is user work and must remain untouched and unstaged.

## Task 1: Add failing source and browser contracts

**Files:**
- Modify: `tests/test_next_contract.py`
- Modify: `tests/verify_next_site.py`

- [ ] **Step 1: Update the source contract to require the selected components and preserve the existing purposeful set.** In `test_selected_react_bits_components_are_integrated_and_noticed`, assert source files and homepage imports/usage for `blur-text`, `spotlight-card`, `gradient-ascii`, `tech-text`, and `animated-content`. Do not require Aurora to be rendered by the homepage. Assert the notice file contains `Gradient ASCII`, `Tech Text`, `reactbits.dev/backgrounds/gradient-ascii`, `reactbits.dev/text-animations/tech-text`, and `Commons Clause`.

- [ ] **Step 2: Update the browser contracts before implementation.** In `test_react_bits_effects_are_visible_across_the_page`, replace the Aurora canvas assertion with `.gradient-ascii-container canvas` and `.tech-text-canvas`, assert the H1 contains “Face unlock” and “made simple”, and retain SpotlightCard/AnimatedContent assertions. In `test_react_bits_content_remains_visible_without_javascript`, assert `.tech-text-fallback` is visible and the semantic H1 still contains the full title. Add a dedicated test that forces `HTMLCanvasElement.getContext('webgl2')` to return `null`, then asserts the GradientASCII canvas exists, the hero's CSS fallback background remains, and there are no page errors.

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

- [ ] **Step 1: Add the user-provided GradientASCII source as a client component.** Preserve its WebGL2 shader, resize/intersection observers, context/resource cleanup, and reduced-motion handling. Add TypeScript types for props, shader/program/target helpers, pointer/animation records, and event handlers. Keep defaults bounded (`dpr` capped at 2, existing 8-color maximum); do not add dependencies.

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

- [ ] **Step 1: Add the user-provided TechText source as a client component.** Preserve font readiness, responsive canvas sizing, reduced-motion behavior, layout measurement, and cleanup. Add types for component props, glyph/layout records, pointer events, and canvas contexts. Add an `interactive` prop defaulting to `true`; when `false`, do not start drag, click-kick, pointer-reveal, or idle-sweep behavior. The hero will pass `interactive={false}`.

- [ ] **Step 2: Add first-render fallback and decorative rendering support.** Render the supplied `text` in a `.tech-text-fallback` span before canvas readiness. Mark that fallback `aria-hidden="true"`; hide it visually only after a successful canvas draw. Support `decorative` mode so the hero canvas wrapper is `aria-hidden="true"` and does not add a competing image role/name. On absent 2D context or when JavaScript is disabled, leave the fallback visible.

- [ ] **Step 3: Integrate TechText into the semantic hero heading.** Keep the full title in a visually-hidden text span inside `<h1 id="hero-title">`; render TechText as a decorative sibling inside that H1 with `interactive={false}`, `reveal="off"`, `selection={false}`, `labels={false}`, `draggable={false}`, `clickKick={false}`, `sweep={false}`, `specks={0}`, and `intro="none"`. Move BlurText to the existing closing CTA `<h2>` using “Ready when you are.” Preserve the remaining page content and all release/disclosure links.

- [ ] **Step 4: Add CSS and verify no-JavaScript fallback.** Position the canvas over the static fallback without shifting the heading. Keep the static fallback visible until a ready marker is set, and keep the canvas transparent/hidden if it cannot draw. Add responsive width/height rules without horizontal overflow. Run `npm run build` and `python -m unittest tests.verify_next_site.NextSiteBrowserTests.test_react_bits_content_remains_visible_without_javascript tests.verify_next_site.NextSiteBrowserTests.test_react_bits_effects_are_visible_across_the_page -v`; expected: the title and fallback are visible when scripts are disabled, and the normal hero renders both selected components.

- [ ] **Step 5: Run TypeScript checks.**

Run: `npm run typecheck`

Expected: PASS with no new `any` leakage or DOM typing errors.

## Task 4: Integrate the hero and update notices

**Files:**
- Modify: `THIRD_PARTY_NOTICES.md`
- Modify: `README.md`
- Test: `tests/test_next_contract.py`
- Test: `tests/verify_next_site.py`

- [ ] **Step 1: Update React Bits attribution and README.** Keep the existing license/copyright text. Add links for Gradient ASCII (`https://reactbits.dev/backgrounds/gradient-ascii`) and Tech Text (`https://reactbits.dev/text-animations/tech-text`) and state these sources were integrated from the component source supplied by the user on 2026-11-01. Update the README list to name GradientASCII, TechText, BlurText, SpotlightCard, and AnimatedContent; describe CSS and static-text fallbacks. Do not claim Aurora is currently rendered on the homepage.

- [ ] **Step 2: Run the focused contract and browser tests.**

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

- [ ] **Step 4: Confirm clean-browser hydration behavior.** Run the production browser suite in a fresh Chromium context with no browser extensions. Confirm there are no hydration warnings or uncaught/console errors. Do not add `suppressHydrationWarning` to `<html>`; if the mismatch reproduces without an extension, diagnose the app-generated markup before changing layout code.

- [ ] **Step 5: Review the final diff and preserve user work.** Run `git status --short` and `git diff --check`; verify `next-env.d.ts` remains unchanged by this work and is not staged. Stage only the implementation, tests, README, and notice files, then commit the verified changes with message `feat: refresh homepage with React Bits hero`.

## Scope boundaries

- Do not add every React Bits library component or a showcase page.
- Do not add runtime dependencies, analytics, or remote runtime scripts.
- Do not deploy to Vercel. Push the verified commit to the authorized GitHub repository only after the full quality gate passes.

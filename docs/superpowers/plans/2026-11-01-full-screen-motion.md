# Full-Bleed React Bits Motion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the homepage’s React Bits blue animation fill the initial viewport, compact the floating navigation, and give feature cards a more luminous glass treatment while retaining React Bits backgrounds on secondary routes.

**Architecture:** Keep `GradientASCII`, `GradientWaves`, and `SpotlightCard` as the existing background/card components. Restructure only the homepage hero boundary so its background can bleed to viewport edges while its text and video retain the site’s content width; style the hero backdrop with a viewport-height fade, reduce shared header dimensions, and enhance the existing spotlight-card surfaces. Add browser checks for measurable layout and behavior rather than relying on screenshots alone.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, CSS, React Bits WebGL backgrounds, Playwright Python, axe-core.

---

## File map

- `tests/verify_next_site.py` — browser checks for full-bleed background bounds, compact shared navigation, contrast/accessibility, route backgrounds, and responsive overflow.
- `app/page.tsx` — place hero content in a centered-width inner wrapper while keeping `GradientASCII` as a sibling behind it.
- `app/globals.css` — full-width viewport-height hero background and fade, compact header dimensions, luminous-glass feature card treatments, and mobile adjustments.
- `docs/superpowers/specs/2026-11-01-full-screen-motion-design.md` — approved constraints; implementation must preserve this scope.
- `README.md` — update visual-effect description only if component usage or fallback behavior materially changes.

## Implementation tasks

### Task 1: Add browser regression checks

**Files:**
- Modify: `tests/verify_next_site.py`

- [ ] **Step 1: Add a failing visual-layout test**

Add this test to `NextSiteBrowserTests`:

```python
def test_full_bleed_hero_compact_navigation_and_luminous_cards(self):
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch()
        page = browser.new_page(viewport={"width": 1280, "height": 800})
        page.goto(BASE_URL, wait_until="domcontentloaded")

        background = page.locator(".hero__gradient-ascii")
        bounds = background.evaluate("el => { const r = el.getBoundingClientRect(); return { left: r.left, width: r.width, height: r.height }; }")
        self.assertLessEqual(abs(bounds["left"]), 1)
        self.assertGreaterEqual(bounds["width"], 1278)
        self.assertGreaterEqual(bounds["height"], 798)

        card = page.locator(".info-card").first
        self.assertTrue(card.is_visible())
        card_style = card.evaluate("el => { const s = getComputedStyle(el); return { border: s.borderTopColor, shadow: s.boxShadow }; }")
        self.assertNotEqual(card_style["border"], "rgba(0, 0, 0, 0)")
        self.assertNotEqual(card_style["shadow"], "none")
        self.assertIn("spotlight-card", card.get_attribute("class"))
        browser.close()
```

If the existing SpotlightCard edge element selector differs, assert the public `.spotlight-card` root and inspect its computed `border-color`, `box-shadow`, and background for nontransparent styling instead of coupling the test to internal spans.

- [ ] **Step 2: Run the new test and confirm it fails on the current constrained background**

Run: `python -m unittest tests.verify_next_site.NextSiteBrowserTests.test_full_bleed_hero_compact_navigation_and_luminous_cards -v`

Expected: FAIL because the current `.hero__gradient-ascii` is constrained by the `.shell-page` hero and is shorter than the viewport; the card shadow assertion may also fail.

- [ ] **Step 3: Commit the regression test**

```powershell
git add tests/verify_next_site.py
git commit -m "test: cover full-bleed motion layout"
```

### Task 2: Make the animated homepage hero full-bleed

**Files:**
- Modify: `app/page.tsx`
- Modify: `app/globals.css`
- Test: `tests/verify_next_site.py`

- [ ] **Step 1: Change the hero markup to separate viewport background and centered content**

Remove `shell-page` from the hero section, wrap the hero eyebrow, headings, subtitle, actions, glow, and `DemoVideo` in `<div className="hero__content shell-page">`, and leave `.hero__gradient-ascii` as a direct section child before that wrapper. Preserve the section’s `aria-labelledby`, all IDs, component props, links, and source copy.

- [ ] **Step 2: Set full-bleed and viewport-height background geometry**

Update the relevant CSS rules using these constraints:

```css
.hero { width: 100%; min-height: 100svh; }
.hero__content { position: relative; z-index: 1; width: var(--site-width); margin-inline: auto; }
.hero__gradient-ascii {
  top: 0;
  left: 0;
  width: 100%;
  height: max(100svh, 760px);
  min-height: 100svh;
  transform: none;
  background: radial-gradient(ellipse at 50% 28%, #2465e8a8 0%, #1976d260 35%, #0c3d872b 66%, transparent 88%), linear-gradient(180deg, #102b4d 0%, #101113 96%);
  mask-image: linear-gradient(#000 0%, #000 60%, transparent 100%);
}
```

Tune values to keep the strongest blue behind the hero text while preserving white-text contrast and the dark transition under the video/content. Keep the actual `GradientASCII` component and no-WebGL CSS fallback intact. Update the mobile override so it does not restore the old 120vw constrained geometry.

- [ ] **Step 3: Run the full-bleed browser test**

Run: `python -m unittest tests.verify_next_site.NextSiteBrowserTests.test_full_bleed_hero_compact_navigation_and_luminous_cards -v`

Expected: hero background left edge is at viewport edge, width and height are at least the viewport size, and existing content remains visible.

- [ ] **Step 4: Commit the hero change**

```powershell
git add app/page.tsx app/globals.css
git commit -m "style: make animated hero full bleed"
```

### Task 3: Compact the floating navigation

**Files:**
- Modify: `app/globals.css`
- Test: `tests/verify_next_site.py`

- [ ] **Step 1: Add a failing compact-header assertion**

In the browser test, after the existing desktop viewport checks, add:

```python
header_height = page.locator(".site-header__inner").evaluate("el => el.getBoundingClientRect().height")
self.assertLessEqual(header_height, 58)
for name in ("Product", "Download", "Feedback", "Get Glance"):
    self.assertTrue(page.get_by_role("link", name=name).is_visible(), name)

page.set_viewport_size({"width": 390, "height": 844})
page.reload()
mobile_header_height = page.locator(".site-header__inner").evaluate("el => el.getBoundingClientRect().height")
self.assertLessEqual(mobile_header_height, 52)
for name in ("Product", "Download", "Feedback"):
    self.assertTrue(page.get_by_role("link", name=name).is_visible(), name)
```

Expected before the CSS change: desktop header assertion fails because the current inner height is `66px`.

- [ ] **Step 2: Reduce the header’s dimensions**

Set desktop `.site-header__inner` minimum height to `54px`, reduce `.brand` font size to `19px`, and use `8px 13px` padding for `.header-cta`. Set mobile header inner minimum height to `48px`; preserve the current mobile link gaps or adjust only enough to prevent overflow at 320px. Keep the header fixed, pill-shaped, blurred, and above the hero background.

- [ ] **Step 3: Run the header and responsive browser tests**

Run: `python -m unittest tests.verify_next_site.NextSiteBrowserTests.test_full_bleed_hero_compact_navigation_and_luminous_cards tests.verify_next_site.NextSiteBrowserTests.test_dark_layout_has_no_mobile_horizontal_overflow -v`

Expected: both tests pass at 320, 390, 768, and desktop widths.

- [ ] **Step 4: Commit the navigation change**

```powershell
git add app/globals.css tests/verify_next_site.py
git commit -m "style: compact floating site navigation"
```

### Task 4: Enhance luminous-glass feature cards

**Files:**
- Modify: `app/globals.css`
- Modify: `app/page.tsx`
- Test: `tests/verify_next_site.py`

- [ ] **Step 1: Add a failing card-style assertion**

Extend the browser test to check the first `.info-card` has a translucent/glass-like computed background, a visible border, and a nonzero shadow. Assert the `.spotlight-card` remains present and that its content heading and paragraph remain visible.

- [ ] **Step 2: Increase the existing React Bits spotlight treatment**

For the three existing `SpotlightCard` instances, move the spotlight color from neutral gray-blue to a restrained cyan-blue such as `#66c8ff`, raise `intensity` to `0.2`, set `borderGlow` to `0.24`, and keep `ambient={false}` so the component does not animate continuously at rest. Keep proximity/local pointer interaction and existing focus behavior; do not add another card component or alter card copy.

- [ ] **Step 3: Style the glass surfaces and depth**

Replace the flat opaque card gradient with a subtle cool-tinted translucent surface, a brighter blue/cyan edge gradient or inset highlight, and layered dark shadow. Add a restrained hover lift/border transition only for fine pointers; disable lift/transitions under `prefers-reduced-motion`. Ensure both regular and wide cards retain current grid behavior and text contrast.

- [ ] **Step 4: Run accessibility and visual tests**

Run: `python -m unittest tests.verify_next_site.NextSiteBrowserTests.test_full_bleed_hero_compact_navigation_and_luminous_cards tests.verify_next_site.NextSiteBrowserTests.test_critical_and_serious_accessibility_violations tests.verify_next_site.NextSiteBrowserTests.test_dark_layout_has_no_mobile_horizontal_overflow -v`

Expected: no serious/critical axe violations, no overflow, and luminous card styling is present.

- [ ] **Step 5: Commit the card change**

```powershell
git add app/page.tsx app/globals.css tests/verify_next_site.py
git commit -m "style: add luminous glass feature cards"
```

### Task 5: Final verification and docs

**Files:**
- Modify: `README.md` only if its React Bits description is inaccurate after implementation.
- Test: full existing test suites.

- [ ] **Step 1: Run the full browser and contract suites**

Run: `python -m unittest tests.test_next_contract tests.verify_next_site -v`

Expected: all contract and browser tests pass, including no-JavaScript fallbacks, WebGL fallbacks, accessibility, route behavior, and visual layout.

- [ ] **Step 2: Run project quality gates**

Run: `npm run lint`, `npm run typecheck`, and `npm run build`.

Expected: all commands exit 0. Do not deploy to Vercel.

- [ ] **Step 3: Check the final diff and commit any docs adjustment**

Run: `git diff --check` and inspect `git status --short`. Only update README if an existing claim about the backgrounds or reduced-motion fallback became inaccurate; do not add unrelated documentation changes.

## Self-review against the approved spec

- Full-bleed, at-least-viewport hero background and fade: Task 2.
- Secondary-route React Bits GradientWaves preserved: Task 2 regression coverage and existing route behavior in Task 5.
- Compact responsive navigation: Task 3.
- Dark luminous glass cards and restrained SpotlightCard motion: Task 4.
- Contrast, reduced motion, no-JS/WebGL fallbacks, responsive behavior: Tasks 2, 4, and 5.
- No content changes, extra React Bits components, or Vercel deployment: explicit constraints in Tasks 2, 4, and 5.

# Hero Icon, Arrow, and Demo Player Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the user-provided Glance icon in the navigation, hero, and site icon; improve the hero label; add interaction-only button/arrow motion; and replace native demo controls with a reduced-motion-aware muted loop and pause/play toggle.

**Architecture:** Keep the existing pages and release links. Replace the shared icon asset in place, use Next Image for the two in-page placements, and add one reusable decorative inline-SVG arrow component for UI glyphs. Convert the existing demo component into a small client component that starts muted autoplay only when reduced motion is not requested, exposes one keyboard-accessible pause/play toggle, and never exposes native controls or a download link. Use browser tests to verify real rendered behavior and accessibility.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, CSS, HTML video, Playwright Python, axe-core.

---

## File map

- `tests/verify_next_site.py` — browser assertions for icon placement/asset, hero-label readability, SVG arrow semantics and button interaction states, video behavior, and reduced-motion startup.
- `components/arrow-icon.tsx` — reusable local SVG directions for decorative UI arrows (`up-right`, `down`, and `right`).
- `components/site-header.tsx` — add the compact icon beside the existing accessible Glance brand link and replace its arrow glyph.
- `app/page.tsx` — add a small icon above the hero label; improve label presentation; use decorative SVG arrows for home-page actions while preserving instructional turn arrows in prose.
- `app/download/page.tsx`, `app/feedback/page.tsx`, `components/site-footer.tsx`, `components/release-browser.tsx` — replace decorative arrow glyphs only; retain labels, links, URLs, and semantic turn-sequence arrows.
- `components/demo-video.tsx` — implement muted looping playback, reduced-motion pause, accessible play/pause toggle, and no native/video-download UI.
- `app/globals.css` — icon layout, legible pill label, interaction-only button/arrow motion, video crop, and reduced-motion CSS.
- `public/assets/icon.png` — replace with the user-provided icon artwork.
- `app/layout.tsx` — verify the existing metadata icon path still points to `/assets/icon.png`; only modify if the icon URL requires a path change.

## Tasks

### Task 1: Add icon, arrow, and hero-label tests

**Files:**
- Modify: `tests/verify_next_site.py`

- [ ] **Step 1: Add a failing test for app branding and the hero eyebrow**

Add this test to `NextSiteBrowserTests`:

```python
def test_app_icon_and_hero_label_are_present_and_readable(self):
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch()
        page = browser.new_page(viewport={"width": 1280, "height": 800})
        page.goto(BASE_URL, wait_until="domcontentloaded")

        brand_icon = page.locator(".brand img")
        hero_icon = page.locator(".hero__brand-icon")
        self.assertEqual(brand_icon.get_attribute("src"), "/assets/icon.png")
        self.assertEqual(hero_icon.get_attribute("src"), "/assets/icon.png")
        self.assertTrue(brand_icon.is_visible())
        self.assertTrue(hero_icon.is_visible())
        self.assertTrue(page.locator("link[rel='icon'][href='/assets/icon.png']").count())

        eyebrow = page.locator(".hero .eyebrow")
        self.assertEqual(eyebrow.inner_text(), "Made for your Windows PC")
        style = eyebrow.evaluate("el => { const s = getComputedStyle(el); return { color: s.color, background: s.backgroundColor, fontSize: parseFloat(s.fontSize) }; }")
        self.assertGreaterEqual(style["fontSize"], 13)
        self.assertNotEqual(style["background"], "rgba(0, 0, 0, 0)")
        self.assertNotEqual(style["color"], "rgb(184, 200, 229)")
        browser.close()
```

- [ ] **Step 2: Add a failing test for decorative SVG arrows and interaction motion**

Add a test that checks route markup and button hover behavior:

```python
def test_action_arrows_are_decorative_svgs_with_interaction_motion(self):
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch()
        page = browser.new_page(viewport={"width": 1280, "height": 800})
        for route in ("/", "/download", "/feedback"):
            page.goto(BASE_URL + route, wait_until="domcontentloaded")
            self.assertGreater(page.locator("svg.arrow-icon[aria-hidden='true']").count(), 0, route)
            self.assertNotIn("↗", page.locator("main").inner_text(), route)
        button = page.locator(".hero__actions .button-primary")
        arrow = button.locator("svg.arrow-icon")
        self.assertTrue(arrow.is_visible())
        before = arrow.evaluate("el => getComputedStyle(el).transform")
        button.hover()
        page.wait_for_timeout(250)
        after = arrow.evaluate("el => getComputedStyle(el).transform")
        self.assertNotEqual(after, before)
        page.emulate_media(reduced_motion="reduce")
        page.mouse.move(4, 4)
        button.hover()
        reduced_transform = arrow.evaluate("el => getComputedStyle(el).transform")
        self.assertIn(reduced_transform, ("none", "matrix(1, 0, 0, 1, 0, 0)"))
        browser.close()
```

The home prose still includes meaningful `→` turn-sequence arrows, so this test intentionally checks only `↗` as a decorative UI glyph.

- [ ] **Step 3: Run the focused tests and verify they fail for missing icon/arrow markup**

Run: `python -m unittest tests.verify_next_site.NextSiteBrowserTests.test_app_icon_and_hero_label_are_present_and_readable tests.verify_next_site.NextSiteBrowserTests.test_action_arrows_are_decorative_svgs_with_interaction_motion -v`

Expected: FAIL because the current header and hero do not render `.brand img` or `.hero__brand-icon`.

- [ ] **Step 4: Commit the test-first change**

```powershell
git add tests/verify_next_site.py
git commit -m "test: cover hero branding and arrow affordances"
```

### Task 2: Add the supplied icon and reusable arrow component

**Files:**
- Create: `components/arrow-icon.tsx`
- Modify: `public/assets/icon.png`
- Test: `tests/verify_next_site.py`

- [ ] **Step 1: Copy the exact supplied icon image into the existing public asset path**

Copy `C:\Users\sampa\AppData\Local\Temp\orca-paste-1793537302347-902d0ef7-9a8d-4996-9c92-14c216dedce5.png` to `public/assets/icon.png`, replacing only the previous favicon/app-icon image. Do not alter any unrelated assets.

- [ ] **Step 2: Create a small local decorative SVG arrow component**

Implement `ArrowIcon` with a typed direction prop and no dependency:

```tsx
type ArrowDirection = "up-right" | "down" | "right";

export function ArrowIcon({ direction = "up-right" }: { direction?: ArrowDirection }) {
  const paths: Record<ArrowDirection, string> = {
    "up-right": "M7 17 17 7M8 7h9v9",
    down: "M12 4v15m-6-6 6 6 6-6",
    right: "M5 12h14m-6-6 6 6-6 6",
  };

  return <svg className="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><path d={paths[direction]} /></svg>;
}
```

- [ ] **Step 3: Run TypeScript and the focused icon test**

Run: `npm run typecheck` and `python -m unittest tests.verify_next_site.NextSiteBrowserTests.test_app_icon_and_hero_label_are_present_and_readable -v`.

Expected: the component typechecks; the browser test still fails until the page/header render it.

- [ ] **Step 4: Commit asset and component**

```powershell
git add components/arrow-icon.tsx public/assets/icon.png
git commit -m "feat: add Glance icon and local arrow marks"
```

### Task 3: Integrate icon, hero label, and arrows

**Files:**
- Modify: `components/site-header.tsx`
- Modify: `app/page.tsx`
- Modify: `app/download/page.tsx`
- Modify: `app/feedback/page.tsx`
- Modify: `components/site-footer.tsx`
- Modify: `components/release-browser.tsx`
- Modify: `app/globals.css`
- Test: `tests/verify_next_site.py`

- [ ] **Step 1: Add the icon to the brand link and hero**

Use `next/image` with explicit dimensions for `/assets/icon.png`. Place a 24px icon before the `Glance.` wordmark inside the already labeled brand link. Place a 48px decorative icon in the hero before the eyebrow. Preserve the existing `aria-label="Glance home"`; give these adjacent decorative images empty alt text.

- [ ] **Step 2: Give the hero eyebrow a readable pill treatment**

Style `.hero .eyebrow` with a slightly larger font (at least `13px`), brighter high-contrast text, a translucent blue glass background, subtle border, compact rounded padding, and enough bottom margin to clearly separate it from the headline. Keep the exact label text unchanged.

- [ ] **Step 3: Replace decorative arrow glyphs with `ArrowIcon`**

Use direction `down` for download actions, `up-right` for external/release/detail links, and `right` for the installation/security detail link. Replace only standalone UI arrow glyphs in the files listed above. Keep `→` in the face-forward/turn-left/turn-right instructional sentence as meaningful content.

- [ ] **Step 4: Add interaction-only arrow and button motion**

Add `.arrow-icon` dimensions and a transform transition. On `:hover`, `:focus-visible`, and `:active`, slightly lift primary/secondary/header buttons and translate/rotate their icon by a few pixels. Apply the arrow animation to quiet links with icons. In `@media (prefers-reduced-motion: reduce)`, set transform transitions to none and keep static hover/focus states.

- [ ] **Step 5: Run focused branding, accessibility, and responsive tests**

Run: `npm run build` then `python -m unittest tests.verify_next_site.NextSiteBrowserTests.test_app_icon_and_hero_label_are_present_and_readable tests.verify_next_site.NextSiteBrowserTests.test_critical_and_serious_accessibility_violations tests.verify_next_site.NextSiteBrowserTests.test_dark_layout_has_no_mobile_horizontal_overflow -v`.

Expected: icon/label assertions pass, no serious/critical axe findings, and no horizontal overflow at mobile sizes.

- [ ] **Step 6: Commit the branding and arrows**

```powershell
git add components/site-header.tsx app/page.tsx app/download/page.tsx app/feedback/page.tsx components/site-footer.tsx components/release-browser.tsx app/globals.css
git commit -m "style: polish hero branding and action arrows"
```

### Task 4: Add reduced-motion-aware autoplay and one video toggle

**Files:**
- Modify: `components/demo-video.tsx`
- Modify: `app/globals.css`
- Test: `tests/verify_next_site.py`

- [ ] **Step 1: Add failing browser tests for the demo player contract**

Add this real-media browser test:

```python
def test_demo_video_autoplays_muted_and_has_pause_only_control(self):
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch()
        page = browser.new_page(viewport={"width": 1280, "height": 800})
        page.goto(BASE_URL, wait_until="domcontentloaded")
        video = page.locator(".demo-frame video")
        self.assertTrue(video.get_attribute("muted") is not None)
        self.assertTrue(video.get_attribute("loop") is not None)
        self.assertTrue(video.get_attribute("playsinline") is not None)
        self.assertIsNone(video.get_attribute("controls"))
        self.assertEqual(page.locator("a[href='/assets/demo/glance-demo.mp4']").count(), 0)
        self.assertEqual(page.locator(".demo-frame button").count(), 1)
        page.wait_for_function("el => !el.paused", arg=video.element_handle(), timeout=15000)
        pause = page.get_by_role("button", name="Pause demo video")
        self.assertEqual(pause.get_attribute("aria-pressed"), "true")
        pause.click()
        page.wait_for_function("el => el.paused", arg=video.element_handle())
        play = page.get_by_role("button", name="Play demo video")
        self.assertEqual(play.get_attribute("aria-pressed"), "false")
        play.click()
        page.wait_for_function("el => !el.paused", arg=video.element_handle())

        reduced = browser.new_page(viewport={"width": 1280, "height": 800})
        reduced.emulate_media(reduced_motion="reduce")
        reduced.goto(BASE_URL, wait_until="domcontentloaded")
        reduced_video = reduced.locator(".demo-frame video")
        self.assertTrue(reduced_video.evaluate("el => el.paused"))
        self.assertTrue(reduced.get_by_role("button", name="Play demo video").is_visible())
        browser.close()
```

- [ ] **Step 2: Run the player test and confirm it fails against native controls**

Run: `python -m unittest tests.verify_next_site.NextSiteBrowserTests.test_demo_video_autoplays_muted_and_has_pause_only_control -v`

Expected: FAIL because the current player has native controls, no autoplay, and a download link.

- [ ] **Step 3: Convert `DemoVideo` into a client component with explicit motion preference handling**

Use `useRef<HTMLVideoElement>` and `useState` for play state. In an effect, read `matchMedia('(prefers-reduced-motion: reduce)')`; leave the video paused when true; otherwise call `video.play()` and catch a rejected promise. Listen for `play`, `pause`, and media preference changes, and clean up all listeners. Use `muted`, `loop`, and `playsInline`, omit `controls`, retain `preload="metadata"`, and render no video-download anchor. Keep the caption and provide a meaningful non-link fallback string.

- [ ] **Step 4: Render a single accessible toggle and crop the video slightly**

Render a button with `type="button"`, a live label (`Play demo video` / `Pause demo video`), `aria-pressed`, and a small play/pause SVG. On activation, call `play()` or `pause()` and update from media events. Style the frame with a 16:9 aspect ratio, `overflow:hidden`, and the video with `width:100%`, `height:100%`, `object-fit:cover`, and a conservative scale around `1.04`; tune `object-position` only as needed to retain the main demo content. Keep the toggle visible and keyboard reachable.

- [ ] **Step 5: Respect reduced motion in CSS and browser behavior**

Add a `prefers-reduced-motion: reduce` rule that disables any video-control transitions. Confirm the reduced-motion effect pauses video before playback and requires an explicit Play activation.

- [ ] **Step 6: Run focused player and accessibility tests**

Run: `npm run build` then `python -m unittest tests.verify_next_site.NextSiteBrowserTests.test_demo_video_autoplays_muted_and_has_pause_only_control tests.verify_next_site.NextSiteBrowserTests.test_critical_and_serious_accessibility_violations -v`.

Expected: autoplay/loop/toggle behavior passes in normal motion, reduced motion starts paused, no native timeline/download affordance exists, and axe reports no serious/critical findings.

- [ ] **Step 7: Commit the video change**

```powershell
git add components/demo-video.tsx app/globals.css tests/verify_next_site.py
git commit -m "feat: add accessible looping demo player"
```

### Task 5: Verify all routes and quality gates

**Files:**
- Modify: `README.md` only if its media or motion description becomes inaccurate.
- Test: `tests/test_next_contract.py`, `tests/verify_next_site.py`.

- [ ] **Step 1: Run contract and full browser suites**

Run: `python -m unittest tests.test_next_contract tests.verify_next_site -v`.

Expected: all tests pass, including route links, release downloads, product/security copy, no-JS fallback, WebGL fallback, all-route backgrounds, mobile overflow, player behavior, and accessibility.

- [ ] **Step 2: Run lint and typecheck**

Run: `npm run lint` and `npm run typecheck`.

Expected: both exit 0 with no lint warnings.

- [ ] **Step 3: Run the production build and inspect the diff**

Run: `npm run build` and `git diff --check`; inspect `git status --short` and the final diff. Confirm the video file, release URLs, product text, existing metadata icon path, and `next-env.d.ts` outside this worktree’s changes were not unintentionally modified. Do not deploy to Vercel.

## Self-review against the design spec

- Supplied artwork in header, hero, and browser icon: Tasks 2–3.
- High-contrast hero eyebrow pill: Task 3.
- Consistent decorative UI arrows and interaction-only CTA motion: Tasks 1–3.
- Muted loop, subtle crop, no timeline/download, one pause/play toggle, reduced-motion paused state: Task 4.
- Accessibility, responsive behavior, no remote media/runtime, preserved product content and release links: Tasks 3–5.

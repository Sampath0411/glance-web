"""Production-browser smoke checks for the Next.js site."""

from pathlib import Path
import os
import socket
import subprocess
import time
import unittest

from playwright.sync_api import sync_playwright


SITE = Path(__file__).resolve().parents[1]
BASE_URL = "http://127.0.0.1:3127"


class NextSiteBrowserTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        global BASE_URL
        with socket.socket() as listener:
            listener.bind(("127.0.0.1", 0))
            port = listener.getsockname()[1]
        BASE_URL = f"http://127.0.0.1:{port}"
        cls.server = subprocess.Popen(
            ["node", "node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1", "--port", str(port)],
            cwd=SITE,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
        with sync_playwright() as playwright:
            request = playwright.request.new_context()
            for _ in range(80):
                try:
                    if request.get(BASE_URL, timeout=1000).status == 200:
                        break
                except Exception:
                    time.sleep(0.25)
            else:
                cls.server.terminate()
                raise RuntimeError("Next production server did not start")
            request.dispose()

    @classmethod
    def tearDownClass(cls):
        if os.name == "nt":
            subprocess.run(["taskkill", "/PID", str(cls.server.pid), "/T", "/F"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=False)
        else:
            cls.server.terminate()
        try:
            cls.server.wait(timeout=10)
        except subprocess.TimeoutExpired:
            cls.server.kill()

    def test_routes_and_shared_accessible_navigation(self):
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch()
            page = browser.new_page(viewport={"width": 390, "height": 844})
            for route, heading in (("/", "Face unlock"), ("/download", "Glance releases"), ("/feedback", "Feedback")):
                response = page.goto(BASE_URL + route)
                self.assertEqual(response.status, 200)
                h1 = page.locator("h1")
                shuffle_heading = h1.locator(".shuffle-parent")
                if shuffle_heading.count():
                    page.wait_for_function("el => !!el.getAttribute('aria-label')", arg=shuffle_heading.element_handle())
                rendered_heading = h1.get_attribute("aria-label") or (shuffle_heading.get_attribute("aria-label") if shuffle_heading.count() else None) or h1.inner_text()
                self.assertIn(heading.lower(), rendered_heading.lower())
                self.assertTrue(page.get_by_role("navigation", name="Primary").is_visible())
                self.assertTrue(page.get_by_role("link", name="Skip to content").count())
            browser.close()

    def test_dark_layout_has_no_mobile_horizontal_overflow(self):
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch()
            page = browser.new_page()
            for width in (1440, 768, 390, 320):
                page.set_viewport_size({"width": width, "height": 900})
                for route in ("/", "/download", "/feedback"):
                    page.goto(BASE_URL + route)
                    self.assertLessEqual(
                        page.locator("body").evaluate("el => el.scrollWidth"),
                        page.locator("body").evaluate("el => el.clientWidth"),
                        f"Horizontal overflow at {width}px on {route}",
                    )
            browser.close()

    def test_download_keeps_static_fallback_and_validates_api_assets(self):
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch()
            page = browser.new_page()
            page.route("https://api.github.com/repos/Sampath0411/glance-windows/releases?per_page=20", lambda route: route.fulfill(json={
                "bad": "payload"
            }))
            response = page.goto(BASE_URL + "/download")
            self.assertEqual(response.status, 200)
            fallback = page.get_by_role("link", name="Download v0.1.7")
            self.assertEqual(fallback.get_attribute("href"), "https://github.com/Sampath0411/glance-windows/releases/download/v0.1.7/GlanceSetup.exe")
            self.assertTrue(page.get_by_role("status").count())
            page.wait_for_function("document.querySelector('[role=status]').textContent.includes('Could not load')")
            browser.close()

    def test_github_release_success_preview_and_missing_installer_states(self):
        releases = [
            {"tag_name": "v0.2.0", "html_url": "https://github.com/Sampath0411/glance-windows/releases/tag/v0.2.0", "published_at": "2026-10-20T12:00:00Z", "prerelease": True, "assets": [{"name": "GlanceSetup.exe", "browser_download_url": "https://github.com/Sampath0411/glance-windows/releases/download/v0.2.0/GlanceSetup.exe", "size": 10000000}]},
            {"tag_name": "v0.1.9", "html_url": "https://github.com/Sampath0411/glance-windows/releases/tag/v0.1.9", "published_at": "2026-10-10T12:00:00Z", "prerelease": False, "assets": [{"name": "GlanceSetup.exe", "browser_download_url": "https://github.com/Sampath0411/glance-windows/releases/download/v0.1.9/GlanceSetup.exe", "size": 9000000}]},
            {"tag_name": "v0.1.8", "html_url": "https://github.com/Sampath0411/glance-windows/releases/tag/v0.1.8", "published_at": "2026-10-01T12:00:00Z", "prerelease": False, "assets": []},
            {"tag_name": "v0.1.6", "html_url": "https://github.com/Sampath0411/glance-windows/releases/tag/v0.1.6", "published_at": "2026-09-20T12:00:00Z", "prerelease": False, "assets": [{"name": "unsafe.exe", "browser_download_url": "https://evil.example/unsafe.exe", "size": 5000}]},
        ]
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch()
            page = browser.new_page()
            page.route("https://api.github.com/repos/Sampath0411/glance-windows/releases?per_page=20", lambda route: route.fulfill(json=releases))
            page.goto(BASE_URL + "/download")
            page.wait_for_function("document.querySelector('[role=status]').textContent.includes('loaded from GitHub')")
            self.assertIn("v0.2.0", page.locator(".release-card--live").inner_text())
            self.assertIn("Preview", page.locator(".release-card--live").inner_text())
            self.assertEqual(page.locator(".history-item").count(), 3)
            self.assertEqual(page.locator(".history-item").nth(0).get_by_role("link", name="Download · 9.0 MB").get_attribute("href"), "https://github.com/Sampath0411/glance-windows/releases/download/v0.1.9/GlanceSetup.exe")
            self.assertIn("unavailable", page.locator(".history-item").nth(1).inner_text().lower())
            self.assertFalse(page.locator(".history-item").nth(2).locator("a").filter(has_text="Download").count())
            self.assertTrue(page.get_by_role("link", name="Download v0.1.7").is_visible())
            browser.close()

    def test_empty_release_list_and_javascript_disabled_keep_fallback(self):
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch()
            page = browser.new_page(java_script_enabled=False)
            response = page.goto(BASE_URL + "/download")
            self.assertEqual(response.status, 200)
            self.assertEqual(page.get_by_role("link", name="Download v0.1.7").get_attribute("href"), "https://github.com/Sampath0411/glance-windows/releases/download/v0.1.7/GlanceSetup.exe")
            releases_link = page.get_by_role("link", name="All GitHub releases", exact=True)
            self.assertTrue(releases_link.is_visible())
            self.assertGreater(releases_link.locator("svg.arrow-icon[aria-hidden='true']").count(), 0)
            browser.close()
            browser = playwright.chromium.launch()
            page = browser.new_page()
            page.route("https://api.github.com/repos/Sampath0411/glance-windows/releases?per_page=20", lambda route: route.fulfill(json=[]))
            page.goto(BASE_URL + "/download")
            page.wait_for_function("document.querySelector('[role=status]').textContent.includes('No releases were returned')")
            self.assertTrue(page.get_by_role("link", name="Download v0.1.7").is_visible())
            self.assertFalse(page.locator(".release-card--live").count())
            browser.close()

    def test_security_headers_crawler_routes_and_legacy_redirects(self):
        with sync_playwright() as playwright:
            request = playwright.request.new_context()
            response = request.get(BASE_URL + "/feedback")
            self.assertEqual(response.status, 200)
            self.assertEqual(response.headers.get("x-content-type-options"), "nosniff")
            self.assertEqual(response.headers.get("referrer-policy"), "strict-origin-when-cross-origin")
            self.assertEqual(response.headers.get("x-frame-options"), "DENY")
            self.assertIn("camera=()", response.headers.get("permissions-policy", ""))
            robots = request.get(BASE_URL + "/robots.txt")
            self.assertEqual(robots.status, 200)
            self.assertIn("Allow: /", robots.text())
            with playwright.chromium.launch() as browser:
                page = browser.new_page()
                page.goto(BASE_URL + "/download.html")
                self.assertEqual(page.url, BASE_URL + "/download")
                page.goto(BASE_URL + "/feedback")
                self.assertFalse(page.locator("form").count())
                issues = page.locator("a[href='https://github.com/Sampath0411/glance-windows/issues']")
                self.assertEqual(issues.count(), 1)
                not_found = page.goto(BASE_URL + "/definitely-not-a-page")
                self.assertEqual(not_found.status, 404)
                self.assertIn("Page not found", page.locator("h1").inner_text())
                self.assertTrue(page.get_by_role("link", name="Back to Glance").is_visible())
            request.dispose()

    def test_product_facts_demo_and_password_fallback_are_preserved(self):
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch()
            page = browser.new_page()
            page.goto(BASE_URL)
            page.locator(".disclosure").scroll_into_view_if_needed()
            page.wait_for_timeout(900)
            self.assertIn("turn left", page.locator("main").inner_text().lower())
            self.assertIn("turn right", page.locator("main").inner_text().lower())
            self.assertIn("not proof of a live person", page.locator("main").inner_text().lower())
            video = page.locator("video")
            self.assertEqual(video.count(), 1)
            self.assertIsNone(video.get_attribute("controls"))
            self.assertTrue(video.get_attribute("muted") is not None)
            self.assertTrue(video.get_attribute("loop") is not None)
            self.assertEqual(video.get_attribute("preload"), "metadata")
            self.assertEqual(page.locator("a[href='/assets/demo/glance-demo.mp4']").count(), 0)
            page.goto(BASE_URL + "/download")
            details = (page.locator("main").text_content() or "").lower()
            self.assertIn("bundled", details)
            self.assertIn("for windows to verify", details)
            self.assertIn("does not save it", details)
            self.assertIn("does not apply to windows unlock", details)
            self.assertIn("d1e30c49fb27f47d079266ddfacf4cbdc0a7959dbbeb3127ff973ca20fab90cf", details)
            browser.close()

    def test_critical_and_serious_accessibility_violations(self):
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch()
            page = browser.new_page()
            for route in ("/", "/download", "/feedback", "/definitely-not-a-page"):
                page.goto(BASE_URL + route)
                page.add_script_tag(path=str(SITE / "node_modules" / "axe-core" / "axe.min.js"))
                results = page.evaluate("async () => await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } })")
                serious = [violation for violation in results["violations"] if violation["impact"] in ("critical", "serious")]
                self.assertEqual(serious, [], f"{route}: {[(item['id'], item['help']) for item in serious]}")
            browser.close()

    def test_react_bits_effects_are_visible_across_the_page(self):
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch()
            page = browser.new_page(viewport={"width": 1440, "height": 1000})
            page.goto(BASE_URL)
            page.wait_for_timeout(1200)
            self.assertTrue(page.locator(".gradient-ascii-container canvas").count())
            self.assertTrue(page.locator(".tech-text-canvas").count())
            self.assertGreaterEqual(page.locator(".spotlight-card").count(), 3)
            self.assertGreaterEqual(page.locator(".animated-content").count(), 2)
            hero_heading = page.locator("#hero-title")
            self.assertIn("Face unlock", hero_heading.inner_text())
            self.assertIn("made simple", hero_heading.inner_text())
            first_card = page.locator(".spotlight-card").first
            first_card.scroll_into_view_if_needed()
            box = first_card.bounding_box()
            page.mouse.move(box["x"] + box["width"] / 2, box["y"] + box["height"] / 2)
            page.wait_for_function("Number(getComputedStyle(document.querySelector('.spotlight-card__light')).opacity) > 0.05")
            first_animated = page.locator(".animated-content").first
            first_animated.scroll_into_view_if_needed()
            page.wait_for_function("Number(getComputedStyle(document.querySelector('.animated-content')).opacity) > 0.95")
            self.assertTrue(first_animated.is_visible())
            page.emulate_media(reduced_motion="reduce")
            self.assertTrue(page.evaluate("matchMedia('(prefers-reduced-motion: reduce)').matches"))
            browser.close()

    def test_react_bits_content_remains_visible_without_javascript(self):
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch()
            context = browser.new_context(java_script_enabled=False)
            page = context.new_page()
            page.goto(BASE_URL)
            self.assertIn("Face unlock", page.locator("h1").inner_text())
            self.assertTrue(page.locator(".tech-text-fallback").first.is_visible())
            self.assertTrue(page.locator(".animated-content").first.is_visible())
            self.assertTrue(page.get_by_role("heading", name="A head-turn check is not liveness proof.").is_visible())
            self.assertTrue(page.locator(".info-card--wide").is_visible())
            context.close()
            browser.close()

    def test_home_hero_background_is_full_bleed_and_viewport_height(self):
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch()
            page = browser.new_page(viewport={"width": 1280, "height": 800})
            page.goto(BASE_URL, wait_until="domcontentloaded")

            background = page.locator(".hero__gradient-ascii")
            bounds = background.evaluate("el => { const r = el.getBoundingClientRect(); return { left: r.left, width: r.width, height: r.height }; }")
            self.assertLessEqual(abs(bounds["left"]), 1)
            self.assertGreaterEqual(bounds["width"], 1278)
            self.assertGreaterEqual(bounds["height"], 798)
            browser.close()

    def test_site_header_is_compact_on_desktop_and_mobile(self):
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch()
            page = browser.new_page(viewport={"width": 1280, "height": 800})
            page.goto(BASE_URL, wait_until="domcontentloaded")
            header_height = page.locator(".site-header__inner").evaluate("el => el.getBoundingClientRect().height")
            self.assertLessEqual(header_height, 58)
            primary_nav = page.locator(".primary-nav")
            for name in ("Product", "Download", "Feedback"):
                self.assertTrue(primary_nav.get_by_role("link", name=name, exact=True).is_visible(), name)
            self.assertTrue(page.locator(".site-header").get_by_role("link", name="Get Glance", exact=True).is_visible())

            page.set_viewport_size({"width": 390, "height": 844})
            page.reload()
            mobile_header_height = page.locator(".site-header__inner").evaluate("el => el.getBoundingClientRect().height")
            self.assertLessEqual(mobile_header_height, 52)
            primary_nav = page.locator(".primary-nav")
            for name in ("Product", "Download", "Feedback"):
                self.assertTrue(primary_nav.get_by_role("link", name=name, exact=True).is_visible(), name)
            browser.close()

    def test_feature_cards_use_luminous_glass_surfaces(self):
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch()
            page = browser.new_page(viewport={"width": 1280, "height": 800})
            page.goto(BASE_URL, wait_until="domcontentloaded")
            card = page.locator(".info-card").first
            card.evaluate("el => el.scrollIntoView({ block: 'center' })")
            page.wait_for_function("el => getComputedStyle(el).visibility === 'visible'", arg=card.element_handle())
            self.assertIn("spotlight-card", card.get_attribute("class"))
            self.assertTrue(card.locator("h3").is_visible())
            self.assertTrue(card.locator("p").is_visible())
            style = card.evaluate("el => { const s = getComputedStyle(el); return { border: s.borderTopColor, shadow: s.boxShadow, background: s.backgroundImage }; }")
            self.assertIn("99, 188, 255", style["border"])
            self.assertNotEqual(style["shadow"], "none")
            self.assertIn("linear-gradient", style["background"])
            browser.close()

    def test_react_bits_motion_is_present_on_every_route(self):
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch()
            page = browser.new_page(viewport={"width": 1365, "height": 900})
            for route in ("/", "/download", "/feedback"):
                page.goto(BASE_URL + route, wait_until="domcontentloaded")
                self.assertGreater(page.locator(".shuffle-parent").count(), 0, route)
                self.assertGreater(page.locator(".animated-content").count(), 0, route)
                page.wait_for_function("getComputedStyle(document.querySelector('h1')).visibility === 'visible'")
                self.assertTrue(page.locator("h1").is_visible(), route)
                self.assertLessEqual(page.locator("body").evaluate("el => el.scrollWidth"), 1365, route)
                if route != "/":
                    self.assertTrue(page.locator(".gradient-waves-container").count(), route)
            browser.close()

    def test_floating_glass_navigation_and_dark_hero_contrast(self):
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch()
            page = browser.new_page(viewport={"width": 1280, "height": 900})
            page.goto(BASE_URL)
            header = page.locator(".site-header")
            styles = header.evaluate("""el => {
                const css = getComputedStyle(el);
                return {
                    position: css.position,
                    top: css.top,
                    radius: parseFloat(css.borderTopLeftRadius),
                    background: css.backgroundColor,
                    blur: css.backdropFilter,
                    width: el.getBoundingClientRect().width
                };
            }""")
            self.assertEqual(styles["position"], "fixed")
            self.assertGreaterEqual(styles["radius"], 24)
            self.assertIn("blur(", styles["blur"])
            self.assertTrue(styles["background"].startswith("rgba("))
            self.assertLess(styles["width"], 1280)
            self.assertEqual(page.locator("body").evaluate("el => getComputedStyle(el).backgroundColor"), "rgb(16, 17, 19)")
            self.assertEqual(page.locator("#hero-title").evaluate("el => getComputedStyle(el).color"), "rgb(240, 241, 243)")
            page.set_viewport_size({"width": 320, "height": 740})
            self.assertLessEqual(page.locator("body").evaluate("el => el.scrollWidth"), 320)
            self.assertTrue(page.get_by_role("navigation", name="Primary").is_visible())
            browser.close()

    def test_app_icon_and_hero_label_are_present_and_readable(self):
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch()
            page = browser.new_page(viewport={"width": 1280, "height": 800})
            page.goto(BASE_URL, wait_until="domcontentloaded")
            brand_icon = page.locator(".brand img")
            hero_icon = page.locator(".hero__brand-icon")
            self.assertGreater(brand_icon.count(), 0)
            self.assertGreater(hero_icon.count(), 0)
            page.wait_for_function("[...document.querySelectorAll('.brand img, .hero__brand-icon')].every(icon => icon.complete && icon.naturalWidth > 0)")
            for icon in (brand_icon, hero_icon):
                icon_src = icon.get_attribute("src")
                if icon_src.startswith("/_next/image?"):
                    self.assertIn("icon.png", icon_src)
                else:
                    self.assertEqual(icon_src, "/assets/icon.png")
                self.assertGreater(icon.evaluate("el => el.naturalWidth"), 0)
            self.assertTrue(brand_icon.is_visible())
            self.assertTrue(hero_icon.is_visible())
            self.assertTrue(page.locator("link[rel='icon'][href='/assets/icon.png']").count())
            eyebrow = page.locator(".hero .eyebrow")
            self.assertEqual(eyebrow.inner_text(), "Made for your Windows PC")
            style = eyebrow.evaluate("el => { const s = getComputedStyle(el); return { color: s.color, background: s.backgroundColor, fontSize: parseFloat(s.fontSize), radius: parseFloat(s.borderTopLeftRadius), height: el.getBoundingClientRect().height }; }")
            self.assertGreaterEqual(style["fontSize"], 13)
            self.assertNotEqual(style["background"], "rgba(0, 0, 0, 0)")
            self.assertEqual(style["color"], "rgb(245, 252, 255)")
            self.assertTrue(eyebrow.is_visible())
            self.assertGreaterEqual(style["radius"], style["height"] / 2)
            browser.close()

    def test_action_arrows_are_decorative_svgs_with_interaction_motion(self):
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch()
            page = browser.new_page(viewport={"width": 1280, "height": 800})
            for route in ("/", "/download", "/feedback"):
                page.goto(BASE_URL + route, wait_until="domcontentloaded")
                main_text = page.locator("main").inner_text().lower()
                if route == "/":
                    self.assertIn("face forward → turn left → turn right → face forward", main_text)
                arrow_svgs = page.locator("svg.arrow-icon")
                self.assertGreater(arrow_svgs.count(), 0, route)
                self.assertTrue(all(value == "true" for value in arrow_svgs.evaluate_all("els => els.map(el => el.getAttribute('aria-hidden'))")), route)
                self.assertNotIn("↗", page.locator("body").text_content() or "", route)
                self.assertGreater(page.locator('a:visible svg.arrow-icon[aria-hidden="true"]').count(), 0, route)
            page.goto(BASE_URL, wait_until="domcontentloaded")
            expected_paths = (
                (".hero__actions .button-primary", "M12 4v15m-6-6 6 6 6-6"),
                (".hero__actions .quiet-link", "M7 17 17 7M8 7h9v9"),
                (".info-card--wide .quiet-link", "M5 12h14m-6-6 6 6-6 6"),
            )
            for control, expected_path in expected_paths:
                with self.subTest(control=control):
                    self.assertEqual(page.locator(f"{control} svg.arrow-icon path").get_attribute("d"), expected_path)
            cta = page.locator(".hero__actions a.button-primary")
            self.assertTrue(cta.is_visible())
            arrow = cta.locator("svg.arrow-icon")
            self.assertTrue(arrow.is_visible())
            cta.hover()
            page.wait_for_function("el => { const t = getComputedStyle(el).transform; return t !== 'none' && t !== 'matrix(1, 0, 0, 1, 0, 0)'; }", arg=arrow.element_handle())
            page.emulate_media(reduced_motion="reduce")
            page.mouse.move(4, 4)
            cta.hover()
            page.wait_for_function("el => { const a = el.closest('a.button-primary'); const identity = t => t === 'none' || t === 'matrix(1, 0, 0, 1, 0, 0)'; return a?.matches(':hover') && identity(getComputedStyle(a).transform) && identity(getComputedStyle(el).transform); }", arg=arrow.element_handle())
            browser.close()

    def test_extension_injected_root_attribute_does_not_crash_production_hydration(self):
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch()
            page = browser.new_page()
            errors = []
            page.add_init_script("""(() => {
                const inject = () => document.documentElement?.setAttribute('data-dex-recorder-ready', 'true');
                if (document.documentElement) inject();
                else {
                    const observer = new MutationObserver(() => {
                        if (document.documentElement) {
                            inject();
                            observer.disconnect();
                        }
                    });
                    observer.observe(document, { childList: true, subtree: true });
                }
            })();""")
            page.on("pageerror", lambda error: errors.append(str(error)))
            page.on("console", lambda message: errors.append(message.text) if message.type == "error" else None)
            response = page.goto(BASE_URL)
            self.assertEqual(response.status, 200)
            self.assertEqual(page.locator("html").get_attribute("data-dex-recorder-ready"), "true")
            page.wait_for_timeout(400)
            self.assertEqual(errors, [])
            browser.close()

    def test_gradient_ascii_webgl_fallback(self):
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch()
            page = browser.new_page()
            page.add_init_script("""
                const originalGetContext = HTMLCanvasElement.prototype.getContext;
                HTMLCanvasElement.prototype.getContext = function (type, ...args) {
                    if (type === 'webgl2') return null;
                    return originalGetContext.call(this, type, ...args);
                };
            """)
            page_errors = []
            page.on("pageerror", lambda error: page_errors.append(str(error)))
            response = page.goto(BASE_URL)
            self.assertEqual(response.status, 200)
            self.assertTrue(page.locator(".gradient-ascii-container canvas").count())
            background = page.locator(".hero__gradient-ascii").evaluate("el => getComputedStyle(el).backgroundImage")
            self.assertIn("radial-gradient", background)
            self.assertEqual(page_errors, [])
            browser.close()

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

    def test_no_uncaught_errors_or_failed_local_assets(self):
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch()
            page = browser.new_page()
            page_errors = []
            console_errors = []
            failed_local = []
            page.on("pageerror", lambda error: page_errors.append(str(error)))
            page.on("console", lambda message: console_errors.append(message.text) if message.type == "error" else None)
            page.on("requestfailed", lambda request: failed_local.append((request.url, request.failure)) if request.url.startswith(BASE_URL) and request.failure != "net::ERR_ABORTED" else None)
            for route in ("/", "/download", "/feedback"):
                page.goto(BASE_URL + route, wait_until="domcontentloaded")
                if route == "/":
                    page.wait_for_function("document.querySelector('video').readyState >= 1")
            self.assertEqual(page_errors, [])
            self.assertEqual(console_errors, [])
            self.assertEqual(failed_local, [])
            browser.close()


if __name__ == "__main__":
    unittest.main()

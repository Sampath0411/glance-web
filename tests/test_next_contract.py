import json
from pathlib import Path
import unittest


SITE = Path(__file__).resolve().parents[1]


class NextProjectContractTests(unittest.TestCase):
    def test_package_defines_next_build_and_quality_commands(self):
        package_path = SITE / "package.json"
        self.assertTrue(package_path.is_file(), "Next package.json is not configured")
        if not package_path.is_file():
            return
        package = json.loads(package_path.read_text(encoding="utf-8"))
        scripts = package["scripts"]
        self.assertEqual(scripts["dev"], "next dev")
        self.assertEqual(scripts["build"], "next build")
        self.assertEqual(scripts["start"], "next start")
        self.assertEqual(scripts["lint"], "eslint .")
        self.assertEqual(scripts["typecheck"], "tsc --noEmit")

    def test_app_router_has_all_pages_and_not_found_route(self):
        for relative_path in (
            "app/layout.tsx",
            "app/page.tsx",
            "app/download/page.tsx",
            "app/feedback/page.tsx",
            "app/not-found.tsx",
            "next.config.ts",
            "tsconfig.json",
            "eslint.config.mjs",
        ):
            with self.subTest(path=relative_path):
                self.assertTrue((SITE / relative_path).is_file())

    def test_turbopack_root_is_confined_to_the_site_directory(self):
        config = (SITE / "next.config.ts").read_text(encoding="utf-8")
        self.assertIn("root: process.cwd()", config)

    def test_selected_react_bits_components_are_integrated_and_noticed(self):
        home = (SITE / "app" / "page.tsx").read_text(encoding="utf-8")
        for component in ("blur-text", "spotlight-card", "aurora", "animated-content"):
            with self.subTest(component=component):
                self.assertTrue((SITE / "components" / "react-bits" / f"{component}.tsx").is_file())
                self.assertIn(component, home.lower())
        notices = SITE / "THIRD_PARTY_NOTICES.md"
        self.assertTrue(notices.is_file())
        notice_text = notices.read_text(encoding="utf-8")
        self.assertIn("Commons Clause", notice_text)
        self.assertIn("David Haz", notice_text)

    def test_screenshot_tool_targets_next_public_assets(self):
        source = (SITE / "tools" / "capture-app-shots.py").read_text(encoding="utf-8")
        self.assertIn('OUT = HERE / "public" / "assets" / "app"', source)


if __name__ == "__main__":
    unittest.main()

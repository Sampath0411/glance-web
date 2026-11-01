# Glance Website Release and Demo Video Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Update the static Glance site for v0.1.7, replace app screenshot galleries with the supplied demo video, and disclose current head-turn liveness behavior.

**Architecture:** Keep the dependency-free static site and local asset model. Encode a web-sized copy of the supplied recording once, reuse the same native HTML5 video player on the homepage and Download page, and update release metadata in the static markup. Add lightweight Python standard-library tests for release links, page content, and shared video references; verify playback through the existing local server.

**Tech Stack:** HTML5, existing CSS/JavaScript, FFmpeg, Python 3.12 `unittest`, PowerShell local server.

---

## File map

- `assets/demo/glance-demo.mp4` — new optimized H.264 demo video; source recording remains untouched.
- `index.html` — replace the screenshot carousel with an accessible native video player; update direct download URL and security copy.
- `download.html` — publish v0.1.7 size/hash/release links; replace screenshots with the same demo player; correct bundled-model and liveness disclosures.
- `assets/css/site.css` — style the shared responsive demo player and remove obsolete app-gallery / page-shot styles only after confirming no remaining uses.
- `assets/js/site.js` — remove screenshot carousel behavior and stale gallery references; leave unrelated design/security carousel/video behavior intact.
- `README.md` — document the current release facts and demo-video asset, removing old screenshot regeneration instructions for screenshots no longer displayed.
- `tests/test_site_release.py` — standard-library HTML/content regression checks requiring no third-party test dependencies.
- `docs/superpowers/specs/2026-10-31-website-release-and-video-design.md` — approved website design.

**Site directory:** `C:\Users\sampa\Downloads\glance-windows-site`

**Source video:** `C:\Users\sampa\AppData\Roaming\Recordly\recordings\recording-1793378950951.mp4`

### Task 1: Add failing static-site release tests

**Files:**
- Create: `tests/test_site_release.py`

- [x] **Step 1: Add tests for v0.1.7 release data and screenshot replacement.** Use `pathlib` and `html.parser.HTMLParser`; parse `index.html` and `download.html`. Assert the homepage direct download link and Download-page direct link both target `https://github.com/Sampath0411/glance-windows/releases/download/v0.1.7/GlanceSetup.exe`; the Download page shows version `0.1.7`, exact byte size `92,826,896`, and SHA-256 `D1E30C49FB27F47D079266DDFACF4CBDC0A7959DBBEB3127FF973CA20FAB90CF`; both pages contain one `video.demo-video` referencing `assets/demo/glance-demo.mp4`; old `assets/app/*.png` paths and `hero-gallery` markup are absent from their product demo sections; and links to release notes point to `/releases/tag/v0.1.7`.
- [x] **Step 2: Add tests for accurate release and security copy.** Assert `download.html` says the 0.1.7 installer includes the face models and no longer says models are downloaded on first launch. Assert both pages explain the forward → left → right → forward head-turn challenge and state RGB motion is not proof of a live person and replay video may still pass.
- [x] **Step 3: Run the tests and verify they fail against the current v0.1.2 pages.**

Run: `python -m unittest discover -s tests -p test_site_release.py -v`

Expected: failures identify the stale v0.1.2 links, old screenshot markup, old checksum/size, and inaccurate model/security copy.

### Task 2: Create and validate the web-optimized video copy

**Files:**
- Create: `assets/demo/glance-demo.mp4`

- [x] **Step 1: Create `assets/demo` and encode a new copy.** Do not modify, move, or delete the source recording. Use H.264 at 1280×720/30 fps, 3 Mbps target video bitrate, no audio stream (the source contains no audio), and fast-start MP4 metadata:

```powershell
New-Item -ItemType Directory -Force assets\demo | Out-Null
ffmpeg -i "C:\Users\sampa\AppData\Roaming\Recordly\recordings\recording-1793378950951.mp4" -vf "scale=1280:720,fps=30" -c:v libx264 -preset medium -b:v 3000k -maxrate 3500k -bufsize 6000k -an -movflags +faststart assets\demo\glance-demo.mp4
```

- [x] **Step 2: Verify output metadata and target size.**

Run: `ffprobe -v error -show_entries format=duration,size:stream=codec_name,width,height,r_frame_rate -of json assets/demo/glance-demo.mp4`

Expected: H.264, 1280×720, 30 fps, approximately 78 seconds, and file size between 14 MB and 40 MB. If the first encode is outside that size range, adjust the target bitrate (not the source) and repeat the encode.

- [x] **Step 3: Confirm the source video is unchanged.**

Run: `Get-FileHash "C:\Users\sampa\AppData\Roaming\Recordly\recordings\recording-1793378950951.mp4" -Algorithm SHA256`

Expected: source still exists and can be hashed after encoding.

### Task 3: Replace screenshot displays with the shared accessible video player

**Files:**
- Modify: `index.html`
- Modify: `download.html`
- Modify: `assets/css/site.css`
- Modify: `assets/js/site.js`
- Test: `tests/test_site_release.py`

- [x] **Step 1: Replace the homepage `#hero-gallery` image carousel with one `<video>` player.** Keep the existing hero frame geometry, but use `class="demo-video"`, `controls`, `playsinline`, `preload="metadata"`, `aria-label="Glance for Windows product demo"`, and a `<source>` pointing to `assets/demo/glance-demo.mp4`. Add readable fallback text and a direct link to the MP4. Do not autoplay and do not use an app screenshot as a poster. Remove the old carousel dots/captions that depended on screenshots.
- [x] **Step 2: Replace the Download page’s four `figure.page__shot` screenshots with the same video player and a concise caption.** Use the same path, controls, preload behavior, accessible label, and fallback link as the homepage.
- [x] **Step 3: Add focused responsive styling for `.demo-video` within the existing rounded video frame and Download page section.** Ensure the player fills its container, keeps a 16:9 ratio, clips to the established rounded corners, remains keyboard-operable through native controls, and does not overflow at mobile widths.
- [x] **Step 4: Remove only code made obsolete by the screenshot carousel.** Delete the `#hero-gallery` auto-advance/dot/caption setup from `assets/js/site.js` and remove unused hero-gallery CSS if no references remain. Do not remove navbar/security carousel or the design demonstration video logic.
- [x] **Step 5: Run focused static tests and check for leftover screenshot-section references.**

Run: `python -m unittest discover -s tests -p test_site_release.py -v`

Expected: screenshot replacement and common video-path assertions pass; any remaining failures concern release facts/copy addressed in Task 4.

Run: `rg -n "hero-gallery|page__shot|assets/app/" index.html download.html assets/js/site.js`

Expected: no old app screenshot carousel or download screenshot markup remains. Other uses of app artwork elsewhere on the homepage are outside the two specified product screenshot areas.

### Task 4: Publish correct v0.1.7 facts and security guidance in site copy

**Files:**
- Modify: `index.html`
- Modify: `download.html`
- Modify: `README.md`
- Test: `tests/test_site_release.py`

- [x] **Step 1: Update homepage download buttons to the exact v0.1.7 installer URL.** Add a nearby “v0.1.7 · Windows 11 · 64-bit” cue and a release-notes link without changing the existing visual hierarchy.
- [x] **Step 2: Update the Download page release block.** Show `v0.1.7`, installer size `92.8 MB (92,826,896 bytes)`, the exact SHA-256, a PowerShell hash command using `GlanceSetup.exe`, a primary link to the installer, and a secondary link to the v0.1.7 release notes.
- [x] **Step 3: Correct first-run/model copy.** State that the v0.1.7 installer bundles the face models and licenses; do not claim that first launch downloads the models or quote the old 16 MB download.
- [x] **Step 4: Update security copy.** Describe the prompted forward → left → right → forward challenge. Do not claim head motion proves a live human or defeats all photo/video replay attacks. Retain the warning that Glance is less secure than Windows Hello.
- [x] **Step 5: Update `README.md` release and asset documentation.** Replace v0.1.2 URL, size, and checksum with the verified 0.1.7 values; document the new shared video asset and remove obsolete instructions to regenerate screenshots for the page.
- [x] **Step 6: Run all static-site tests.**

Run: `python -m unittest discover -s tests -p test_site_release.py -v`

Expected: all tests PASS.

### Task 5: Local browser and release-link verification

**Files:**
- Verify: `index.html`, `download.html`, `assets/demo/glance-demo.mp4`, `README.md`

- [x] **Step 1: Start the existing local site server.**

Run: `powershell -ExecutionPolicy Bypass -File .\serve.ps1`

Expected: server reports `http://localhost:8817/`.

- [x] **Step 2: Verify the homepage.** Open `http://localhost:8817/`; confirm no screenshot auto-rotation remains, the video is user-started, controls work, it fits mobile and desktop widths, and both Download/release links work.
- [x] **Step 3: Verify the Download page.** Open `http://localhost:8817/download.html`; confirm the v0.1.7 version, installer size, SHA-256, bundled-model notice, head-turn disclosure, and shared video player are visible and correct.
- [x] **Step 4: Verify static release metadata against GitHub.** Confirm the release asset still exists at the written URL and that the displayed SHA-256 and byte size match the published `GlanceSetup.exe`.
- [x] **Step 5: Report the local site folder and deployment limitation.** The website directory has no `.git` remote or hosting configuration; report that local changes are ready, but do not claim the live site was deployed.

## Spec coverage and self-review

- Shared video in both screenshot locations, preserving source and adding native controls: Tasks 2–3.
- v0.1.7 direct download/release links, byte size and SHA-256: Tasks 1 and 4–5.
- Correct bundled-model notice: Tasks 1 and 4.
- Accurate head-turn wording and replay limitation: Tasks 1 and 4.
- README release/video documentation: Task 4.
- Local playback and deployment-state verification: Task 5.
- No scope requires a separate subsystem plan; website hosting/deployment is intentionally out of scope until a repository or deploy target is provided.

# Glance Website v0.1.7 Release and Demo Video Design

**Date:** 2026-10-31

## Goal
Update the local static Glance website for the 0.1.7 release and replace the product screenshot showcases with the maintainer-provided Glance demo video.

## Scope
- Update the homepage hero and Download page to use one shared, self-hosted, web-optimized MP4 copied from the provided Recordly recording. Preserve the original recording unchanged.
- Use native video controls, metadata-only preload, and no autoplay. Keep both pages usable when video playback is unavailable, with clear captions/accessible labels and a download fallback link to the demo asset.
- Replace screenshots in both screenshot areas rather than retaining stale app captures.
- Update installer links to the v0.1.7 GitHub release asset and add an explicit release-notes link.
- Display the release version, installer size, and verified SHA-256 on the Download page.
- Correct download-page claims to state that the 0.1.7 installer bundles face models.
- Refresh liveness wording to explain the prompted forward → left → right → forward head-turn sequence and disclose that RGB movement is not proof of a live person and replay attacks may still pass.
- Update the site README's release values, assets, and screenshot documentation to describe the new video.

## Video handling
The source is a 78-second, 1366×768 H.264 MP4 (~223.5 MB). Create a separate web copy targeting ~14–40 MB, preserving the source. Reuse the optimized file from both pages so there is one authoritative demo asset.

## Alternatives considered
1. **Self-host optimized local MP4 (selected):** preserves the existing no-runtime-network design and allows normal browser playback; adds a moderate static asset.
2. **Embed a third-party hosted video:** avoids storing the video in the site folder, but introduces a network dependency and external player/privacy considerations.

## Release facts
- GitHub release: https://github.com/Sampath0411/glance-windows/releases/tag/v0.1.7
- Installer: https://github.com/Sampath0411/glance-windows/releases/download/v0.1.7/GlanceSetup.exe
- Installer size: 92,826,896 bytes
- Installer SHA-256: `D1E30C49FB27F47D079266DDFACF4CBDC0A7959DBBEB3127FF973CA20FAB90CF`

## Out of scope
- Publishing/deploying the website: the provided site folder has no Git repository or configured hosting target.
- Altering or deleting the original recording.
- Changing application behavior or release assets.

## Verification
- Check all page links and version/checksum/size text against the published GitHub release.
- Verify video dimensions, duration, and optimized file size; ensure both pages point to the same relative asset.
- Run a local static server and test responsive playback, captions, native controls, and page behavior with video unavailable.

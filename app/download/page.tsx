import { DemoVideo } from "@/components/demo-video";
import { ReleaseBrowser } from "@/components/release-browser";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Download Glance",
  description: "Download Glance for Windows 11, browse GitHub releases, and review installation, security, and checksum details.",
};

export default function DownloadPage() {
  return (
    <main id="main-content" className="shell-page download-page">
      <header className="page-heading"><p className="eyebrow">Download · current site release v0.1.7</p><h1>Glance releases</h1><p>Choose a Windows installer. Glance is designed for convenience, not maximum security.</p></header>
      <ReleaseBrowser />
      <section className="install-notes" aria-labelledby="install-heading">
        <h2 id="install-heading">Before you install</h2>
        <div className="note-grid">
          <article><h3>Windows may warn you</h3><p>The setup is not code-signed, so SmartScreen shows “Windows protected your PC”. Choose <strong>More info</strong>, then <strong>Run anyway</strong>.</p></article>
          <article><h3>Administrator approval</h3><p>Installing needs admin rights, and enabling face unlock asks again. The installer does not register a credential provider on its own. Your Windows password and PIN keep working throughout.</p></article>
          <article><h3>Face models are bundled</h3><p>The v0.1.7 installer includes face-model weights and license notices, so setup does not download model files on first launch. The weights are licensed for non-commercial research use; the Glance MIT license does not cover them.</p></article>
          <article><h3>Head-turn check, with limits</h3><p>Face forward → turn left → turn right → face forward. RGB head motion is not proof of a live person; moved photos or replay videos may still pass.</p></article>
          <article><h3>Windows password fallback</h3><p>If an in-app face check fails while opening Your Face or Password, you can enter your Windows password for Windows to verify. Glance does not save it. This does not apply to Windows unlock.</p></article>
          <article><h3>What you need</h3><p>Windows 11 (build 22000 or newer), 64-bit, a webcam, and a few minutes for face enrollment.</p></article>
        </div>
      </section>
      <section className="install-notes" aria-labelledby="checksum-heading"><h2 id="checksum-heading">Verify the installer</h2><p>Compare the downloaded file against this SHA-256 checksum before running it:</p><code className="checksum">D1E30C49FB27F47D079266DDFACF4CBDC0A7959DBBEB3127FF973CA20FAB90CF</code><p className="checksum-help">PowerShell: <code>Get-FileHash .\GlanceSetup.exe -Algorithm SHA256</code></p></section>
      <section className="install-notes" aria-labelledby="demo-heading"><h2 id="demo-heading">See Glance in action</h2><DemoVideo /></section>
    </main>
  );
}

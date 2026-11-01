import { DemoVideo } from "@/components/demo-video";
import { ReleaseBrowser } from "@/components/release-browser";
import AnimatedContent from "@/components/react-bits/animated-content";
import GradientWaves from "@/components/react-bits/gradient-waves";
import Shuffle from "@/components/react-bits/shuffle";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Download Glance",
  description: "Download Glance for Windows 11, browse GitHub releases, and review installation, security, and checksum details.",
};

export default function DownloadPage() {
  return (
    <main id="main-content" className="shell-page download-page">
      <div className="page-waves" aria-hidden="true"><GradientWaves horizonColor="#27518a" waveColor="#45a9d0" crestColor="#d8f5ff" backgroundColor="transparent" speed={0.28} amplitude={3} waveScale={0.48} relief={0.9} sheen={0.28} brightness={0.92} opacity={0.72} grain={0.06} quality="medium" mouseInteraction={false} swellOnClick={false} dpr={1.25} /></div>
      <div className="download-page__content">
      <AnimatedContent className="animated-content" distance={30} duration={0.7} ease="power3.out" initialOpacity={0.82} blur={4} threshold={0.08} trigger="mount" once>
      <header className="page-heading"><p className="eyebrow">Download · current site release v0.1.7</p><h1><Shuffle text="Glance releases" className="shuffle-heading" tag="span" textAlign="left" effect="slide" shuffleDirection="right" duration={0.4} shuffleTimes={2} animationMode="evenodd" stagger={0.035} triggerOnce triggerOnHover respectReducedMotion /></h1><p>Choose a Windows installer. Glance is designed for convenience, not maximum security.</p></header>
      </AnimatedContent>
      <AnimatedContent className="animated-content" distance={26} duration={0.7} ease="power3.out" initialOpacity={0.82} blur={3} threshold={0.06} trigger="mount" once>
      <ReleaseBrowser />
      </AnimatedContent>
      <section className="install-notes" aria-labelledby="install-heading">
        <h2 id="install-heading"><Shuffle text="Before you install" className="shuffle-heading" tag="span" textAlign="left" effect="slide" shuffleDirection="up" duration={0.36} shuffleTimes={2} animationMode="center" stagger={0.018} triggerOnce triggerOnHover respectReducedMotion /></h2>
        <AnimatedContent className="animated-content" distance={28} duration={0.68} ease="power3.out" initialOpacity={0.82} blur={3} threshold={0.1} trigger="scroll" once>
        <div className="note-grid">
          <article><h3>Windows may warn you</h3><p>The setup is not code-signed, so SmartScreen shows “Windows protected your PC”. Choose <strong>More info</strong>, then <strong>Run anyway</strong>.</p></article>
          <article><h3>Administrator approval</h3><p>Installing needs admin rights, and enabling face unlock asks again. The installer does not register a credential provider on its own. Your Windows password and PIN keep working throughout.</p></article>
          <article><h3>Face models are bundled</h3><p>The v0.1.7 installer includes face-model weights and license notices, so setup does not download model files on first launch. The weights are licensed for non-commercial research use; the Glance MIT license does not cover them.</p></article>
          <article><h3>Head-turn check, with limits</h3><p>Face forward → turn left → turn right → face forward. RGB head motion is not proof of a live person; moved photos or replay videos may still pass.</p></article>
          <article><h3>Windows password fallback</h3><p>If an in-app face check fails while opening Your Face or Password, you can enter your Windows password for Windows to verify. Glance does not save it. This does not apply to Windows unlock.</p></article>
          <article><h3>What you need</h3><p>Windows 11 (build 22000 or newer), 64-bit, a webcam, and a few minutes for face enrollment.</p></article>
        </div>
        </AnimatedContent>
      </section>
      <AnimatedContent className="animated-content" distance={24} duration={0.65} ease="power3.out" initialOpacity={0.82} blur={3} threshold={0.12} trigger="scroll" once>
      <section className="install-notes" aria-labelledby="checksum-heading"><h2 id="checksum-heading"><Shuffle text="Verify the installer" className="shuffle-heading" tag="span" textAlign="left" effect="flip" shuffleDirection="up" duration={0.38} shuffleTimes={2} animationMode="center" stagger={0.02} triggerOnce triggerOnHover respectReducedMotion /></h2><p>Compare the downloaded file against this SHA-256 checksum before running it:</p><code className="checksum">D1E30C49FB27F47D079266DDFACF4CBDC0A7959DBBEB3127FF973CA20FAB90CF</code><p className="checksum-help">PowerShell: <code>Get-FileHash .\GlanceSetup.exe -Algorithm SHA256</code></p></section>
      </AnimatedContent>
      <AnimatedContent className="animated-content" distance={24} duration={0.65} ease="power3.out" initialOpacity={0.82} blur={3} threshold={0.12} trigger="scroll" once>
      <section className="install-notes" aria-labelledby="demo-heading"><h2 id="demo-heading"><Shuffle text="See Glance in action" className="shuffle-heading" tag="span" textAlign="left" effect="slide" shuffleDirection="right" duration={0.36} shuffleTimes={2} animationMode="evenodd" stagger={0.02} triggerOnce triggerOnHover respectReducedMotion /></h2><DemoVideo /></section>
      </AnimatedContent>
      </div>
    </main>
  );
}

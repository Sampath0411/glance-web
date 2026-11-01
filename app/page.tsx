import { DemoVideo } from "@/components/demo-video";
import BlurText from "@/components/react-bits/blur-text";
import SpotlightCard from "@/components/react-bits/spotlight-card";
import Aurora from "@/components/react-bits/aurora";
import AnimatedContent from "@/components/react-bits/animated-content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Face Unlock for Windows",
  description: "Private, on-device face recognition for your Windows PC. Glance brings a convenient face-unlock flow to Windows 11.",
};

export default function HomePage() {
  return (
    <main id="main-content">
      <section className="hero shell-page" aria-labelledby="hero-title">
        <div className="hero__aurora" aria-hidden="true">
          <Aurora colorStops={["#8fb6ff", "#567dc4", "#b3e4ee"]} amplitude={1.2} blend={0.6} speed={0.14} height={0.35} scale={1.15} glow={0.55} brightness={1.05} layers={3} mouseInteraction={false} intro={true} opacity={0.95} dpr={1.25} />
        </div>
        <p className="eyebrow">Made for your Windows PC</p>
        <h1 id="hero-title" className="hero__title"><BlurText text="Face unlock," className="blur-text__content" animateBy="words" direction="top" delay={180} stepDuration={0.7} blur={12} distance={32} effect="blur" trigger="load" /><br /><BlurText text="made simple." className="blur-text__content" animateBy="words" direction="top" delay={180} stepDuration={0.7} blur={12} distance={32} effect="blur" trigger="load" /></h1>
        <p className="hero__subhead">Private, on-device face recognition for your Windows PC.</p>
        <div className="hero__actions">
          <a className="button-primary" href="https://github.com/Sampath0411/glance-windows/releases/download/v0.1.7/GlanceSetup.exe">Download for Windows <span aria-hidden="true">↓</span></a>
          <a className="quiet-link" href="https://github.com/Sampath0411/glance-windows/releases/tag/v0.1.7" target="_blank" rel="noreferrer">v0.1.7 release notes ↗</a>
        </div>
        <div className="hero__glow" aria-hidden="true" />
        <DemoVideo />
      </section>
      <section className="content-section shell-page" aria-labelledby="glance-heading">
        <p className="eyebrow">A familiar way to sign in</p>
        <h2 id="glance-heading">Your webcam.<br />Your PC. Your choice.</h2>
        <div className="feature-grid">
          <SpotlightCard className="info-card" spotlightColor="#b8c8e5" intensity={0.12} spotlightSize={220} softness={0.78} borderGlow={0.12} proximity={0} smoothing={0.3} ambient={false} flare={false} grain={0}>
            <span className="card-index">01 / LOCAL</span><h3>Runs on your device</h3><p>Face recognition runs locally on your Windows PC. Glance does not send face data to a cloud service.</p>
          </SpotlightCard>
          <SpotlightCard className="info-card" spotlightColor="#b8c8e5" intensity={0.12} spotlightSize={220} softness={0.78} borderGlow={0.12} proximity={0} smoothing={0.3} ambient={false} flare={false} grain={0}>
            <span className="card-index">02 / CONTROL</span><h3>Designed for convenience</h3><p>Use your webcam for a quicker sign-in flow, with Windows password and PIN options still available.</p>
          </SpotlightCard>
          <SpotlightCard className="info-card info-card--wide" spotlightColor="#b8c8e5" intensity={0.12} spotlightSize={260} softness={0.78} borderGlow={0.12} proximity={0} smoothing={0.3} ambient={false} flare={false} grain={0}>
            <span className="card-index">03 / HONEST SECURITY</span><h3>Convenient is not the same as high assurance.</h3><p>Glance is less secure than Windows Hello. Most PCs lack the depth sensors that help Windows Hello verify a person.</p><a className="quiet-link" href="/download">Read the installation and security notes →</a>
          </SpotlightCard>
        </div>
      </section>
      <AnimatedContent className="animated-content" distance={36} duration={0.85} ease="power3.out" initialOpacity={0.1} blur={5} threshold={0.18} trigger="scroll" once>
      <section className="disclosure shell-page" aria-labelledby="limits-heading">
        <p className="eyebrow">Know the limits</p>
        <h2 id="limits-heading">A head-turn check<br />is not liveness proof.</h2>
        <p>When prompted, face forward → turn left → turn right → face forward. This RGB head-motion check is not proof of a live person; moved photos or replay videos may still pass.</p>
        <a className="button-secondary" href="/download">Review all product and install details <span aria-hidden="true">↗</span></a>
      </section>
      </AnimatedContent>
      <AnimatedContent className="animated-content" distance={28} duration={0.75} ease="power3.out" initialOpacity={0.15} blur={4} threshold={0.12} trigger="scroll" once>
      <section className="closing-cta shell-page"><p className="eyebrow">Glance for Windows 11</p><h2>Ready when you are.</h2><a className="button-primary" href="/download">Get Glance <span aria-hidden="true">↓</span></a></section>
      </AnimatedContent>
    </main>
  );
}

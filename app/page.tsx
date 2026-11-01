import { DemoVideo } from "@/components/demo-video";
import BlurText from "@/components/react-bits/blur-text";
import SpotlightCard from "@/components/react-bits/spotlight-card";
import AnimatedContent from "@/components/react-bits/animated-content";
import GradientASCII from "@/components/react-bits/gradient-ascii";
import TechText from "@/components/react-bits/tech-text";
import Shuffle from "@/components/react-bits/shuffle";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Face Unlock for Windows",
  description: "Private, on-device face recognition for your Windows PC. Glance brings a convenient face-unlock flow to Windows 11.",
};

export default function HomePage() {
  return (
    <main id="main-content">
      <section className="hero shell-page" aria-labelledby="hero-title">
        <div className="hero__gradient-ascii" aria-hidden="true">
          <GradientASCII
            colors={["#1e3fd8", "#dbeafe", "#a5d8ff", "#38bdf8"]}
            shape="horizon"
            characters=" =+xX0S8#@"
            cellSize={20}
            density={0.46}
            glyphOpacity={0.58}
            gradientOpacity={0.72}
            glow={0.12}
            flicker={0.04}
            flow={0.2}
            speed={0.25}
            grain={0.02}
            mouseInteraction={false}
            clickEffect="none"
            intro={true}
            dpr={1.25}
          />
        </div>
        <p className="eyebrow">Made for your Windows PC</p>
        <h1 id="hero-title" className="visually-hidden">Face unlock, made simple.</h1>
        <div className="hero__title-visual" aria-hidden="true">
          <TechText text="Face unlock," className="hero__tech-line" decorative interactive={false} fontSize={150} fontWeight={580} color="#f0f1f3" reveal="off" selection={false} labels={false} draggable={false} clickKick={false} sweep={false} specks={0} intro="none" />
          <TechText text="made simple." className="hero__tech-line" decorative interactive={false} fontSize={150} fontWeight={580} color="#f0f1f3" reveal="off" selection={false} labels={false} draggable={false} clickKick={false} sweep={false} specks={0} intro="none" />
        </div>
        <p className="hero__subhead"><BlurText text="Private, on-device face recognition for your Windows PC." className="blur-text__content" animateBy="words" direction="top" delay={90} stepDuration={0.45} blur={6} distance={14} effect="blur" trigger="view" /></p>
        <div className="hero__actions">
          <a className="button-primary" href="https://github.com/Sampath0411/glance-windows/releases/download/v0.1.7/GlanceSetup.exe">Download for Windows <span aria-hidden="true">↓</span></a>
          <a className="quiet-link" href="https://github.com/Sampath0411/glance-windows/releases/tag/v0.1.7" target="_blank" rel="noreferrer">v0.1.7 release notes ↗</a>
        </div>
        <div className="hero__glow" aria-hidden="true" />
        <DemoVideo />
      </section>
      <section className="content-section shell-page" aria-labelledby="glance-heading">
        <p className="eyebrow">A familiar way to sign in</p>
        <h2 id="glance-heading"><Shuffle text="Your webcam. Your PC. Your choice." className="shuffle-heading" tag="span" textAlign="left" effect="slide" shuffleDirection="up" duration={0.35} shuffleTimes={2} animationMode="center" stagger={0.018} triggerOnce triggerOnHover respectReducedMotion /></h2>
        <AnimatedContent className="animated-content" distance={24} duration={0.65} ease="power3.out" initialOpacity={0.82} blur={3} threshold={0.14} trigger="scroll" once>
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
        </AnimatedContent>
      </section>
      <AnimatedContent className="animated-content" distance={36} duration={0.85} ease="power3.out" initialOpacity={0.82} blur={5} threshold={0.18} trigger="scroll" once>
      <section className="disclosure shell-page" aria-labelledby="limits-heading">
        <p className="eyebrow">Know the limits</p>
        <h2 id="limits-heading"><Shuffle text="A head-turn check is not liveness proof." className="shuffle-heading" tag="span" textAlign="left" effect="flip" shuffleDirection="up" duration={0.42} shuffleTimes={2} animationMode="center" stagger={0.02} triggerOnce triggerOnHover respectReducedMotion /></h2>
        <p>When prompted, face forward → turn left → turn right → face forward. This RGB head-motion check is not proof of a live person; moved photos or replay videos may still pass.</p>
        <a className="button-secondary" href="/download">Review all product and install details <span aria-hidden="true">↗</span></a>
      </section>
      </AnimatedContent>
      <AnimatedContent className="animated-content" distance={28} duration={0.75} ease="power3.out" initialOpacity={0.82} blur={4} threshold={0.12} trigger="scroll" once>
       <section className="closing-cta shell-page"><p className="eyebrow">Glance for Windows 11</p><h2><Shuffle text="Ready when you are." className="shuffle-heading" tag="span" effect="slide" shuffleDirection="right" duration={0.38} shuffleTimes={2} animationMode="evenodd" stagger={0.025} triggerOnce triggerOnHover respectReducedMotion /></h2><a className="button-primary" href="/download">Get Glance <span aria-hidden="true">↓</span></a></section>
      </AnimatedContent>
    </main>
  );
}

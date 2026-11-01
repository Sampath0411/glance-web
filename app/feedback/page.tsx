import type { Metadata } from "next";
import AnimatedContent from "@/components/react-bits/animated-content";
import GradientWaves from "@/components/react-bits/gradient-waves";
import Shuffle from "@/components/react-bits/shuffle";
import { ArrowIcon } from "@/components/arrow-icon";

export const metadata: Metadata = {
  title: "Feedback",
  description: "Share feedback or report an issue with Glance for Windows on GitHub.",
};

export default function FeedbackPage() {
  return (
    <main id="main-content" className="shell-page feedback-page">
      <div className="page-waves" aria-hidden="true"><GradientWaves horizonColor="#27518a" waveColor="#45a9d0" crestColor="#d8f5ff" backgroundColor="transparent" speed={0.28} amplitude={3} waveScale={0.48} relief={0.9} sheen={0.28} brightness={0.92} opacity={0.72} grain={0.06} quality="medium" mouseInteraction={false} swellOnClick={false} dpr={1.25} /></div>
      <AnimatedContent className="animated-content feedback-motion" distance={34} duration={0.75} ease="power3.out" initialOpacity={0.82} blur={4} threshold={0.08} trigger="mount" once>
        <section className="placeholder-page">
          <p className="eyebrow">Help make Glance better</p>
          <h1><Shuffle text="Feedback" className="shuffle-heading" tag="span" effect="slide" shuffleDirection="right" duration={0.42} shuffleTimes={2} animationMode="center" stagger={0.045} triggerOnce triggerOnHover respectReducedMotion /></h1>
          <p>Report a bug, request a feature, or share your thoughts with the Glance community.</p>
          <a className="button-primary" href="https://github.com/Sampath0411/glance-windows/issues" target="_blank" rel="noreferrer">Open GitHub Issues <ArrowIcon direction="up-right" /></a>
        </section>
      </AnimatedContent>
    </main>
  );
}

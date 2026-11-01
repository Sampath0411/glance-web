import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Feedback",
  description: "Share feedback or report an issue with Glance for Windows on GitHub.",
};

export default function FeedbackPage() {
  return <main id="main-content" className="shell-page"><section className="placeholder-page"><p className="eyebrow">Help make Glance better</p><h1>Feedback</h1><p>Report a bug, request a feature, or share your thoughts with the Glance community.</p><a className="button-primary" href="https://github.com/Sampath0411/glance-windows/issues" target="_blank" rel="noreferrer">Open GitHub Issues <span aria-hidden="true">↗</span></a></section></main>;
}

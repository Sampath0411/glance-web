import Link from "next/link";
import { ArrowIcon } from "@/components/arrow-icon";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <Link className="brand" href="/">Glance<span className="brand__dot">.</span></Link>
        <p>Made for Windows. Your face stays on your PC.</p>
        <nav aria-label="Footer">
          <Link href="/download">Downloads</Link>
          <Link href="/feedback">Feedback</Link>
          <a href="https://github.com/Sampath0411/glance-windows" target="_blank" rel="noreferrer">GitHub <ArrowIcon direction="up-right" /></a>
        </nav>
      </div>
    </footer>
  );
}

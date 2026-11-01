import Link from "next/link";

export function SiteHeader() {
  return (
    <>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <header className="site-header">
        <div className="site-header__inner">
          <Link className="brand" href="/" aria-label="Glance home">Glance<span className="brand__dot">.</span></Link>
          <nav aria-label="Primary" className="primary-nav">
            <Link href="/">Product</Link>
            <Link href="/download">Download</Link>
            <Link href="/feedback">Feedback</Link>
          </nav>
          <Link className="header-cta" href="/download">Get Glance <span aria-hidden="true">↗</span></Link>
        </div>
      </header>
    </>
  );
}

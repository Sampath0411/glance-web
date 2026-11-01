import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main-content" className="shell-page">
      <h1>Page not found</h1>
      <Link href="/">Back to Glance</Link>
      <Link href="/download">Download Glance</Link>
    </main>
  );
}

import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: (() => {
    const rawUrl = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined);
    try { return rawUrl ? new URL(rawUrl) : undefined; } catch { return undefined; }
  })(),
  title: {
    default: "Glance for Windows",
    template: "%s · Glance for Windows",
  },
  description: "Private, on-device face unlock for your Windows PC.",
  openGraph: {
    type: "website",
    siteName: "Glance for Windows",
    title: "Glance for Windows — Face Unlock",
    description: "Private, on-device face recognition for your Windows PC.",
  },
  twitter: { card: "summary", title: "Glance for Windows — Face Unlock", description: "Private, on-device face recognition for your Windows PC." },
  icons: { icon: "/assets/icon.png", apple: "/assets/icon.png" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}

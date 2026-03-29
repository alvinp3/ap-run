import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "BQ Training",
  description: "Boston Qualifier + Grasslands 100 Training Companion — 51 weeks to greatness",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "BQ Training",
  },
  openGraph: {
    title: "BQ Training — Houston Marathon & Grasslands 100",
    description: "Training for sub-2:50 Boston Qualifier and first 100-miler",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#050505",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.svg" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="min-h-full flex flex-col items-center" style={{ background: '#050505' }}>
        {/* Obsidian container — 375px shell with side borders on desktop */}
        <div
          className="w-full flex flex-col min-h-full"
          style={{
            maxWidth: 375,
            borderLeft:  '1px solid #2A2A2A',
            borderRight: '1px solid #2A2A2A',
            minHeight: '100dvh',
          }}
        >
        {children}
        </div>
        <Script id="register-sw" strategy="afterInteractive">{`
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
              navigator.serviceWorker.register('/sw.js')
                .then(function(reg) { console.log('[BQ] SW registered:', reg.scope); })
                .catch(function(err) { console.warn('[BQ] SW registration failed:', err); });
            });
          }
        `}</Script>
      </body>
    </html>
  );
}

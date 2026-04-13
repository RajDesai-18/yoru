import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://yoru-sandy.vercel.app"),
  title: "Yoru — Cinematic Ambient Station",
  description:
    "An immersive ambient music experience with anime-style visuals and layered soundscapes. The UI disappears, and the atmosphere takes over.",

  openGraph: {
    title: "Yoru — Cinematic Ambient Station",
    description:
      "An immersive ambient music experience with anime-style visuals and layered soundscapes.",
    url: "https://yoru-sandy.vercel.app",
    siteName: "Yoru",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Yoru — Cinematic Ambient Station",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Yoru — Cinematic Ambient Station",
    description:
      "An immersive ambient music experience with anime-style visuals and layered soundscapes.",
    images: ["/og-image.png"],
  },

  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-touch-icon.png" }],
  },

  manifest: "/site.webmanifest",

  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Yoru",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}

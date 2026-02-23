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
  title: "Yoru — Cinematic Ambient Station",
  description:
    "An immersive ambient music experience with anime-style visuals and layered soundscapes. The UI disappears, and the atmosphere takes over.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Yoru",
  },
  icons: {
    icon: [
      { url: "./favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "Yoru — Cinematic Ambient Station",
    description:
      "An immersive ambient music experience with anime-style visuals and layered soundscapes.",
    siteName: "Yoru",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Yoru — Cinematic Ambient Station",
    description:
      "An immersive ambient music experience with anime-style visuals and layered soundscapes.",
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

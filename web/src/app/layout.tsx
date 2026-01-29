import type { Metadata } from "next";
import { Coming_Soon, Shizuru } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "./convex-provider";

const comingSoon = Coming_Soon({
  variable: "--font-coming-soon",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  fallback: ["system-ui", "arial"],
});

const shizuru = Shizuru({
  variable: "--font-shizuru",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  fallback: ["system-ui", "cursive"],
});

export const metadata: Metadata = {
  title: "REELyCooked",
  description: "Stop Doomscrolling by getting sick of it",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${comingSoon.variable} ${shizuru.variable} antialiased`}
      >
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}

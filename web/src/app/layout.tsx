import type { Metadata } from "next";
import { Coming_Soon, Shizuru } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "./convex-provider";

const comingSoon = Coming_Soon({
  variable: "--font-coming-soon",
  subsets: ["latin"],
  weight: "400",
});

const shizuru = Shizuru({
  variable: "--font-shizuru",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "ShortBreak",
  description: "Stop Doomscrolling and be productive for once smh...",
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

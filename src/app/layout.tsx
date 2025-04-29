import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import BackgroundMusic from "@/components/BackgroundMusic";
import SoundEffects from "@/components/SoundEffects";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ShadowSnap",
  description: "A Lego building game",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" style={{ overflow: "hidden" }}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{
          margin: 0,
          padding: 0,
          overflow: "hidden",
          height: "100vh",
          width: "100vw",
        }}
      >
        <BackgroundMusic />
        <SoundEffects />
        {children}
      </body>
    </html>
  );
}

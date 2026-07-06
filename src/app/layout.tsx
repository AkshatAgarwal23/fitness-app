import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AnimatedBackground from "./components/AnimatedBackground";
import PageTransition from "./components/PageTransition";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Forma",
  description: "Your body. Your pace. Your form.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full relative">
        <AnimatedBackground />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <PageTransition>{children}</PageTransition>
        </div>
      </body>
    </html>
  );
}

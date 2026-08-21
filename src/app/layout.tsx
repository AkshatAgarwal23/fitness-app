import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AnimatedBackground from "./components/AnimatedBackground";
import PageTransition from "./components/PageTransition";
import BottomNav from "./components/BottomNav";

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
    <html lang="en" className={`${inter.variable} h-full`} suppressHydrationWarning>
      <body className="min-h-full relative">
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('forma-theme');if(t==='light')document.documentElement.setAttribute('data-theme',t)}catch(e){}try{if(localStorage.getItem('forma-mobile-preview')==='1')document.body.classList.add('mobile-preview')}catch(e){}`,
          }}
        />
        <div id="app-frame">
          <AnimatedBackground />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <PageTransition>{children}</PageTransition>
          </div>
          <BottomNav />
        </div>
      </body>
    </html>
  );
}

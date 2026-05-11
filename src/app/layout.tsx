import type { Metadata } from "next";
import { Inter, Manrope, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Footer } from "@/components/layout/Footer";
import { TopNav } from "@/components/layout/TopNav";
import { AppInitializer } from "@/components/providers/AppInitializer";
import { Toaster } from "@/components/ui/sonner";
import { WalletModal } from "@/components/wallet/WalletModal";
import QueryProvider from "@/providers/QueryProvider";
import SolanaProvider from "@/providers/SolanaProvider";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Winnr",
  description: "Winnr - Home Of Information Markets",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Winnr",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    apple: "/icon-512x512.png",
  },
  openGraph: {
    type: "website",
    siteName: "Winnr",
    title: "Winnr",
    description: "Winnr - Home Of Information Markets",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Winnr",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Winnr",
    description: "Winnr - Home Of Information Markets",
    images: ["/og.png"],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#00BB7E",
};

import { SerwistProvider } from "@serwist/turbopack/react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${manrope.variable} ${inter.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <SolanaProvider>
          <QueryProvider>
            <SerwistProvider swUrl="/serwist/sw.js">
              <TopNav />
              <AppInitializer />
              <WalletModal />
              <Toaster />
              <main className="flex-1">{children}</main>
              <Footer />
            </SerwistProvider>
          </QueryProvider>
        </SolanaProvider>
      </body>
    </html>
  );
}

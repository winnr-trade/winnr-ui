import type { Metadata } from "next";
import { Inter, Manrope, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { TopNav } from "@/components/layout/TopNav";
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
  description: "Winnr - Predict Like A Winnr.",
};

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
            <TopNav />
            <WalletModal />
            <Toaster />
            <main className="flex-1">{children}</main>
          </QueryProvider>
        </SolanaProvider>
      </body>
    </html>
  );
}

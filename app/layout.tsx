import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";

import LoadingBar from "@/components/basic/LoadingBar";
import { Suspense } from "react";
import { UIProvider } from "@/components/providers/ui-provider";
import { Analytics } from "@vercel/analytics/next";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "HireSapien — Experience Engineering Before You're Hired",
  description:
    "AI-powered Engineering Stimulation Center. Drop candidates into realistic engineering workspaces and evaluate what matters: execution. Not knowledge.",
  icons: {
    icon: "/image-removebg-preview (1).png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="nord" className={`${jakarta.variable} ${inter.variable}`}>
      <body className="antialiased bg-page-bg text-text-main font-sans">
        <UIProvider>
          <Suspense fallback={null}>
            <LoadingBar />
          </Suspense>
          {children}
        </UIProvider>
        <Analytics />
      </body>
    </html>
  );
}

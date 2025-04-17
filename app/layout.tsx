import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/common/Sidebar";
import { Suspense } from "react";
import AppProvider from "@/providers/AppProvider";

import '@mysten/dapp-kit/dist/index.css';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sphere App",
  description: "A modern web application",
  icons: {
    icon: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <AppProvider>
          
                <Suspense fallback={<div>Loading...</div>}>
                  <div className="flex min-h-screen">
                    <div className="fixed left-0 top-0 h-screen w-64">
                      <Sidebar />
                    </div>
                    <main className="flex-1 pl-72 p-8 overflow-x-hidden">
                      {children}
                    </main>
                  </div>
                </Suspense>
          
        </AppProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/common/Sidebar";
import Header from "@/components/common/Header";
import { Suspense } from "react";
import { AppProvider } from "@/providers/AppProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Toaster } from 'sonner';

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
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ThemeProvider>
          <AppProvider>
            <Suspense fallback={<LoadingSpinner />}>
              <div className="flex flex-col md:flex-row min-h-screen">
                {/* Desktop Sidebar */}
                <div className="hidden md:block fixed left-0 top-0 h-screen w-64">
                  <Sidebar />
                </div>
                
                {/* Mobile Header */}
                <div className="block md:hidden w-full">
                  <Header />
                </div>

                {/* Main Content */}
                <main className="flex-1 p-4 overflow-x-hidden md:pl-68 pt-16 md:pt-4">
                  {children}
                </main>
              </div>
            </Suspense>
            <Toaster position="top-center" />
          </AppProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

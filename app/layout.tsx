import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/common/Sidebar";
import { ClerkProvider } from '@clerk/nextjs';
import { Suspense } from "react";

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
    <ClerkProvider>
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <Suspense fallback={<div>Loading...</div>}>
            <Sidebar />
            <main className="ml-64 p-8">
              {children}
            </main>
          </Suspense>
        </body>
      </html>
    </ClerkProvider>
  );
}

"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { SuiClientProvider, WalletProvider } from "@mysten/dapp-kit";
import { getFullnodeUrl } from "@0xobelisk/sui-client";
import { ThemeProvider } from "./ThemeProvider";

export default function AppProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <ThemeProvider>
      <ClerkProvider
        appearance={{
          layout: {
            logoPlacement: "inside",
            socialButtonsVariant: "iconButton",
            showOptionalFields: false,
          },
          elements: {
            formButtonPrimary: "bg-primary hover:bg-primary/90 text-primary-foreground",
            socialButtonsBlockButton: "w-full h-12 flex items-center justify-center gap-3 bg-background border border-input hover:bg-accent hover:text-accent-foreground text-foreground font-medium rounded-lg transition-colors duration-200",
          },
        }}
      >
        <QueryClientProvider client={queryClient}>
          <SuiClientProvider
            networks={{ testnet: { url: getFullnodeUrl("testnet") } }}
          >
            <WalletProvider
              theme={{
                blurs: {
                  modalOverlay: 'blur(0)',
                },
                backgroundColors: {
                  primaryButton: 'var(--secondary)',
                  primaryButtonHover: 'var(--secondary-hover)',
                  outlineButtonHover: 'var(--secondary-hover)',
                  modalOverlay: 'rgba(24 36 53 / 20%)',
                  modalPrimary: 'var(--card)',
                  modalSecondary: 'var(--muted)',
                  iconButton: 'transparent',
                  iconButtonHover: 'var(--secondary-hover)',
                  dropdownMenu: 'var(--card)',
                  dropdownMenuSeparator: 'var(--border)',
                  walletItemSelected: 'var(--card)',
                  walletItemHover: 'var(--muted)',
                },
                borderColors: {
                  outlineButton: 'var(--border)',
                },
                colors: {
                  primaryButton: 'var(--secondary-foreground)',
                  outlineButton: 'var(--secondary-foreground)',
                  iconButton: 'var(--foreground)',
                  body: 'var(--foreground)',
                  bodyMuted: 'var(--muted-foreground)',
                  bodyDanger: 'var(--destructive)',
                },
                radii: {
                  small: '6px',
                  medium: '8px',
                  large: '12px',
                  xlarge: '16px',
                },
                shadows: {
                  primaryButton: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                  walletItemSelected: '0px 2px 6px rgba(0, 0, 0, 0.05)',
                },
                fontWeights: {
                  normal: '400',
                  medium: '500',
                  bold: '600',
                },
                fontSizes: {
                  small: '14px',
                  medium: '16px',
                  large: '18px',
                  xlarge: '20px',
                },
                typography: {
                  fontFamily: 'var(--font-sans)',
                  fontStyle: 'normal',
                  lineHeight: '1.3',
                  letterSpacing: '1',
                },
              }}
            >
              {children}
            </WalletProvider>
          </SuiClientProvider>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </ClerkProvider>
    </ThemeProvider>
  );
}

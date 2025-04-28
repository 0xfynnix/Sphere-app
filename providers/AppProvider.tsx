"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState, createContext, useContext } from "react";
import { SuiClientProvider, WalletProvider } from "@mysten/dapp-kit";
import { getFullnodeUrl } from "@mysten/sui/client";
import { ThemeProvider } from "./ThemeProvider";
import { UserProfile } from '@/lib/api/types';

interface AppContextType {
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(() => new QueryClient());
  const [user, setUser] = useState<UserProfile | null>(null);

  return (
    <ThemeProvider>
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
            <AppContext.Provider value={{ user, setUser }}>
              {children}
            </AppContext.Provider>
            </WalletProvider>
          </SuiClientProvider>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    </ThemeProvider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

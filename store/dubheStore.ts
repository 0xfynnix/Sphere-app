import { create } from 'zustand';
import { loadMetadata, Dubhe, NetworkType } from "@0xobelisk/sui-client";
import { DubheConfig } from '@0xobelisk/sui-common';
import { WalletContextState } from '@suiet/wallet-kit';

interface DubheState {
  dubhe: Dubhe | null;
  isInitialized: boolean;
  account: WalletContextState | null;
  initialize: (config: DubheConfig & { networkType: NetworkType, packageId: string }, account: WalletContextState) => void;
  reset: () => void;
}

export const useDubheStore = create<DubheState>((set) => ({
  dubhe: null,
  isInitialized: false,
  account: null,
  initialize: (config, account) => {
    try {
      if (!account) {
        throw new Error('Wallet not connected');
      }

      const dubhe = new Dubhe({
        networkType: config.networkType,
        packageId: config.packageId,
        metadata: config.schemas,
        signer: account.signTransaction,
      });

      set({ dubhe, isInitialized: true, account });
    } catch (error) {
      console.error('Failed to initialize Dubhe:', error);
      set({ dubhe: null, isInitialized: false, account: null });
    }
  },
  reset: () => set({ dubhe: null, isInitialized: false, account: null }),
})); 
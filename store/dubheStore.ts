import { create } from 'zustand';
import { Dubhe, NetworkType } from "@0xobelisk/sui-client";
// import { DubheConfig } from '@0xobelisk/sui-common';
// import { loadMetadata } from '@0xobelisk/sui-client';
import { NETWORK } from '@/chain/config';
// import { useCurrentAccount } from '@mysten/dapp-kit';

interface DubheState {
  dubhe: Dubhe | null;
  isInitialized: boolean;
  initialize: () => Promise<void>;
  reset: () => void;
}

export const useDubheStore = create<DubheState>((set) => ({
  dubhe: null,
  isInitialized: false,
  initialize: async () => {
    try {
      // const metadata = await loadMetadata(NETWORK, PACKAGE_ID);
      const dubhe = new Dubhe({
        networkType: NETWORK,
        // packageId: PACKAGE_ID,
        // metadata: metadata,
      });

      set({ dubhe, isInitialized: true });
    } catch (error) {
      console.error('Failed to initialize Dubhe:', error);
      set({ dubhe: null, isInitialized: false });
    }
  },
  reset: () => set({ dubhe: null, isInitialized: false }),
})); 
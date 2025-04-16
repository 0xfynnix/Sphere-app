'use client';

import { useWallet } from '@suiet/wallet-kit';
import { useDubheStore } from '@/store/dubheStore';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { dubheConfig } from '@/config/dubhe.config';

export default function WalletConnect() {
  const { connected, account, select, disconnect } = useWallet();
  const { initialize, isInitialized } = useDubheStore();

  const handleConnect = async () => {
    try {
      await select();
      if (account) {
        initialize(dubheConfig, account);
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      toast.error('Failed to connect wallet');
    }
  };

  return (
    <div className="space-x-4">
      {!connected ? (
        <Button onClick={handleConnect}>
          Connect Wallet
        </Button>
      ) : (
        <div className="flex items-center space-x-4">
          <span className="text-sm">
            {account?.address.slice(0, 6)}...{account?.address.slice(-4)}
          </span>
          <Button variant="destructive" onClick={disconnect}>
            Disconnect
          </Button>
        </div>
      )}
    </div>
  );
} 
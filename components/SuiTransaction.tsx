'use client';

import { useDubheStore } from '@/store/dubheStore';
import { useWallet } from '@suiet/wallet-kit';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useState } from 'react';

export default function SuiTransaction() {
  const { dubhe, isInitialized } = useDubheStore();
  const { connected } = useWallet();
  const [loading, setLoading] = useState(false);

  const handleTransaction = async () => {
    if (!dubhe || !isInitialized || !connected) {
      toast.error('Please connect your wallet first');
      return;
    }

    setLoading(true);
    try {
      const tx = await dubhe.transaction()
        .call('module_name', 'function_name', [/* 参数 */])
        .execute();

      toast.success('Transaction successful!', {
        action: {
          label: 'View on Explorer',
          onClick: () => window.open(
            `https://suiexplorer.com/txblock/${tx.digest}?network=testnet`,
            '_blank'
          ),
        },
      });
    } catch (error) {
      console.error('Transaction failed:', error);
      toast.error('Transaction failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button 
        onClick={handleTransaction}
        disabled={!isInitialized || !connected || loading}
      >
        {loading ? 'Processing...' : 'Send Transaction'}
      </Button>
    </div>
  );
} 
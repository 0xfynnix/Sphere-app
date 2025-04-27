'use client';

import { useState } from 'react';
import { useCurrentWallet, useCurrentAccount, ConnectButton, useSignPersonalMessage } from '@mysten/dapp-kit';
import { useApp } from '@/providers/AppProvider';
import { getChallenge, verifySignature } from '@/lib/api/wallet';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export function AuthDialog() {
  const { currentWallet, connectionStatus, isConnecting } = useCurrentWallet();
  const account = useCurrentAccount();
  const { setUser } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const { mutateAsync: signPersonalMessage } = useSignPersonalMessage();

  const handleConnect = async () => {
    try {
      setIsLoading(true);
      
      if (connectionStatus !== 'connected') {
        return;
      }

      if (!account?.address) {
        throw new Error('No wallet account found');
      }

      const walletAddress = account.address;
      
      // 1. 获取挑战码
      const challenge = await getChallenge(walletAddress);
      
      // 2. 使用钱包签名挑战码
      const { signature } = await signPersonalMessage({
        message: new TextEncoder().encode(challenge),
      });
      
      // 3. 验证签名并获取用户信息
      const { token, user } = await verifySignature(
        walletAddress,
        signature,
        challenge
      );
      
      // 4. 存储 token 和用户信息
      localStorage.setItem('token', token);
      setUser(user);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6">
      <h2 className="text-2xl font-bold mb-4">Connect Wallet</h2>
      <p className="text-gray-600 mb-6">Please connect your wallet to continue</p>
      {connectionStatus === 'connected' ? (
        <Button
          onClick={handleConnect}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          {isLoading ? 'Verifying...' : 'Verify Wallet'}
        </Button>
      ) : (
        <ConnectButton className="w-full" />
      )}
    </div>
  );
}
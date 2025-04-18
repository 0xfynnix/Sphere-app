/* eslint-disable @next/next/no-img-element */
'use client';

import { useUser } from "@clerk/nextjs";
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { userApi } from '@/lib/api/requests';
import { logger } from "@/lib/utils";
import { ConnectButton, useCurrentAccount, useCurrentWallet } from '@mysten/dapp-kit';
import { useDubheStore } from '@/store/dubheStore';
// import { toast } from 'sonner';
import { useState, useEffect } from 'react';

export default function Profile() {
  const { user, isLoaded: isClerkLoaded, isSignedIn } = useUser();
  const account = useCurrentAccount();
  const { connectionStatus } = useCurrentWallet();
  const { dubhe, isInitialized, initialize } = useDubheStore();
  const [balance, setBalance] = useState<string>('0');
  
  const { data: userData, isLoading: isUserLoading } = useQuery({
    queryKey: ['user'],
    queryFn: userApi.get,
    enabled: isClerkLoaded && isSignedIn,
  });

  const getBalance = async (): Promise<void> => {
    if (!account?.address || !dubhe) return;
    try {
      const balance = await dubhe.balanceOf(account.address);
      setBalance((Number(balance.totalBalance) / 1_000_000_000).toFixed(4));
    } catch (error) {
      console.error('Failed to fetch balance:', error);
    }
  };

  useEffect(() => {
    if (isInitialized && account?.address) {
      getBalance();
    }
  }, [isInitialized, account?.address]);

  useEffect(() => {
    if (connectionStatus === 'connected') {
      initialize();
    }
  }, [connectionStatus]);

  if (!isClerkLoaded || isUserLoading) {
    return <div>Loading...</div>;
  }

  if (!isSignedIn) {
    return <div>Please sign in to view your profile.</div>;
  }

  const profile = userData?.data?.user?.profile;
  logger.debug('Profile', { profile });

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <img 
            src={user.imageUrl} 
            alt={user.fullName || 'Profile picture'} 
            className="w-20 h-20 rounded-full object-cover"
          />
          <div>
            <h1 className="text-3xl font-bold text-foreground">{user.fullName || 'Anonymous'}</h1>
            <p className="text-muted-foreground">@user.sui</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <h3 className="text-sm font-semibold mb-2 text-foreground">Your Balance</h3>
          <p className="text-2xl font-bold text-foreground">{balance} SUI</p>

          <div className="mt-4 flex gap-2">
            <Button size="sm" className="flex-1 bg-secondary hover:bg-secondary/80 text-secondary-foreground">Send</Button>
            <Button size="sm" className="flex-1 bg-secondary hover:bg-secondary/80 text-secondary-foreground">Receive</Button>
          </div>
        </Card>
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <h3 className="text-sm font-semibold mb-2 text-foreground">Content Created</h3>
          <p className="text-2xl font-bold text-foreground">12</p>
          <p className="text-xs text-muted-foreground">Total Posts</p>
        </Card>
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <h3 className="text-sm font-semibold mb-2 text-foreground">Followers</h3>
          <p className="text-2xl font-bold text-foreground">256</p>
          <p className="text-xs text-muted-foreground">Community Members</p>
        </Card>
      </div>

      <Tabs defaultValue="wallet" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="wallet">Wallet</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="wallet" className="mt-6">
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-foreground">Wallet Connection</h3>
              <div className="space-y-4">
                <ConnectButton />
                {connectionStatus === 'connected' && account && (
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-foreground">
                      {account.address.slice(0, 6)}...{account.address.slice(-4)}
                    </span>
                    <div className="text-sm text-foreground">
                      Balance: {balance} SUI
                    </div>
                  </div>
                )}
              </div>
            </Card>
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-foreground">Transaction History</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">Content Creation Reward</p>
                    <p className="text-sm text-muted-foreground">2 hours ago</p>
                  </div>
                  <p className="text-green-500 font-semibold">+5.2 SUI</p>
                </div>
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">Content Purchase</p>
                    <p className="text-sm text-muted-foreground">1 day ago</p>
                  </div>
                  <p className="text-red-500 font-semibold">-2.5 SUI</p>
                </div>
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">Community Reward</p>
                    <p className="text-sm text-muted-foreground">3 days ago</p>
                  </div>
                  <p className="text-green-500 font-semibold">+1.8 SUI</p>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="content" className="mt-6">
          <div className="space-y-4">
            {/* Content items will go here */}
            <p className="text-muted-foreground">No content yet.</p>
          </div>
        </TabsContent>
        <TabsContent value="activity" className="mt-6">
          <div className="space-y-4">
            {/* Activity items will go here */}
            <p className="text-muted-foreground">No recent activity.</p>
          </div>
        </TabsContent>
        <TabsContent value="settings" className="mt-6">
          <div className="space-y-4">
            {/* Settings will go here */}
            <p className="text-muted-foreground">Settings coming soon.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 
/* eslint-disable @next/next/no-img-element */
'use client';

import { useUser } from "@clerk/nextjs";
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { logger } from "@/lib/utils";
import { useEffect } from "react";

export default function Profile() {
  const { user, isLoaded, isSignedIn } = useUser();

  useEffect(() => {
    logger.debug('Profile - User state changed', { isLoaded, isSignedIn, user });
  }, [isLoaded, isSignedIn, user]);

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (!isSignedIn) {
    return <div>Please sign in to view your profile.</div>;
  }

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
            <h1 className="text-3xl font-bold">{user.fullName || 'Anonymous'}</h1>
            <p className="text-gray-500">@user.sui</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <h3 className="text-sm font-semibold mb-2">Your Balance</h3>
          <p className="text-2xl font-bold">0 SUI</p>

          <div className="mt-4 flex gap-2">
            <Button size="sm" className="flex-1">Send</Button>
            <Button size="sm" className="flex-1">Receive</Button>
          </div>
        </Card>
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <h3 className="text-sm font-semibold mb-2">Content Created</h3>
          <p className="text-2xl font-bold">12</p>
          <p className="text-xs text-gray-500">Total Posts</p>
        </Card>
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <h3 className="text-sm font-semibold mb-2">Followers</h3>
          <p className="text-2xl font-bold">256</p>
          <p className="text-xs text-gray-500">Community Members</p>
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
              <h3 className="text-lg font-semibold mb-4">Transaction History</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Content Creation Reward</p>
                    <p className="text-sm text-gray-500">2 hours ago</p>
                  </div>
                  <p className="text-green-500 font-semibold">+5.2 SUI</p>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Content Purchase</p>
                    <p className="text-sm text-gray-500">1 day ago</p>
                  </div>
                  <p className="text-red-500 font-semibold">-2.5 SUI</p>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Community Reward</p>
                    <p className="text-sm text-gray-500">3 days ago</p>
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
            <p className="text-gray-500">No content yet.</p>
          </div>
        </TabsContent>
        <TabsContent value="activity" className="mt-6">
          <div className="space-y-4">
            {/* Activity items will go here */}
            <p className="text-gray-500">No recent activity.</p>
          </div>
        </TabsContent>
        <TabsContent value="settings" className="mt-6">
          <div className="space-y-4">
            {/* Settings will go here */}
            <p className="text-gray-500">Settings coming soon.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 
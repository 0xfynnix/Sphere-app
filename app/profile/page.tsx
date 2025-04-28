/* eslint-disable @next/next/no-img-element */
'use client';

import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { userApi } from '@/lib/api/requests';
import { logger } from "@/lib/utils";
import { useEffect } from 'react';
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUserStore } from '@/store/userStore';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { User } from 'lucide-react';
import Image from 'next/image';

export default function ProfilePage() {
  const { user } = useUserStore();
  const router = useRouter();
  
  const { data: userData, isLoading: isUserLoading, isError: isUserError } = useQuery({
    queryKey: ['user'],
    queryFn: userApi.get,
    // enabled: !!user,
  });

  useEffect(() => {
    if (isUserError) {
      toast.error('Please connect and login to view your profile');
      router.push('/');
    }
  }, [isUserError, router]);

  
  if (isUserLoading) {
    return <LoadingSpinner />;
  }

  const profile = userData?.data?.user?.profile;
  logger.debug('Profile', { profile });

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Avatar className="h-20 w-20">
            {user?.profile?.avatar ? (
              <AvatarImage src={user.profile.avatar} />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-muted">
                <User className="h-10 w-10 text-muted-foreground" />
              </div>
            )}
            {user?.profile?.avatar && <AvatarFallback>{user.profile?.name?.[0] || 'U'}</AvatarFallback>}
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{user?.profile?.name || 'Anonymous'}</h1>
            <p className="text-muted-foreground">@{user?.walletAddress.slice(0, 6)}...{user?.walletAddress.slice(-4)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="p-4 sm:p-6 hover:shadow-lg transition-shadow">
          <h3 className="text-sm font-semibold mb-2 text-foreground">Content Created</h3>
          <p className="text-xl sm:text-2xl font-bold text-foreground">12</p>
          <p className="text-xs text-muted-foreground">Total Posts</p>
        </Card>
        <Card className="p-4 sm:p-6 hover:shadow-lg transition-shadow">
          <h3 className="text-sm font-semibold mb-2 text-foreground">Followers</h3>
          <p className="text-xl sm:text-2xl font-bold text-foreground">256</p>
          <p className="text-xs text-muted-foreground">Community Members</p>
        </Card>
        <Card className="p-4 sm:p-6 hover:shadow-lg transition-shadow">
          <h3 className="text-sm font-semibold mb-2 text-foreground">Total Received Rewards</h3>
          <p className="text-xl sm:text-2xl font-bold text-foreground">8.5 SUI</p>
          <p className="text-xs text-muted-foreground">From Community</p>
        </Card>
        <Card className="p-4 sm:p-6 hover:shadow-lg transition-shadow">
          <h3 className="text-sm font-semibold mb-2 text-foreground">Total Given Rewards</h3>
          <p className="text-xl sm:text-2xl font-bold text-foreground">2.5 SUI</p>
          <p className="text-xs text-muted-foreground">To Community</p>
        </Card>
      </div>

      <Tabs defaultValue="wallet" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="wallet">Transaction</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="nfts">NFTs</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="wallet" className="mt-6">
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-foreground">Transaction History On Sphere</h3>
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
            <p className="text-muted-foreground">No content yet.</p>
          </div>
        </TabsContent>
        <TabsContent value="nfts" className="mt-6">
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">My NFTs</h2>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Total: 2</span>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <Card className="p-4 hover:shadow-lg transition-shadow">
                <div className="aspect-square relative rounded-lg overflow-hidden mb-4">
                  <Image 
                    src="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=500&auto=format&fit=crop&q=60" 
                    alt="NFT" 
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                </div>
                <h3 className="font-semibold text-foreground">Sphere Creator #1</h3>
                <p className="text-sm text-muted-foreground">Minted on 2024-03-20</p>
                <div className="mt-2">
                  <Button variant="outline" size="sm">View Details</Button>
                </div>
              </Card>
              <Card className="p-4 hover:shadow-lg transition-shadow">
                <div className="aspect-square relative rounded-lg overflow-hidden mb-4">
                  <Image 
                    src="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=500&auto=format&fit=crop&q=60" 
                    alt="NFT" 
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                </div>
                <h3 className="font-semibold text-foreground">Sphere Creator #2</h3>
                <p className="text-sm text-muted-foreground">Minted on 2024-03-21</p>
                <div className="mt-2">
                  <Button variant="outline" size="sm">View Details</Button>
                </div>
              </Card>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing 1-2 of 2 items
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled>
                  Previous
                </Button>
                <Button variant="outline" size="sm" disabled>
                  Next
                </Button>
              </div>
            </div>

            <div className="pt-8 border-t">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground">Mintable NFTs</h2>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Available: 2</span>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <Card className="p-4 hover:shadow-lg transition-shadow">
                  <div className="aspect-square relative rounded-lg overflow-hidden mb-4">
                    <Image 
                      src="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=500&auto=format&fit=crop&q=60" 
                      alt="NFT" 
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                  </div>
                  <h3 className="font-semibold text-foreground">Sphere Creator #3</h3>
                  <p className="text-sm text-muted-foreground">Limited Edition</p>
                  <div className="mt-2">
                    <Button size="sm">Mint Now</Button>
                  </div>
                </Card>
                <Card className="p-4 hover:shadow-lg transition-shadow">
                  <div className="aspect-square relative rounded-lg overflow-hidden mb-4">
                    <Image 
                      src="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=500&auto=format&fit=crop&q=60" 
                      alt="NFT" 
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                  </div>
                  <h3 className="font-semibold text-foreground">Sphere Creator #4</h3>
                  <p className="text-sm text-muted-foreground">Limited Edition</p>
                  <div className="mt-2">
                    <Button size="sm">Mint Now</Button>
                  </div>
                </Card>
              </div>
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Showing 1-2 of 2 items
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" disabled>
                    Previous
                  </Button>
                  <Button variant="outline" size="sm" disabled>
                    Next
                  </Button>
                </div>
              </div>
            </div>
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
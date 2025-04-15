'use client';

import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

function MyPageContent() {
  const userStats = {
    totalEarnings: 1250.5,
    reputation: 42,
    totalPosts: 15,
    accountType: "Artist",
    suiNS: "@johndoe.sui"
  };

  const nftBadges = [
    { id: 1, name: "First Content", image: "/badge-1.png" },
    { id: 2, name: "Top Creator", image: "/badge-2.png" },
    { id: 3, name: "Copyright Holder", image: "/badge-3.png" }
  ];

  const userPosts = [
    {
      id: 1,
      title: "Digital Art Collection #1",
      content: "My first collection of digital art pieces, exploring the intersection of technology and creativity.",
      earnings: 250.5,
      likes: 128,
      timestamp: "2024-03-15T10:30:00Z",
      chainId: "0x1234...5678",
      type: "Art"
    },
    {
      id: 2,
      title: "Web3 Development Guide",
      content: "A comprehensive guide to building decentralized applications on Sui.",
      earnings: 500.2,
      likes: 256,
      timestamp: "2024-03-10T15:45:00Z",
      chainId: "0x8765...4321",
      type: "Tutorial"
    }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Page</h1>
            <div className="flex items-center space-x-2">
              <span className="text-gray-600">{userStats.suiNS}</span>
              <Badge variant="outline">{userStats.accountType}</Badge>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{userStats.totalEarnings} SUI</div>
            <div className="text-sm text-gray-500">Total Earnings</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold">{userStats.totalPosts}</div>
            <div className="text-sm text-gray-500">Total Posts</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold">{userStats.reputation}</div>
            <div className="text-sm text-gray-500">Reputation</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold">{userStats.totalEarnings}</div>
            <div className="text-sm text-gray-500">SUI Earned</div>
          </Card>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">NFT Badges</h2>
          <div className="flex space-x-4">
            {nftBadges.map((badge) => (
              <Card key={badge.id} className="p-4 text-center w-32">
                <div className="w-16 h-16 mx-auto mb-2 bg-gray-200 rounded-full"></div>
                <div className="text-sm font-medium">{badge.name}</div>
              </Card>
            ))}
          </div>
        </div>

        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="posts">My Posts</TabsTrigger>
            <TabsTrigger value="nfts">My NFTs</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="posts" className="mt-6">
            <div className="space-y-6">
              {userPosts.map((post) => (
                <Card key={post.id} className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold">{post.title}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline">{post.type}</Badge>
                        <span className="text-sm text-gray-500">
                          {new Date(post.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{post.earnings} SUI</div>
                      <div className="text-sm text-gray-500">Earnings</div>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4">{post.content}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-4">
                      <Button variant="ghost" className="flex items-center">
                        <span className="mr-1">❤️</span>
                        {post.likes}
                      </Button>
                      <Button variant="ghost" className="flex items-center">
                        <span className="mr-1">🔗</span>
                        Verify on Chain
                      </Button>
                    </div>
                    <div className="text-sm text-gray-500">
                      Chain ID: {post.chainId}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="nfts" className="mt-6">
            <div className="grid grid-cols-3 gap-4">
              {nftBadges.map((badge) => (
                <Card key={badge.id} className="p-4">
                  <div className="w-full aspect-square bg-gray-200 rounded-lg mb-2"></div>
                  <div className="font-medium">{badge.name}</div>
                  <Button variant="outline" className="w-full mt-2">
                    View on Explorer
                  </Button>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4">
                <h3 className="font-semibold mb-2">Earnings Trend</h3>
                <div className="h-40 bg-gray-100 rounded"></div>
              </Card>
              <Card className="p-4">
                <h3 className="font-semibold mb-2">Content Performance</h3>
                <div className="h-40 bg-gray-100 rounded"></div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default function MyPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MyPageContent />
    </Suspense>
  );
} 
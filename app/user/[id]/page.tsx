'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
// import { Badge } from '@/components/ui/badge';
import { MessageCircle, Flame, Settings, Share2, Edit2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import { useUserPosts } from '@/lib/api/hooks';
import { useGetUserByWallet } from '@/lib/api/hooks';
import { Skeleton } from '@/components/ui/skeleton';

export default function UserProfile({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  // const searchParams = useSearchParams();
  const { id } = use(params);
  const { data: userData, isLoading: isLoadingUser } = useGetUserByWallet(id);
  const { data: postsData, isLoading: isLoadingPosts } = useUserPosts(id);

  if (isLoadingUser) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <Skeleton className="h-48 sm:h-64 w-full rounded-xl" />
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <Skeleton className="w-32 h-32 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
      </div>
    );
  }

  if (!userData?.data?.user) {
    return <div className="text-center py-12">User not found</div>;
  }

  const user = userData.data.user;
  const isCurrentUser = user.walletAddress === id;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* {!isFromSidebar && (
        <Button
          variant="ghost"
          className="mb-4 -ml-2"
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      )} */}

      {/* Cover Image */}
      <div className="relative h-48 sm:h-64 w-full rounded-xl overflow-hidden bg-muted">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/80"></div>
        {isCurrentUser && (
          <Button
            variant="outline"
            size="sm"
            className="absolute top-4 right-4 backdrop-blur-sm"
            onClick={() => router.push('/profile')}
          >
            <Edit2 className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
        )}
      </div>

      {/* Profile Info */}
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4 sm:gap-8">
        <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
          <div className="relative">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-muted border-4 border-background absolute -top-12 sm:-top-16"></div>
          </div>
          <div className="space-y-2 mt-12 sm:mt-16">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{user.profile?.name || 'Anonymous'}</h1>
              <p className="text-muted-foreground">@{user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}</p>
            </div>
            <p className="text-muted-foreground max-w-2xl">{user.profile?.bio || 'No bio yet'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isCurrentUser ? (
            <>
              <Button variant="outline" size="icon" onClick={() => router.push('/profile')}>
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Share2 className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="icon">
                <Share2 className="h-4 w-4" />
              </Button>
              <Button variant="outline">Follow</Button>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="nfts">NFTs</TabsTrigger>
          <TabsTrigger value="collections">Collections</TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-6 pt-6">
          {isLoadingPosts ? (
            Array(3).fill(0).map((_, i) => (
              <Card key={i} className="p-6">
                <Skeleton className="h-6 w-3/4 mb-4" />
                <Skeleton className="h-4 w-full mb-4" />
                <Skeleton className="aspect-video w-full rounded-lg" />
              </Card>
            ))
          ) : postsData?.data?.posts.length ? (
            postsData.data.posts.map((post) => (
              <Card 
                key={post.id} 
                className="p-6 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => router.push(`/post/${post.id}`)}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-foreground">{post.title}</h3>
                    <span className="text-sm text-muted-foreground">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-muted-foreground">{post.content}</p>
                  {post.images?.[0] && (
                    <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                      <img src={post.images[0].url} alt={post.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex gap-4">
                      <Button variant="ghost" size="sm" className="flex items-center gap-2">
                        <MessageCircle className="h-4 w-4" />
                        {post.comments?.length || 0}
                      </Button>
                    </div>
                    <div className="flex items-center text-amber-500">
                      <Flame className="mr-2 h-4 w-4" />
                      <span className="font-medium">{post.totalRewards || 0}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No posts yet
            </div>
          )}
        </TabsContent>

        <TabsContent value="nfts" className="pt-6">
          <div className="text-center py-12 text-muted-foreground">
            No NFTs yet
          </div>
        </TabsContent>

        <TabsContent value="collections" className="pt-6">
          <div className="text-center py-12 text-muted-foreground">
            No collections yet
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 
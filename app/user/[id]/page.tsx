'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
// import { Badge } from '@/components/ui/badge';
import { MessageCircle, Flame, Settings, Share2, Edit2, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import { useUserPosts, useGetUserByWallet, useFollowStatus, useFollowUser, useUnfollowUser, useUserBookmarks } from '@/lib/api/hooks';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

export default function UserProfile({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const { data: userData, isLoading: isLoadingUser } = useGetUserByWallet(id);
  const { data: postsData, isLoading: isLoadingPosts } = useUserPosts(id);
  const { data: followStatus } = useFollowStatus(userData?.data?.user?.id || '');
  const follow = useFollowUser();
  const unfollow = useUnfollowUser();
  const { data: bookmarksData, isLoading: isLoadingBookmarks } = useUserBookmarks(id);

  const handleFollow = async () => {
    if (!userData?.data?.user?.id) return;
    
    try {
      await follow.mutateAsync(userData.data.user.id);
      toast.success("Successfully followed user");
    } catch (error) {
      toast.error("Failed to follow user", {
        description: (error as Error).message,
      });
    }
  };

  const handleUnfollow = async () => {
    if (!userData?.data?.user?.id) return;
    
    try {
      await unfollow.mutateAsync(userData.data.user.id);
      toast.success("Successfully unfollowed user");
    } catch (error) {
      toast.error("Failed to unfollow user", {
        description: (error as Error).message,
      });
    }
  };

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
  const isFollowing = followStatus?.isFollowing;

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
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-muted border-4 border-background absolute -top-12 sm:-top-16 overflow-hidden">
              {user.profile?.avatar ? (
                <img 
                  src={user.profile.avatar} 
                  alt={user.profile?.name || 'User avatar'} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <User className="w-1/2 h-1/2 text-muted-foreground" />
                </div>
              )}
            </div>
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
              <Button 
                variant={isFollowing ? "outline" : "default"}
                onClick={isFollowing ? handleUnfollow : handleFollow}
                disabled={follow.isPending || unfollow.isPending}
              >
                {follow.isPending || unfollow.isPending ? (
                  "Loading..."
                ) : isFollowing ? (
                  "Unfollow"
                ) : (
                  "Follow"
                )}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="contents" className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="contents">Contents</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
          <TabsTrigger value="collections">Collections</TabsTrigger>
        </TabsList>

        <TabsContent value="contents" className="space-y-6 pt-6">
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
                      {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
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
              No contents yet
            </div>
          )}
        </TabsContent>

        <TabsContent value="badges" className="pt-6">
          <div className="text-center py-12 text-muted-foreground">
            No badges yet
          </div>
        </TabsContent>

        <TabsContent value="collections" className="pt-6">
          {isLoadingBookmarks ? (
            <div className="text-center py-12 text-muted-foreground">Loading bookmarks...</div>
          ) : bookmarksData?.data?.posts.length ? (
            bookmarksData.data.posts.map((post) => (
              <Card 
                key={post.id} 
                className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => router.push(`/post/${post.id}`)}
              >
                <div className="flex items-center gap-4">
                  {post.thumbnails?.[0] && (
                    <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden">
                      <img src={post.thumbnails[0].thumbnailUrl} alt={post.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground truncate">{post.title}</h3>
                    <span className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center py-12 text-muted-foreground">No bookmarks yet</div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
} 
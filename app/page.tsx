'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, MessageCircle, Flame, ChevronLeft, ChevronRight, Bookmark, User, Sparkles } from 'lucide-react';
import { useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useRecommendedPosts, usePopularPosts, useFollowedUsersPosts } from '@/lib/api/hooks';
import { formatDistanceToNow } from 'date-fns';
import { useUserStore } from '@/store/userStore';

export default function Home() {
  const router = useRouter();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { data: recommendedData, isLoading: isRecommendedLoading } = useRecommendedPosts();
  const { data: popularData, isLoading: isPopularLoading } = usePopularPosts();
  const user = useUserStore((state) => state.user);
  const { data: followingData, isLoading: isFollowingLoading } = useFollowedUsersPosts(
    user?.walletAddress || '',
    1,
    10
  );

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400;
      scrollContainerRef.current.scrollLeft += direction === 'left' ? -scrollAmount : scrollAmount;
    }
  };


  return (
    <div className="max-w-7xl mx-auto space-y-12">
      {/* Feed Section */}
      <div className="w-full">
        <Tabs defaultValue="for-you" className="w-full">
          <div className="flex items-center justify-between mb-6">
            <TabsList>
              <TabsTrigger value="for-you">For You</TabsTrigger>
              <TabsTrigger value="following">Following</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="for-you" className="relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm shadow-md hover:bg-accent border border-border"
                onClick={() => scroll('left')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
            <div 
              ref={scrollContainerRef}
              className="flex overflow-x-auto space-x-4 pb-4 px-4 scroll-smooth scrollbar-hide"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {isRecommendedLoading ? (
                <>
                  {[...Array(5)].map((_, index) => (
                    <div key={index} className="flex-none w-[300px] h-[400px] animate-pulse">
                      <div className="p-4">
                        <div className="flex items-center mb-3">
                          <div className="w-8 h-8 rounded-full bg-muted mr-2" />
                          <div className="flex-1">
                            <div className="h-4 w-24 bg-muted rounded mb-1" />
                            <div className="h-3 w-16 bg-muted rounded" />
                          </div>
                        </div>
                        <div className="w-full h-40 bg-muted rounded-lg mb-3" />
                        <div className="h-5 w-3/4 bg-muted rounded mb-2" />
                        <div className="h-4 w-full bg-muted rounded mb-2" />
                        <div className="h-4 w-2/3 bg-muted rounded mb-3" />
                        <div className="flex items-center justify-between">
                          <div className="flex space-x-3">
                            <div className="h-8 w-16 bg-muted rounded" />
                            <div className="h-8 w-16 bg-muted rounded" />
                          </div>
                          <div className="h-8 w-20 bg-muted rounded" />
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              ) : !recommendedData || recommendedData.posts.length === 0 ? (
                <div className="w-full text-center py-8 text-muted-foreground">
                  No contents available at the moment. Check back later!
                </div>
              ) : (
                <>
                  {recommendedData.posts.map((post) => (
                    <Card 
                      key={post.id} 
                      className="flex-none w-[300px] cursor-pointer hover:shadow-md transition-shadow py-0"
                      onClick={() => router.push(`/post/${post.id}`)}
                    >
                      <div className="p-4">
                        <div 
                          className="flex items-center mb-3 cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/user/${post.user.walletAddress}`);
                          }}
                        >
                          <div className="w-8 h-8 rounded-full bg-muted mr-2">
                            {post.user.profile?.avatar ? (
                              <img 
                                src={post.user.profile.avatar} 
                                alt={post.user.profile.name || ''} 
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                <User className="h-5 w-5" />
                              </div>
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold text-sm text-foreground">
                              {post.user.profile?.name || 'Anonymous'}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
                            </div>
                          </div>
                        </div>
                        {post.images?.[0]?.url && (
                          <div className="relative w-full h-40 mb-3 rounded-lg overflow-hidden">
                            <img
                              src={post.images[0].url}
                              alt={post.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <h2 className="font-semibold mb-2 text-foreground line-clamp-2">{post.title}</h2>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2 h-[2.5rem]">{post.content}</p>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex space-x-3">
                            <Button variant="ghost" size="sm" className="flex items-center px-2">
                              <MessageCircle className="mr-1 h-4 w-4" />
                              {post._count.comments}
                            </Button>
                            <Button variant="ghost" size="sm" className="flex items-center px-2">
                              <Bookmark className="mr-1 h-4 w-4" />
                              {post._count.bookmarks}
                            </Button>
                          </div>
                          <div className="flex items-center text-amber-500">
                            <Flame className="mr-1 h-4 w-4" />
                            <span className="font-medium">{post.rewardCount}</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                  {recommendedData.posts.length < 20 && (
                    <div className="flex-none w-[300px] h-[300px] flex flex-col items-center justify-center text-muted-foreground rounded-lg p-6">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        <Sparkles className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">You&apos;ve reached the end</h3>
                      <p className="text-sm text-center text-muted-foreground">
                        Check back later for more amazing content
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm shadow-md hover:bg-accent border border-border"
                onClick={() => scroll('right')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="following" className="relative">
            {!user ? (
              <div className="text-center py-8 text-muted-foreground">
                Please connect your wallet to see posts from users you follow
              </div>
            ) : isFollowingLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="flex-none animate-pulse">
                    <Card className="p-4">
                      <div className="flex items-center mb-3">
                        <div className="w-8 h-8 rounded-full bg-muted mr-2" />
                        <div className="flex-1">
                          <div className="h-4 w-24 bg-muted rounded mb-1" />
                          <div className="h-3 w-16 bg-muted rounded" />
                        </div>
                      </div>
                      <div className="w-full h-40 bg-muted rounded-lg mb-3" />
                      <div className="h-5 w-3/4 bg-muted rounded mb-2" />
                      <div className="h-4 w-full bg-muted rounded mb-2" />
                      <div className="h-4 w-2/3 bg-muted rounded" />
                    </Card>
                  </div>
                ))}
              </div>
            ) : !followingData || followingData.data.posts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Follow creators to see their content here
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {followingData.data.posts.map((post) => (
                  <Card 
                    key={post.id} 
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => router.push(`/post/${post.id}`)}
                  >
                    <div className="p-4">
                      <div 
                        className="flex items-center mb-3 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/user/${post.user.walletAddress}`);
                        }}
                      >
                        <div className="w-8 h-8 rounded-full bg-muted mr-2">
                          {post.user.profile?.avatar ? (
                            <img 
                              src={post.user.profile.avatar} 
                              alt={post.user.profile.name || ''} 
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                              <User className="h-5 w-5" />
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-sm text-foreground">
                            {post.user.profile?.name || 'Anonymous'}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
                          </div>
                        </div>
                      </div>
                      {post.images?.[0]?.url && (
                        <div className="relative w-full h-40 mb-3 rounded-lg overflow-hidden">
                          <img
                            src={post.images[0].url}
                            alt={post.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <h2 className="font-semibold mb-2 text-foreground line-clamp-2">{post.title}</h2>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2 h-[2.5rem]">{post.content}</p>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex space-x-3">
                          <Button variant="ghost" size="sm" className="flex items-center px-2">
                            <MessageCircle className="mr-1 h-4 w-4" />
                            {post._count?.comments || 0}
                          </Button>
                          <Button variant="ghost" size="sm" className="flex items-center px-2">
                            <Bookmark className="mr-1 h-4 w-4" />
                            {post._count?.bookmarks || 0}
                          </Button>
                        </div>
                        <div className="flex items-center text-amber-500">
                          <Flame className="mr-1 h-4 w-4" />
                          <span className="font-medium">{post.totalRewards}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Popular This Week Section */}
      <div className="w-full">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-primary" />
            <h2 className="text-xl font-bold text-foreground">Popular This Week</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-2"
            onClick={() => router.push('/rankings/weekly')}
          >
            View All
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-flow-col md:grid-rows-2 lg:grid-rows-3 gap-4 md:auto-cols-fr">
          {isPopularLoading ? (
            <>
              {[...Array(9)].map((_, index) => (
                <div key={index} className="p-4 animate-pulse">
                  <div className="flex items-start">
                    <div className="w-8 h-8 rounded-full bg-muted mr-4" />
                    <div className="flex-1">
                      <div className="h-4 w-24 bg-muted rounded mb-2" />
                      <div className="h-5 w-3/4 bg-muted rounded mb-2" />
                      <div className="h-4 w-full bg-muted rounded mb-2" />
                      <div className="h-4 w-2/3 bg-muted rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </>
          ) : popularData?.posts.slice(0, 9).map((post, index) => (
            <Card 
              key={post.id} 
              className="p-4 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => router.push(`/post/${post.id}`)}
            >
              <div className="flex items-start">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold mr-4">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div 
                    className="flex items-center mb-2 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/user/${post.user.walletAddress}`);
                    }}
                  >
                    <h3 className="font-semibold mr-2 text-foreground">{post.user.profile?.name || 'Anonymous'}</h3>
                    <Badge variant="outline" className="text-xs">Trending</Badge>
                  </div>
                  <h4 className="font-medium mb-1 text-foreground line-clamp-2">{post.title}</h4>
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2 h-[2.5rem]">{post.content}</p>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <div className="flex items-center text-amber-500">
                      <Flame className="h-4 w-4 mr-1" />
                      <span className="font-medium">{post.rewardCount}</span>
                      <span className="ml-1 text-muted-foreground">rewards</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}


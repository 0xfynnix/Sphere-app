'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Heart, MessageCircle, Flame, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useRecommendedPosts } from '@/lib/api/hooks';

export default function Home() {
  const router = useRouter();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { data: recommendedData, isLoading: isRecommendedLoading } = useRecommendedPosts();

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400;
      scrollContainerRef.current.scrollLeft += direction === 'left' ? -scrollAmount : scrollAmount;
    }
  };

  const popularPosts = [
    {
      id: 5,
      author: "Charlie",
      authorId: "charlie789",
      title: "Digital Photography Series",
      content: "Capturing the essence of urban life through my lens. Each photo tells a unique story.",
      likes: 289,
      rewards: 85,
      image: "/sample-photo.jpg",
      rank: 1
    },
    {
      id: 6,
      author: "David",
      authorId: "david012",
      title: "The Future of Web3",
      content: "An in-depth analysis of where blockchain technology is heading...",
      likes: 245,
      rewards: 72,
      image: "/sample-blog.jpg",
      rank: 2
    },
    {
      id: 7,
      author: "Eva",
      authorId: "eva345",
      title: "Abstract Art Collection",
      content: "Exploring colors and emotions through digital medium...",
      likes: 192,
      rewards: 64,
      image: "/sample-art-2.jpg",
      rank: 3
    }
  ].sort((a, b) => b.rewards - a.rewards);

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
                <div className="flex-none w-[300px] h-[200px] animate-pulse bg-muted rounded-lg" />
              ) : recommendedData?.posts.map((post) => (
                <Card 
                  key={post.id} 
                  className="flex-none w-[300px] cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => router.push(`/posts/${post.id}`)}
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
                        {post.user.profile?.avatar && (
                          <img 
                            src={post.user.profile.avatar} 
                            alt={post.user.profile.name || ''} 
                            className="w-full h-full rounded-full object-cover"
                          />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm text-foreground">
                          {post.user.profile?.name || post.user.walletAddress.slice(0, 6)}
                        </h3>
                        <p className="text-xs text-muted-foreground">2h ago</p>
                      </div>
                    </div>
                    <h2 className="font-semibold mb-2 text-foreground">{post.title}</h2>
                    <p className="text-sm text-muted-foreground mb-3">{post.content}</p>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex space-x-3">
                        <Button variant="ghost" size="sm" className="flex items-center px-2">
                          <MessageCircle className="mr-1 h-4 w-4" />
                          {post._count.comments}
                        </Button>
                        <Button variant="ghost" size="sm" className="flex items-center px-2">
                          <Heart className="mr-1 h-4 w-4" />
                          {post._count.bookmarks}
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
            <div className="text-center py-8 text-muted-foreground">
              Follow creators to see their content here
            </div>
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
        <div className="space-y-4">
          {popularPosts.map((post) => (
            <Card 
              key={post.id} 
              className="p-4 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => router.push(`/posts/${post.id}`)}
            >
              <div className="flex items-start">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold mr-4">
                  {post.rank}
                </div>
                <div className="flex-1">
                  <div 
                    className="flex items-center mb-2 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/my-page/${post.authorId}`);
                    }}
                  >
                    <h3 className="font-semibold mr-2 text-foreground">{post.author}</h3>
                    <Badge variant="outline" className="text-xs">Trending</Badge>
                  </div>
                  <h4 className="font-medium mb-1 text-foreground">{post.title}</h4>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <div className="flex items-center text-amber-500">
                      <Flame className="h-4 w-4 mr-1" />
                      <span className="font-medium">{post.rewards}</span>
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

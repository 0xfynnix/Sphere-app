'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Heart, MessageCircle, Flame, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef } from 'react';

export default function Home() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400;
      scrollContainerRef.current.scrollLeft += direction === 'left' ? -scrollAmount : scrollAmount;
    }
  };

  const feedPosts = [
    {
      id: 1,
      author: "Alice",
      title: "My First Digital Art Collection",
      content: "Just launched my first NFT collection!",
      likes: 42,
      rewards: 24,
      image: "/sample-art.jpg"
    },
    {
      id: 2,
      author: "Bob",
      title: "Web3 Development Tutorial",
      content: "Building decentralized applications",
      likes: 128,
      rewards: 56,
      image: "/sample-code.jpg"
    },
    {
      id: 3,
      author: "Charlie",
      title: "Photography Series",
      content: "Urban life through my lens",
      likes: 89,
      rewards: 31,
      image: "/sample-photo.jpg"
    },
    {
      id: 4,
      author: "David",
      title: "AI Art Exploration",
      content: "Experimenting with AI tools",
      likes: 156,
      rewards: 42,
      image: "/sample-ai.jpg"
    }
  ];

  const popularPosts = [
    {
      id: 5,
      author: "Charlie",
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
      title: "Abstract Art Collection",
      content: "Exploring colors and emotions through digital medium...",
      likes: 192,
      rewards: 64,
      image: "/sample-art-2.jpg",
      rank: 3
    }
  ].sort((a, b) => b.rewards - a.rewards);

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      {/* Feed Section */}
      <div>
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
                className="h-8 w-8 rounded-full bg-white shadow-md"
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
              {feedPosts.map((post) => (
                <Card key={post.id} className="flex-none w-[300px]">
                  <div className="p-4">
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200 mr-2"></div>
                      <div>
                        <h3 className="font-semibold text-sm">{post.author}</h3>
                        <p className="text-xs text-gray-500">2h ago</p>
                      </div>
                    </div>
                    <h2 className="font-semibold mb-2">{post.title}</h2>
                    <p className="text-sm text-gray-600 mb-3">{post.content}</p>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex space-x-3">
                        <Button variant="ghost" size="sm" className="flex items-center px-2">
                          <Heart className="mr-1 h-4 w-4" />
                          {post.likes}
                        </Button>
                        <Button variant="ghost" size="sm" className="flex items-center px-2">
                          <MessageCircle className="mr-1 h-4 w-4" />
                          Comment
                        </Button>
                      </div>
                      <div className="flex items-center text-amber-500">
                        <Flame className="mr-1 h-4 w-4" />
                        <span className="font-medium">{post.rewards}</span>
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
                className="h-8 w-8 rounded-full bg-white shadow-md"
                onClick={() => scroll('right')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="following" className="relative">
            <div className="text-center py-8 text-gray-500">
              Follow creators to see their content here
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Popular This Week Section */}
      <div>
        <div className="flex items-center mb-6">
          <TrendingUp className="h-5 w-5 mr-2 text-blue-500" />
          <h2 className="text-xl font-bold">Popular This Week</h2>
        </div>
        <div className="space-y-4">
          {popularPosts.map((post) => (
            <Card key={post.id} className="p-4">
              <div className="flex items-start">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold mr-4">
                  {post.rank}
                </div>
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <h3 className="font-semibold mr-2">{post.author}</h3>
                    <Badge variant="outline" className="text-xs">Trending</Badge>
                  </div>
                  <h4 className="font-medium mb-1">{post.title}</h4>
                  <div className="flex items-center text-sm text-gray-500">
                    <div className="flex items-center text-amber-500">
                      <Flame className="h-4 w-4 mr-1" />
                      <span className="font-medium">{post.rewards}</span>
                      <span className="ml-1 text-gray-500">rewards</span>
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

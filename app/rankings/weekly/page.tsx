'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, TrendingUp, Flame, Heart, MessageCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function WeeklyRankings() {
  const router = useRouter();

  // 模拟周排行榜数据
  const weeklyRankings = [
    {
      id: 1,
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
      id: 2,
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
      id: 3,
      author: "Eva",
      authorId: "eva345",
      title: "Abstract Art Collection",
      content: "Exploring colors and emotions through digital medium...",
      likes: 192,
      rewards: 64,
      image: "/sample-art-2.jpg",
      rank: 3
    },
    {
      id: 4,
      author: "Frank",
      authorId: "frank678",
      title: "AI Art Exploration",
      content: "Pushing the boundaries of AI-generated art...",
      likes: 156,
      rewards: 58,
      image: "/sample-ai.jpg",
      rank: 4
    },
    {
      id: 5,
      author: "Grace",
      authorId: "grace901",
      title: "Digital Sculpture Series",
      content: "Creating 3D art in the digital space...",
      likes: 142,
      rewards: 52,
      image: "/sample-3d.jpg",
      rank: 5
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <Button
          variant="ghost"
          className="-ml-2"
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-bold">Weekly Rankings</h1>
        </div>
        <div className="w-10"></div> {/* Spacer for alignment */}
      </div>

      <div className="space-y-4">
        {weeklyRankings.map((post) => (
          <Card 
            key={post.id} 
            className="p-6 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => router.push(`/posts/${post.id}`)}
          >
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-bold">
                {post.rank}
              </div>
              <div className="flex-1">
                <div 
                  className="flex items-center mb-2 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/user/${post.authorId}`);
                  }}
                >
                  <h3 className="font-semibold mr-2 text-foreground">{post.author}</h3>
                  <Badge variant="outline" className="text-xs">Trending</Badge>
                </div>
                <h4 className="font-medium mb-2 text-foreground">{post.title}</h4>
                <p className="text-muted-foreground mb-4">{post.content}</p>
                <div className="flex items-center justify-between">
                  <div className="flex gap-4">
                    <Button variant="ghost" size="sm" className="flex items-center gap-2">
                      <Heart className="h-4 w-4" />
                      {post.likes}
                    </Button>
                    <Button variant="ghost" size="sm" className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4" />
                      Comment
                    </Button>
                  </div>
                  <div className="flex items-center text-amber-500">
                    <Flame className="mr-2 h-4 w-4" />
                    <span className="font-medium">{post.rewards}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
} 
'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, Flame, ArrowLeft, Gift } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import { useState } from 'react';
import { RewardDialog } from '@/components/reward/RewardDialog';

export default function PostDetail({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [isRewardDialogOpen, setIsRewardDialogOpen] = useState(false);
  
  // 模拟数据，实际应用中应该从API获取
  const post = {
    id,
    author: "Alice",
    authorId: "alice123", // 添加作者ID
    title: "My First Digital Art Collection",
    content: "Just launched my first NFT collection! This is a detailed description of my artwork and the inspiration behind it. I've been working on this project for months, and I'm excited to finally share it with the world.",
    likes: 42,
    rewards: 24,
    image: "/sample-art.jpg",
    comments: [
      {
        id: 1,
        author: "Bob",
        authorId: "bob456",
        content: "Amazing work! Love the colors.",
        timestamp: "2h ago"
      },
      {
        id: 2,
        author: "Charlie",
        authorId: "charlie789",
        content: "The composition is really unique.",
        timestamp: "1h ago"
      }
    ]
  };

  const handleReward = (amount: number) => {
    // 这里处理打赏逻辑
    console.log(`Rewarding ${amount} to post ${id}`);
    // TODO: 调用打赏API
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Button
        variant="ghost"
        className="mb-4"
        onClick={() => router.back()}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <Card className="p-6">
        <div className="space-y-6">
          {/* Author Info */}
          <div 
            className="flex items-center cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => router.push(`/user/${post.authorId}`)}
          >
            <div className="w-10 h-10 rounded-full bg-muted mr-3"></div>
            <div>
              <h3 className="font-semibold text-foreground">{post.author}</h3>
              <p className="text-sm text-muted-foreground">Posted 2h ago</p>
            </div>
          </div>

          {/* Post Content */}
          <div>
            <h2 className="text-2xl font-bold mb-4 text-foreground">{post.title}</h2>
            <p className="text-muted-foreground mb-6">{post.content}</p>
            <div className="aspect-video bg-muted rounded-lg mb-6"></div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex space-x-4">
              <Button variant="ghost" className="flex items-center">
                <Heart className="mr-2 h-4 w-4" />
                {post.likes}
              </Button>
              <Button variant="ghost" className="flex items-center">
                <MessageCircle className="mr-2 h-4 w-4" />
                {post.comments.length}
              </Button>
              <Button 
                variant="ghost" 
                className="flex items-center"
                onClick={() => setIsRewardDialogOpen(true)}
              >
                <Gift className="mr-2 h-4 w-4" />
                Reward
              </Button>
            </div>
            <div className="flex items-center text-amber-500">
              <Flame className="mr-2 h-4 w-4" />
              <span className="font-medium">{post.rewards}</span>
            </div>
          </div>

          {/* Comments */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Comments</h3>
            {post.comments.map((comment) => (
              <Card key={comment.id} className="p-4">
                <div 
                  className="flex items-start cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => router.push(`/user/${comment.authorId}`)}
                >
                  <div className="w-8 h-8 rounded-full bg-muted mr-3"></div>
                  <div>
                    <div className="flex items-center mb-1">
                      <h4 className="font-semibold mr-2 text-foreground">{comment.author}</h4>
                      <span className="text-sm text-muted-foreground">{comment.timestamp}</span>
                    </div>
                    <p className="text-muted-foreground">{comment.content}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </Card>

      <RewardDialog
        isOpen={isRewardDialogOpen}
        onClose={() => setIsRewardDialogOpen(false)}
        onReward={handleReward}
      />
    </div>
  );
} 
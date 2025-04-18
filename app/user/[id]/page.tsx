'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
// import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, Flame, Settings, Share2, Edit2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { use } from 'react';

export default function UserProfile({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  // const searchParams = useSearchParams();
  const { id } = use(params);

  // 检查是否是从侧边栏进入
  // const isFromSidebar = searchParams.get('source') === 'sidebar';

  // 模拟当前用户ID，实际应用中应该从用户认证信息中获取
  const currentUserId = "alice123";
  const isCurrentUser = id === currentUserId;

  // 模拟用户数据
  const user = {
    id,
    name: isCurrentUser ? "Alice" : "Bob",
    username: isCurrentUser ? "@alice123" : "@bob456",
    bio: isCurrentUser 
      ? "Digital artist and NFT creator. Exploring the intersection of art and technology."
      : "Web3 developer and blockchain enthusiast. Building the future of decentralized applications.",
    followers: isCurrentUser ? 1234 : 567,
    following: isCurrentUser ? 567 : 123,
    posts: isCurrentUser ? 42 : 18,
    avatar: "/sample-avatar.jpg",
    cover: "/sample-cover.jpg",
    isFollowing: !isCurrentUser && false
  };

  // 模拟用户的帖子
  const userPosts = [
    {
      id: 1,
      title: isCurrentUser ? "My First Digital Art Collection" : "Web3 Development Tutorial",
      content: isCurrentUser 
        ? "Just launched my first NFT collection!"
        : "Building decentralized applications",
      likes: isCurrentUser ? 42 : 128,
      rewards: isCurrentUser ? 24 : 56,
      image: "/sample-art.jpg",
      timestamp: "2h ago"
    },
    {
      id: 2,
      title: isCurrentUser ? "New Artwork Preview" : "Smart Contract Security",
      content: isCurrentUser 
        ? "Working on something special..."
        : "Important security considerations for smart contracts",
      likes: isCurrentUser ? 89 : 156,
      rewards: isCurrentUser ? 31 : 42,
      image: "/sample-art-2.jpg",
      timestamp: "1d ago"
    }
  ];

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
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{user.name}</h1>
              <p className="text-muted-foreground">{user.username}</p>
            </div>
            <p className="text-muted-foreground max-w-2xl">{user.bio}</p>
            <div className="flex items-center gap-6 pt-2">
              <div className="flex items-center gap-1">
                <span className="font-semibold text-foreground">{user.posts}</span>
                <span className="text-muted-foreground">Posts</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-semibold text-foreground">{user.followers}</span>
                <span className="text-muted-foreground">Followers</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-semibold text-foreground">{user.following}</span>
                <span className="text-muted-foreground">Following</span>
              </div>
            </div>
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
              <Button variant={user.isFollowing ? "outline" : "default"}>
                {user.isFollowing ? "Following" : "Follow"}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
          <TabsTrigger value="collections">Collections</TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-6 pt-6">
          {userPosts.map((post) => (
            <Card 
              key={post.id} 
              className="p-6 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => router.push(`/posts/${post.id}`)}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">{post.title}</h3>
                  <span className="text-sm text-muted-foreground">{post.timestamp}</span>
                </div>
                <p className="text-muted-foreground">{post.content}</p>
                <div className="aspect-video bg-muted rounded-lg"></div>
                <div className="flex items-center justify-between pt-2">
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
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="rewards" className="pt-6">
          <div className="text-center py-12 text-muted-foreground">
            No rewards yet
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
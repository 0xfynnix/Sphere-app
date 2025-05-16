'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Flame, MessageCircle, Bookmark } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { usePopularPosts } from '@/lib/api/hooks';
import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';

export default function WeeklyRankings() {
  const router = useRouter();
  const { data: popularPosts, isLoading, error } = usePopularPosts();

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h1 className="text-2xl font-bold">Weekly Ranking</h1>
          </div>
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, index) => (
            <Card key={index} className="p-6 animate-pulse">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-muted" />
                <div className="flex-1">
                  <div className="h-4 w-32 bg-muted rounded mb-2" />
                  <div className="h-6 w-3/4 bg-muted rounded mb-2" />
                  <div className="h-4 w-full bg-muted rounded mb-4" />
                  <div className="flex items-center justify-between">
                    <div className="flex gap-4">
                      <div className="h-8 w-20 bg-muted rounded" />
                      <div className="h-8 w-20 bg-muted rounded" />
                    </div>
                    <div className="h-8 w-16 bg-muted rounded" />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-red-500">
          Failed to load rankings. Please try again later.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-bold">Weekly Ranking</h1>
        </div>
        <div className="w-10"></div>
      </div>

      <div className="grid gap-6">
        {popularPosts?.posts.map((post, index) => (
          <Card 
            key={post.id} 
            className="overflow-hidden py-0 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => router.push(`/post/${post.id}`)}
          >
            <div className="flex flex-col sm:flex-row">
              {/* 左侧缩略图 */}
              <div className="relative w-full sm:w-48 h-32 sm:h-48 flex-shrink-0 p-3">
                <div className="relative w-full h-full rounded-lg overflow-hidden">
                  {post.images && post.images.length > 0 ? (
                    <Image
                      src={post.images[0].url}
                      alt={post.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center rounded-lg">
                      <span className="text-muted-foreground">No image</span>
                    </div>
                  )}
                  <div className="absolute top-2 left-2 flex items-center justify-center w-8 h-8 rounded-full bg-primary/90 text-primary-foreground font-bold">
                    {index + 1}
                  </div>
                </div>
              </div>

              {/* 右侧内容 */}
              <div className="flex-1 p-4 sm:p-6">
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <div 
                    className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/user/${post.user.walletAddress}`);
                    }}
                  >
                    <h3 className="font-semibold text-foreground text-sm sm:text-base">
                      {post.user.profile?.name || 'Anonymous'}
                    </h3>
                    <Badge variant="outline" className="text-xs">Trending</Badge>
                  </div>
                  <div className="flex items-center text-amber-500">
                    <Flame className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="font-medium text-sm sm:text-base">{post.rewardCount}</span>
                  </div>
                </div>

                <h4 className="font-medium text-base sm:text-lg mb-2 text-foreground line-clamp-1">{post.title}</h4>
                <p className="text-muted-foreground text-sm sm:text-base mb-3 sm:mb-4 line-clamp-2">{post.content}</p>

                <div className="flex items-center justify-between">
                  <div className="flex gap-2 sm:gap-4">
                    <Button variant="ghost" size="sm" className="flex items-center gap-1 sm:gap-2 h-8 sm:h-9">
                      <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="text-xs sm:text-sm">{post._count.comments}</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="flex items-center gap-1 sm:gap-2 h-8 sm:h-9">
                      <Bookmark className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="text-xs sm:text-sm">{post._count.bookmarks}</span>
                    </Button>
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
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
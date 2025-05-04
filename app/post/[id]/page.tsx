'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, Gift } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import { useState } from 'react';
import { RewardDialog } from '@/components/reward/RewardDialog';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from 'lucide-react';
import { usePost, useToggleLike, useCreateComment } from '@/lib/api/hooks';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';

interface CommentFormData {
  content: string;
}

export default function PostDetail({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [isRewardDialogOpen, setIsRewardDialogOpen] = useState(false);
  const { data: post, isLoading, error } = usePost(id);
  const toggleLike = useToggleLike();
  const createComment = useCreateComment();
  const { register, handleSubmit, reset } = useForm<CommentFormData>();

  const handleReward = (amount: number) => {
    // 这里处理打赏逻辑
    console.log(`Rewarding ${amount} to post ${id}`);
    // TODO: 调用打赏API
  };

  const handleLike = () => {
    toggleLike.mutate(id);
  };

  const onSubmit = (data: CommentFormData) => {
    createComment.mutate({ postId: id, content: data.content });
    reset();
  };

  if (isLoading) {
    return <div className="max-w-4xl mx-auto p-6">Loading...</div>;
  }

  if (error) {
    return <div className="max-w-4xl mx-auto p-6 text-red-500">{error.message}</div>;
  }

  if (!post) {
    return <div className="max-w-4xl mx-auto p-6">Post not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* <Button
        variant="ghost"
        className="mb-4"
        onClick={() => router.back()}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button> */}

      <Card className="p-6">
        <div className="space-y-6">
          {/* Author Info */}
          <div 
            className="flex items-center cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => router.push(`/user/${post.author.id}`)}
          >
            <Avatar className="h-10 w-10 mr-3">
              {post.author.avatar ? (
                <AvatarImage src={post.author.avatar} />
              ) : (
                <AvatarFallback>
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-muted">
                    <User className="h-5 w-5 text-muted-foreground" />
                  </div>
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <h3 className="font-semibold text-foreground">{post.author.name}</h3>
              <p className="text-sm text-muted-foreground">
                Posted {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>

          {/* Post Content */}
          <div>
            <h2 className="text-2xl font-bold mb-4 text-foreground">{post.title}</h2>
            <p className="text-muted-foreground mb-6">{post.content}</p>
            {post.images.length > 0 && (
              <div className="aspect-video bg-muted rounded-lg mb-6 overflow-hidden">
                <img 
                  src={post.images[0].url} 
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex space-x-4">
              <Button 
                variant="ghost" 
                className="flex items-center"
                onClick={handleLike}
              >
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
          </div>

          {/* Comment Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Textarea
              {...register('content', { required: true })}
              placeholder="Write a comment..."
              className="min-h-[100px]"
            />
            <Button type="submit" disabled={createComment.isPending}>
              {createComment.isPending ? 'Posting...' : 'Post Comment'}
            </Button>
          </form>

          {/* Comments */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Comments</h3>
            {post.comments.map((comment) => (
              <Card key={comment.id} className="p-4">
                <div 
                  className="flex items-start cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => router.push(`/user/${comment.author.id}`)}
                >
                  <Avatar className="h-8 w-8 mr-3">
                    {comment.author.avatar ? (
                      <AvatarImage src={comment.author.avatar} />
                    ) : (
                      <AvatarFallback>
                        <div className="flex h-full w-full items-center justify-center rounded-full bg-muted">
                          <User className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <div className="flex items-center mb-1">
                      <h4 className="font-semibold mr-2 text-foreground">{comment.author.name}</h4>
                      <span className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.timestamp), { addSuffix: true })}
                      </span>
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
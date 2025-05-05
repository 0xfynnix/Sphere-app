'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
import { MessageCircle, Gift, Clock, Gavel, Trophy } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import { useState, useEffect } from 'react';
import { RewardDialog } from '@/components/reward/RewardDialog';
import { formatDistanceToNow, formatDistance } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from 'lucide-react';
import { usePost, useCreateComment, useBids } from '@/lib/api/hooks';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BidDialog } from "@/components/dialog/BidDialog";

interface CommentFormData {
  content: string;
}

export default function PostDetail({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [isRewardDialogOpen, setIsRewardDialogOpen] = useState(false);
  const [isBidDialogOpen, setIsBidDialogOpen] = useState(false);
  const { data: post, isLoading, error } = usePost(id);
  const { data: bidsData } = useBids(id);
  const createComment = useCreateComment();
  const { register, handleSubmit, reset } = useForm<CommentFormData>();
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => setShowConfetti(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  const handleReward = (amount: number) => {
    // 这里处理打赏逻辑
    console.log(`Rewarding ${amount} to post ${id}`);
    // TODO: 调用打赏API
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

  const isBiddingActive = post.allowBidding && post.biddingDueDate && new Date(post.biddingDueDate) > new Date();

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
              <PhotoProvider>
                <div className="bg-muted rounded-lg mb-6 overflow-hidden flex justify-center items-center">
                  <PhotoView src={post.images[0].url}>
                    <img 
                      src={post.images[0].url} 
                      alt={post.title}
                      className="max-w-full h-auto cursor-pointer"
                    />
                  </PhotoView>
                </div>
              </PhotoProvider>
            )}
          </div>

          {/* Bidding Section */}
          {post?.allowBidding && (
            <div className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">Bidding</h3>
                  <p className="text-sm text-muted-foreground">
                    Start Price: {post.startPrice} SUI
                  </p>
                </div>
                {isBiddingActive && post.biddingDueDate ? (
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="mr-1 h-4 w-4" />
                      Ends in {formatDistance(new Date(post.biddingDueDate), new Date())}
                    </div>
                    <BidDialog
                      isOpen={isBidDialogOpen}
                      onOpenChange={setIsBidDialogOpen}
                      startPrice={post.startPrice || 0}
                      currentBids={bidsData?.bids || []}
                      postId={id}
                      trigger={
                        <Button>
                          <Gavel className="mr-2 h-4 w-4" />
                          Place Bid
                        </Button>
                      }
                    />
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    Bidding ended
                  </div>
                )}
              </div>

              {/* Bidding History */}
              <div className="space-y-2">
                <h4 className="font-medium">Bidding History</h4>
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Bidder</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bidsData?.bids && bidsData.bids.length > 0 ? (
                        bidsData.bids.map((bid) => (
                          <TableRow key={bid.id}>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Avatar className="h-6 w-6">
                                  {bid.user.avatar ? (
                                    <AvatarImage src={bid.user.avatar} />
                                  ) : (
                                    <AvatarFallback>
                                      <User className="h-3 w-3" />
                                    </AvatarFallback>
                                  )}
                                </Avatar>
                                <span>{bid.user.name}</span>
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">{bid.amount} SUI</TableCell>
                            <TableCell className="text-muted-foreground">
                              {formatDistanceToNow(new Date(bid.createdAt), { addSuffix: true })}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={3} className="h-24 text-center">
                            <div className="flex flex-col items-center justify-center space-y-2">
                              <Trophy className="h-8 w-8 text-muted-foreground" />
                              <p className="text-sm text-muted-foreground">No bids yet. Be the first to bid!</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex space-x-4">
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
'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
import { MessageCircle, Gift, Clock, Gavel, History, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { use, useMemo } from 'react';
import { useState, useEffect } from 'react';
import { RewardDialog } from '@/components/dialog/RewardDialog';
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
import { AuctionHistoryDialog } from "@/components/dialog/AuctionHistoryDialog";
import { ShareDialog } from "@/components/dialog/ShareDialog";
import { useUserStore } from '@/store/userStore';
import { StartAuctionButton } from "@/components/auction/StartAuctionButton";

interface CommentFormData {
  content: string;
}

export default function PostDetail({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { id } = use(params);
  const [isRewardDialogOpen, setIsRewardDialogOpen] = useState(false);
  const [isBidDialogOpen, setIsBidDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const { data: post, isLoading, error, refetch } = usePost(id);
  // console.log(post);
  const { data: bidsData } = useBids(id, page, pageSize);
  const createComment = useCreateComment();
  const { register, handleSubmit, reset } = useForm<CommentFormData>();
  const [showConfetti, setShowConfetti] = useState(false);
  const user = useUserStore((state) => state.user);

  // 处理弹窗状态重置
  const handleBidDialogOpenChange = (open: boolean) => {
    setIsBidDialogOpen(open);
    if (!open) {
      // 当弹窗关闭时，重置相关状态
      setShowConfetti(false);
    }
  };

  const handleRewardDialogOpenChange = (open: boolean) => {
    setIsRewardDialogOpen(open);
    if (!open) {
      // 当弹窗关闭时，重置相关状态
      setShowConfetti(false);
    }
  };

  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => setShowConfetti(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  // 处理推荐码
  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref && post?.shareCode) {
      try {
        // 解析分享码格式：用户分享码-帖子分享码
        const [userShareCode, postShareCode] = ref.split('-');
        
        // 验证分享码是否有效
        if (postShareCode === post.shareCode) {
          // TODO: 记录推荐数据到数据库
          console.log(`Referral from user with share code: ${userShareCode} for post: ${postShareCode}`);
        }
      } catch (error) {
        console.error('Invalid referral code:', error);
      }
    }
  }, [searchParams, post?.shareCode]);
  const isAuthor = useMemo(() => user?.walletAddress && user?.walletAddress === post?.author?.walletAddress, [user, post]);

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
          {post?.allowBidding ? (
            <div className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">Bidding</h3>
                  <p className="text-sm text-muted-foreground">
                    Start Price: {post.startPrice} SUI
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  {isBiddingActive && post.biddingDueDate ? (
                    <>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="mr-1 h-4 w-4" />
                        Ends in {formatDistance(new Date(post.biddingDueDate), new Date())}
                      </div>
                      {!isAuthor && (
                        <BidDialog
                          isOpen={isBidDialogOpen}
                          onOpenChange={handleBidDialogOpenChange}
                          startPrice={post.startPrice || 0}
                          currentBids={bidsData?.bids || []}
                          postId={id}
                          currentHighestBid={post.currentHighestBid}
                          auctionId={post.auctionObjectId}
                          trigger={
                            <Button>
                              <Gavel className="mr-2 h-4 w-4" />
                              Place Bid
                            </Button>
                          }
                        />
                      )}
                    </>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      Bidding ended
                    </div>
                  )}
                  <AuctionHistoryDialog
                    postId={id}
                    trigger={
                      <Button variant="outline">
                        <History className="mr-2 h-4 w-4" />
                        View History
                      </Button>
                    }
                  />
                </div>
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
                          <TableCell colSpan={3} className="text-center text-muted-foreground">
                            No bids yet
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                  {bidsData?.pagination && bidsData.pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPage(page - 1)}
                          disabled={page === 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm text-muted-foreground">
                          Page {page} of {bidsData.pagination.totalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPage(page + 1)}
                          disabled={page === bidsData.pagination.totalPages}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Total {bidsData.pagination.total} bids
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : isAuthor && !post.allowBidding && (
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">Auction</h3>
                  <p className="text-sm text-muted-foreground">
                    Start an auction for this Post
                  </p>
                </div>
                <StartAuctionButton
                  nftObjectId={post.nftObjectId}
                  postId={id}
                  onSuccess={() => {
                    // 刷新帖子数据
                    refetch();
                  }}
                />
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
              <ShareDialog postId={id} postShareCode={post.shareCode} />
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
        onClose={() => handleRewardDialogOpenChange(false)}
        postId={id}
        ref={user?.shareCode ? `${user.shareCode}-${post.shareCode}` : ''}
        nftObjectId={post.nftObjectId}
      />
    </div>
  );
} 
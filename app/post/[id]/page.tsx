"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
// import { Badge } from '@/components/ui/badge';
import {
  MessageCircle,
  Gift,
  Clock,
  Gavel,
  History,
  ChevronLeft,
  ChevronRight,
  Share,
  Network,
  Bookmark,
  BookmarkMinus,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { use, useMemo } from "react";
import { useState, useEffect } from "react";
import { RewardDialog } from "@/components/dialog/RewardDialog";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";
import { usePost, useCreateComment, useBids, useComments, useBookmarkPost, useUnbookmarkPost, useBookmarkStatus, useLotteryPool } from "@/lib/api/hooks";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { PhotoProvider, PhotoView } from "react-photo-view";
import "react-photo-view/dist/react-photo-view.css";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BidDialog } from "@/components/dialog/BidDialog";
import { AuctionHistoryDialog } from "@/components/dialog/AuctionHistoryDialog";
import { ShareDialog } from "@/components/dialog/ShareDialog";
import { useUserStore } from "@/store/userStore";
import { StartAuctionButton } from "@/components/auction/StartAuctionButton";
import Countdown from "react-countdown";
import { motion } from "framer-motion";
import { CompleteAuctionDialog } from "@/components/dialog/CompleteAuctionDialog";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

// 获取区块链浏览器 URL
const getExplorerUrl = (objectId: string) => {
  const network = process.env.NEXT_PUBLIC_SUI_NETWORK;
  if (network === "testnet") {
    return `https://suiexplorer.com/object/${objectId}?network=testnet`;
  }
  return `https://suiexplorer.com/object/${objectId}`;
};

// 独立的倒计时组件
interface CountdownDisplayProps {
  hours: number;
  minutes: number;
  seconds: number;
  completed: boolean;
  isAuthor: boolean;
  postId: string;
}

const CountdownDisplay = ({
  hours,
  minutes,
  seconds,
  completed,
  isAuthor,
  postId,
}: CountdownDisplayProps) => {
  const [isCompleteAuctionOpen, setIsCompleteAuctionOpen] = useState(false);
  const { data: post } = usePost(postId);

  if (completed) {
    return (
      <div className="flex items-center space-x-2">
        {isAuthor && post?.currentAuction ? (
          <>
            <Button
              variant="outline"
              size="sm"
              className="bg-gradient-to-r from-violet-500 to-indigo-500 text-white hover:from-violet-600 hover:to-indigo-600 border-none"
              onClick={() => setIsCompleteAuctionOpen(true)}
            >
              Complete Auction
            </Button>
            <CompleteAuctionDialog
              isOpen={isCompleteAuctionOpen}
              onOpenChange={setIsCompleteAuctionOpen}
              postId={post.id}
              auctionId={post.currentAuction.auctionObjectId}
              auctionCapId={post.currentAuction.auctionCapObjectId}
              currentHighestBid={post.currentAuction.finalPrice || undefined}
            />
          </>
        ) : null}
      </div>
    );
  }

  // 将数字拆分为十位和个位
  const formatNumber = (num: number) => {
    const str = num.toString().padStart(2, "0");
    return {
      tens: str[0],
      ones: str[1],
    };
  };

  const hoursDigits = formatNumber(hours);
  const minutesDigits = formatNumber(minutes);
  const secondsDigits = formatNumber(seconds);

  return (
    <motion.div
      className="flex items-center text-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        animate={{
          rotate: [0, 360],
          scale: [1, 1.1, 1],
        }}
        transition={{
          rotate: { duration: 60, repeat: Infinity, ease: "linear" },
          scale: { duration: 2, repeat: Infinity },
        }}
        className="text-violet-500"
      >
        <Clock className="mr-1 h-4 w-4" />
      </motion.div>
      <span className="font-medium bg-gradient-to-tr from-violet-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent">
        Ends in{" "}
      </span>
      <div className="flex ml-1 space-x-1">
        {hours > 0 && (
          <div className="flex">
            <motion.span
              key={`hours-tens-${hoursDigits.tens}`}
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="font-mono bg-gradient-to-br from-violet-500 via-indigo-500 to-violet-500 bg-clip-text text-transparent"
            >
              {hoursDigits.tens}
            </motion.span>
            <motion.span
              key={`hours-ones-${hoursDigits.ones}`}
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="font-mono bg-gradient-to-br from-violet-500 via-indigo-500 to-violet-500 bg-clip-text text-transparent"
            >
              {hoursDigits.ones}
            </motion.span>
            <span className="font-mono bg-gradient-to-bl from-violet-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent">
              h
            </span>
          </div>
        )}
        <div className="flex">
          <motion.span
            key={`minutes-tens-${minutesDigits.tens}`}
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="font-mono bg-gradient-to-br from-violet-500 via-indigo-500 to-violet-500 bg-clip-text text-transparent"
          >
            {minutesDigits.tens}
          </motion.span>
          <motion.span
            key={`minutes-ones-${minutesDigits.ones}`}
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="font-mono bg-gradient-to-br from-violet-500 via-indigo-500 to-violet-500 bg-clip-text text-transparent"
          >
            {minutesDigits.ones}
          </motion.span>
          <span className="font-mono bg-gradient-to-bl from-violet-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent">
            m
          </span>
        </div>
        <div className="flex">
          <motion.span
            key={`seconds-tens-${secondsDigits.tens}`}
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="font-mono bg-gradient-to-br from-violet-500 via-indigo-500 to-violet-500 bg-clip-text text-transparent"
          >
            {secondsDigits.tens}
          </motion.span>
          <motion.span
            key={`seconds-ones-${secondsDigits.ones}`}
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="font-mono bg-gradient-to-br from-violet-500 via-indigo-500 to-violet-500 bg-clip-text text-transparent"
          >
            {secondsDigits.ones}
          </motion.span>
          <span className="font-mono bg-gradient-to-bl from-violet-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent">
            s
          </span>
        </div>
      </div>
    </motion.div>
  );
};

interface CommentFormData {
  content: string;
}

export default function PostDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { id } = use(params);
  const [isRewardDialogOpen, setIsRewardDialogOpen] = useState(false);
  const [isBidDialogOpen, setIsBidDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const { data: post, isLoading, error, refetch: refetchPost } = usePost(id);
  // console.log(post);
  const { data: bidsData } = useBids(id, page, pageSize);
  const createComment = useCreateComment();
  const { register, handleSubmit, reset } = useForm<CommentFormData>();
  const [showConfetti, setShowConfetti] = useState(false);
  const user = useUserStore((state) => state.user);
  const [commentPage, setCommentPage] = useState(1);
  const commentPageSize = 10;
  const { data: commentsData } = useComments(id, commentPage, commentPageSize);
  const queryClient = useQueryClient();
  const bookmark = useBookmarkPost();
  const unbookmark = useUnbookmarkPost();
  const { data: bookmarkStatus } = useBookmarkStatus(id);
  const { data: lotteryPoolData } = useLotteryPool(id);

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
    const ref = searchParams.get("ref");
    if (ref && post?.shareCode) {
      try {
        // 解析分享码格式：用户分享码-帖子分享码
        const [userShareCode, postShareCode] = ref.split("-");

        // 验证分享码是否有效
        if (postShareCode === post.shareCode) {
          // TODO: 记录推荐数据到数据库
          console.log(
            `Referral from user with share code: ${userShareCode} for post: ${postShareCode}`
          );
        }
      } catch (error) {
        console.error("Invalid referral code:", error);
      }
    }
  }, [searchParams, post?.shareCode]);
  const isAuthor = useMemo(
    () =>
      Boolean(
        user?.walletAddress &&
          user?.walletAddress === post?.author?.walletAddress
      ),
    [user, post]
  );

  const onSubmit = (data: CommentFormData) => {
    createComment.mutate(
      { postId: id, content: data.content },
      {
        onSuccess: () => {
          reset();
          // 刷新评论列表
          queryClient.invalidateQueries({ queryKey: ['comments', id] });
        },
      }
    );
  };

  const handleBookmarkToggle = () => {
    if (bookmarkStatus?.isBookmarked) {
      unbookmark.mutate(id, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['bookmark-status', id] });
        },
      });
    } else {
      bookmark.mutate(id, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['bookmark-status', id] });
        },
      });
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="p-6">
          <div className="space-y-6">
            {/* Author Info Skeleton */}
            <div className="flex items-center">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="ml-3 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>

            {/* Post Content Skeleton */}
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
              <Skeleton className="h-64 w-full rounded-lg" />
            </div>

            {/* Bidding Section Skeleton */}
            <div className="border rounded-lg p-4 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-48" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-9 w-24" />
                  <Skeleton className="h-9 w-32" />
                </div>
              </div>
            </div>

            {/* Actions Skeleton */}
            <div className="flex items-center gap-4">
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-24" />
            </div>

            {/* Comment Form Skeleton */}
            <div className="space-y-4">
              <Skeleton className="h-[100px] w-full" />
              <Skeleton className="h-9 w-32" />
            </div>

            {/* Comments Skeleton */}
            <div className="space-y-4">
              <Skeleton className="h-6 w-24" />
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="p-4">
                    <div className="flex items-start">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div className="ml-3 space-y-2 flex-1">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-red-500">{error.message}</div>
    );
  }

  if (!post) {
    return <div className="max-w-4xl mx-auto p-6">Post not found</div>;
  }

  const isBiddingActive =
    post.allowBidding &&
    post.biddingDueDate &&
    new Date(post.biddingDueDate) > new Date();

  // 如果帖子状态不是published，只显示基本信息
  if (post.status !== 'PUBLISHED') {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="p-6">
          <div className="space-y-6">
            {/* Author Info */}
            <div
              className="flex items-center cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => router.push(`/user/${post.author.walletAddress}`)}
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
                <h3 className="font-semibold text-foreground">
                  {post.author.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Posted{" "}
                  {formatDistanceToNow(new Date(post.createdAt), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </div>

            {/* Post Content */}
            <div>
              <h2 className="text-2xl font-bold mb-2 text-foreground">
                {post.title}
              </h2>
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

            {/* Status Badge */}
            <div className="flex items-center gap-2">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                post.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-800' :
                post.status === 'PENDING' ? 'bg-blue-100 text-blue-800' :
                post.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                post.status === 'ARCHIVED' ? 'bg-gray-100 text-gray-800' :
                post.status === 'DELETED' ? 'bg-red-100 text-red-800' :
                post.status === 'WAITING_CLAIM' ? 'bg-purple-100 text-purple-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {post.status.charAt(0) + post.status.slice(1).toLowerCase().replace('_', ' ')}
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 px-4 sm:px-6">
      <Card className="p-4 sm:p-6">
        <div className="space-y-4 sm:space-y-6">
          {/* Author Info */}
          <div
            className="flex items-center cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => router.push(`/user/${post.author.walletAddress}`)}
          >
            <Avatar className="h-8 w-8 sm:h-10 sm:w-10 mr-2 sm:mr-3">
              {post.author.avatar ? (
                <AvatarImage src={post.author.avatar} />
              ) : (
                <AvatarFallback>
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-muted">
                    <User className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                  </div>
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <h3 className="font-semibold text-sm sm:text-base text-foreground">
                {post.author.name}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Posted{" "}
                {formatDistanceToNow(new Date(post.createdAt), {
                  addSuffix: true,
                })}
              </p>
            </div>
          </div>

          {/* Post Content */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold mb-2 text-foreground">
              {post.title}
            </h2>
            {post.nftObjectId && (
              <div className="mb-3 sm:mb-4">
                <a
                  href={getExplorerUrl(post.nftObjectId)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground hover:text-fuchsia-500 transition-colors"
                >
                  <Network className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>View on Explorer</span>
                </a>
              </div>
            )}
            <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">{post.content}</p>
            {post.images.length > 0 && (
              <PhotoProvider>
                <div className="bg-muted rounded-lg mb-4 sm:mb-6 overflow-hidden flex justify-center items-center">
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
            <div className="border rounded-lg p-3 sm:p-4 space-y-3 sm:space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <div>
                  <h3 className="font-semibold text-sm sm:text-base bg-gradient-to-r from-violet-500 to-indigo-500 bg-clip-text text-transparent">
                    {isBiddingActive ? "Bidding" : "Bidding ended"}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {isBiddingActive
                      ? `Start Price: ${post.startPrice} SUI`
                      : isAuthor
                        ? "Complete the auction to finalize the sale"
                        : "Waiting for creator to complete the auction"}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                  <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
                    <Countdown
                      date={new Date(post.biddingDueDate || "")}
                      renderer={(props) => (
                        <CountdownDisplay {...props} isAuthor={isAuthor} postId={post.id} />
                      )}
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    {isBiddingActive &&
                      !isAuthor &&
                      post.currentAuction?.auctionObjectId && (
                        <BidDialog
                          isOpen={isBidDialogOpen}
                          onOpenChange={handleBidDialogOpenChange}
                          startPrice={post.startPrice || 0}
                          currentBids={bidsData?.bids || []}
                          postId={id}
                          currentHighestBid={post.currentHighestBid}
                          auctionId={post.currentAuction?.auctionObjectId}
                          trigger={
                            <Button className="w-full sm:w-auto bg-gradient-to-r from-violet-500 to-indigo-500 text-white hover:from-violet-600 hover:to-indigo-600 border-none text-sm">
                              <Gavel className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                              Place Bid
                            </Button>
                          }
                        />
                      )}
                    <AuctionHistoryDialog
                      postId={id}
                      currentRound={post.currentAuction?.round}
                      trigger={
                        <Button
                          variant="outline"
                          className="w-full sm:w-auto border-violet-200 text-violet-400 hover:bg-violet-50 hover:text-violet-500 text-sm"
                        >
                          <History className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                          View History
                        </Button>
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Bidding History */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm sm:text-base">Bidding History</h4>
                <div className="border rounded-lg overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs sm:text-sm">Bidder</TableHead>
                        <TableHead className="text-xs sm:text-sm">Amount</TableHead>
                        <TableHead className="text-xs sm:text-sm">Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bidsData?.bids && bidsData.bids.length > 0 ? (
                        bidsData.bids.map((bid) => (
                          <TableRow key={bid.id}>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Avatar className="h-5 w-5 sm:h-6 sm:w-6">
                                  {bid.user.avatar ? (
                                    <AvatarImage src={bid.user.avatar} />
                                  ) : (
                                    <AvatarFallback>
                                      <User className="h-2 w-2 sm:h-3 sm:w-3" />
                                    </AvatarFallback>
                                  )}
                                </Avatar>
                                <span className="truncate max-w-[100px] sm:max-w-[120px] text-xs sm:text-sm">
                                  {bid.user.name}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="font-medium text-xs sm:text-sm">
                              {bid.amount} SUI
                            </TableCell>
                            <TableCell className="text-muted-foreground whitespace-nowrap text-xs sm:text-sm">
                              {formatDistanceToNow(new Date(bid.createdAt), {
                                addSuffix: true,
                              })}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={3}
                            className="text-center text-muted-foreground text-xs sm:text-sm"
                          >
                            No bids yet
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                  {bidsData?.pagination &&
                    bidsData.pagination.totalPages > 1 && (
                      <div className="flex flex-col sm:flex-row items-center justify-between px-3 sm:px-4 py-2 sm:py-3 border-t gap-2">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(page - 1)}
                            disabled={page === 1}
                            className="h-7 sm:h-9"
                          >
                            <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                          <span className="text-xs sm:text-sm text-muted-foreground">
                            Page {page} of {bidsData.pagination.totalPages}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(page + 1)}
                            disabled={page === bidsData.pagination.totalPages}
                            className="h-7 sm:h-9"
                          >
                            <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </div>
                        <div className="text-xs sm:text-sm text-muted-foreground">
                          Total {bidsData.pagination.total} bids
                        </div>
                      </div>
                    )}
                </div>
              </div>

              {/* Auction Explorer Links */}
              {post.currentAuction?.auctionObjectId && (
                <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4 pt-2 border-t">
                  <a
                    href={getExplorerUrl(post.currentAuction.auctionObjectId)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground hover:text-violet-500 transition-colors"
                  >
                    <Network className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>View Auction on Explorer</span>
                  </a>
                  {post.currentAuction.auctionCapObjectId && (
                    <a
                      href={getExplorerUrl(post.currentAuction.auctionCapObjectId)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground hover:text-indigo-500 transition-colors"
                    >
                      <Network className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span>View Auction Cap on Explorer</span>
                    </a>
                  )}
                </div>
              )}
            </div>
          ) : (
            isAuthor &&
            !post.allowBidding && (
              <div className="border rounded-lg p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                  <div>
                    <h3 className="font-semibold text-sm sm:text-base text-foreground">Auction</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Start an auction for this Content
                    </p>
                  </div>
                  <StartAuctionButton
                    nftObjectId={post.nftObjectId}
                    postId={id}
                    onSuccess={() => {
                      refetchPost();
                      router.refresh();
                    }}
                  />
                </div>
              </div>
            )
          )}

          {/* Lottery Pool Section */}
          <div className="border rounded-lg p-3 sm:p-4 space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              <div>
                <h3 className="font-semibold text-sm sm:text-base bg-gradient-to-r from-violet-500 to-indigo-500 bg-clip-text text-transparent">
                  Lottery Pool
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Current round: {lotteryPoolData?.data.post.currentRound || 0}
                </p>
              </div>
            </div>

            {/* Current Lottery Pool */}
            {lotteryPoolData?.data.currentLotteryPool && (
              <div className="bg-muted/50 rounded-lg p-3 sm:p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Gift className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                    <span className="text-xs sm:text-sm font-medium">Current Pool</span>
                  </div>
                  <span className="text-xs sm:text-sm font-medium">
                    {lotteryPoolData.data.currentLotteryPool.amount} SUI
                  </span>
                </div>
                {lotteryPoolData.data.currentLotteryPool.winner && (
                  <div className="flex items-center gap-2 pl-6">
                    <Avatar className="h-5 w-5 sm:h-6 sm:w-6">
                      {lotteryPoolData.data.currentLotteryPool.winner.avatar ? (
                        <AvatarImage src={lotteryPoolData.data.currentLotteryPool.winner.avatar} />
                      ) : (
                        <AvatarFallback>
                          <User className="h-2 w-2 sm:h-3 sm:w-3" />
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <span className="text-xs sm:text-sm truncate">
                      {lotteryPoolData.data.currentLotteryPool.winner.walletAddress.slice(0, 5)}...{lotteryPoolData.data.currentLotteryPool.winner.walletAddress.slice(-5)}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Historical Lottery Pools */}
            {(lotteryPoolData?.data?.historicalLotteryPools ?? []).length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm sm:text-base">Historical Pools</h4>
                <div className="border rounded-lg overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs sm:text-sm">Round</TableHead>
                        <TableHead className="text-xs sm:text-sm">Amount</TableHead>
                        <TableHead className="text-xs sm:text-sm">Winner</TableHead>
                        <TableHead className="text-xs sm:text-sm">Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(lotteryPoolData?.data?.historicalLotteryPools ?? []).map((pool) => (
                        <TableRow key={pool.id}>
                          <TableCell className="font-medium text-xs sm:text-sm">
                            Round {pool.round}
                          </TableCell>
                          <TableCell className="text-xs sm:text-sm">{pool.amount} SUI</TableCell>
                          <TableCell>
                            {pool.winner ? (
                              <div className="flex items-center space-x-2">
                                <Avatar className="h-5 w-5 sm:h-6 sm:w-6">
                                  {pool.winner.avatar ? (
                                    <AvatarImage src={pool.winner.avatar} />
                                  ) : (
                                    <AvatarFallback>
                                      <User className="h-2 w-2 sm:h-3 sm:w-3" />
                                    </AvatarFallback>
                                  )}
                                </Avatar>
                                <span className="truncate max-w-[100px] sm:max-w-[120px] text-xs sm:text-sm">
                                  {pool.winner.walletAddress.slice(0, 5)}...{pool.winner.walletAddress.slice(-5)}
                                </span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-xs sm:text-sm">No winner</span>
                            )}
                          </TableCell>
                          <TableCell className="text-muted-foreground whitespace-nowrap text-xs sm:text-sm">
                            {formatDistanceToNow(new Date(pool.updatedAt), {
                              addSuffix: true,
                            })}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="text-purple-400 hover:text-purple-500 hover:bg-purple-50 h-8 sm:h-9"
            >
              <MessageCircle className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              <span className="text-xs sm:text-sm">{post.comments.length}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-purple-400 hover:text-purple-500 hover:bg-purple-50 h-8 sm:h-9"
              onClick={() => setIsRewardDialogOpen(true)}
            >
              <Gift className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              <span className="text-xs sm:text-sm">Reward</span>
            </Button>
            <ShareDialog
              postId={id}
              postShareCode={post.shareCode}
              trigger={
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-purple-400 hover:text-purple-500 hover:bg-purple-50 h-8 sm:h-9"
                >
                  <Share className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="text-xs sm:text-sm">Share</span>
                </Button>
              }
            />
            <Button
              variant="ghost"
              size="sm"
              className="text-purple-400 hover:text-purple-650 hover:bg-purple-50 h-8 sm:h-9"
              onClick={handleBookmarkToggle}
            >
              {bookmarkStatus?.isBookmarked ? (
                <><BookmarkMinus className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" /> <span className="text-xs sm:text-sm">Uncollect</span></>
              ) : (
                <><Bookmark className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" /> <span className="text-xs sm:text-sm">Collect</span></>
              )}
            </Button>
          </div>

          {/* Comment Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4">
            <Textarea
              {...register("content", { required: true })}
              placeholder="Write a comment..."
              className="min-h-[80px] sm:min-h-[100px] text-sm"
            />
            <Button
              type="submit"
              disabled={createComment.isPending}
              className="bg-gradient-to-r from-violet-500 to-indigo-500 text-white hover:from-violet-600 hover:to-indigo-600 border-none text-sm h-8 sm:h-9"
            >
              {createComment.isPending ? "Posting..." : "Post Comment"}
            </Button>
          </form>

          {/* Comments */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="font-semibold text-sm sm:text-base text-foreground">Comments</h3>
            {commentsData?.comments.map((comment) => (
              <Card key={comment.id} className="p-3 sm:p-4">
                <div
                  className="flex items-start cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => router.push(`/user/${comment.user.walletAddress}`)}
                >
                  <Avatar className="h-6 w-6 sm:h-8 sm:w-8 mr-2 sm:mr-3">
                    {comment.user.profile?.avatar ? (
                      <AvatarImage src={comment.user.profile.avatar} />
                    ) : (
                      <AvatarFallback>
                        <div className="flex h-full w-full items-center justify-center rounded-full bg-muted">
                          <User className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                        </div>
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <div className="flex items-center mb-1">
                      <h4 className="font-semibold mr-2 text-sm sm:text-base text-foreground">
                        {comment.user.profile?.name || 'Anonymous'}
                      </h4>
                      <span className="text-xs sm:text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground">{comment.content}</p>
                  </div>
                </div>
              </Card>
            ))}
            {commentsData?.pagination && commentsData.pagination.totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between px-3 sm:px-4 py-2 sm:py-3 border-t gap-2">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCommentPage(commentPage - 1)}
                    disabled={commentPage === 1}
                    className="h-7 sm:h-9"
                  >
                    <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                  <span className="text-xs sm:text-sm text-muted-foreground">
                    Page {commentPage} of {commentsData.pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCommentPage(commentPage + 1)}
                    disabled={commentPage === commentsData.pagination.totalPages}
                    className="h-7 sm:h-9"
                  >
                    <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">
                  Total {commentsData.pagination.total} comments
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      <RewardDialog
        isOpen={isRewardDialogOpen}
        onClose={() => handleRewardDialogOpenChange(false)}
        postId={id}
        ref={user?.shareCode ? `${user.shareCode}-${post.shareCode}` : ""}
        nftObjectId={post.nftObjectId}
      />
    </div>
  );
}

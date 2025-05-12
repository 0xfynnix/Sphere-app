/* eslint-disable @next/next/no-img-element */
"use client";

import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUserStore } from "@/store/userStore";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  User,
  Pencil,
  Coins,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import Image from "next/image";
import { useUser, useUserAllPosts } from "@/lib/api/hooks";
import { PostListItem } from "@/lib/api/posts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
// import { useCreateBid } from "@/lib/api/hooks";
import { UpdateProfileForm } from "./components/UpdateProfileForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  useUnclaimedRewards,
  useUnclaimedBids,
  useUnclaimedLotteryPools,
} from "@/lib/api/hooks";
import { useTransactions } from "@/lib/api/hooks";
import { StartAuctionButton } from "@/components/auction/StartAuctionButton";
import { CompleteAuctionDialog } from "@/components/dialog/CompleteAuctionDialog";
import { ClaimContentDialog } from "@/components/dialog/ClaimContentDialog";
import { ClaimRewardDialog } from "@/components/dialog/ClaimRewardDialog";
import { ClaimLotteryPoolDialog } from "@/components/dialog/ClaimLotteryPoolDialog";

export default function ProfilePage() {
  const { user } = useUserStore();
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  // const createBid = useCreateBid();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<{id: string, auctionId: string, auctionCapId: string} | null>(null);
  const [isClaimDialogOpen, setIsClaimDialogOpen] = useState(false);
  const [selectedClaimPost, setSelectedClaimPost] = useState<{id: string, auctionId: string} | null>(null);
  const [isRecipientClaimDialogOpen, setIsRecipientClaimDialogOpen] = useState(false);
  const [isReferrerClaimDialogOpen, setIsReferrerClaimDialogOpen] = useState(false);
  const [isCreatorBidClaimDialogOpen, setIsCreatorBidClaimDialogOpen] = useState(false);
  const [isReferrerBidClaimDialogOpen, setIsReferrerBidClaimDialogOpen] = useState(false);
  const [isLotteryPoolDialogOpen, setIsLotteryPoolDialogOpen] = useState(false);

  const {
    data: userData,
    isLoading: isUserLoading,
    isError: isUserError,
  } = useUser();
  const { data: postsData, isLoading: isPostsLoading, refetch: refetchPosts } = useUserAllPosts(
    user?.walletAddress || "",
    currentPage,
    pageSize
  );
  const { data: unclaimedRewardsData } = useUnclaimedRewards();
  const { data: unclaimedBidsData } = useUnclaimedBids();
  const { data: unclaimedLotteryPoolsData } = useUnclaimedLotteryPools();

  const { data: transactionsData, isLoading: isTransactionsLoading } =
    useTransactions({
      page: currentPage,
      pageSize,
    });

  useEffect(() => {
    if (isUserError) {
      toast.error("Please connect and login to view your profile");
      router.push("/");
    }
  }, [isUserError, router]);

  if (isUserLoading || isPostsLoading || isTransactionsLoading) {
    return <LoadingSpinner />;
  }

  const posts = postsData?.data?.posts || [];
  const pagination = postsData?.data?.pagination;
  const transactions = transactionsData?.data || [];
  const transactionsPagination = transactionsData?.pagination;
  // logger.debug('Profile', { profile, posts, pagination });

  const handleUpdateSuccess = () => {
    setIsDialogOpen(false);
    router.refresh();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="relative mb-12">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-pink-500/10 rounded-3xl -z-10" />
        <div className="p-8">
          <div className="flex items-center gap-6 mb-6">
            <div className="relative">
              <Avatar className="h-24 w-24 ring-4 ring-background">
                {user?.profile?.avatar ? (
                  <AvatarImage src={user.profile.avatar} />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-500 to-blue-500">
                    <User className="h-12 w-12 text-white" />
                  </div>
                )}
                {user?.profile?.avatar && (
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white text-2xl">
                    {user.profile?.name?.[0] || "U"}
                  </AvatarFallback>
                )}
              </Avatar>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  {user?.profile?.name || "Anonymous"}
                </h1>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-purple-100"
                    >
                      <Pencil className="h-4 w-4 text-purple-600" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Edit Profile</DialogTitle>
                    </DialogHeader>
                    <UpdateProfileForm
                      profile={{
                        name: user?.profile?.name || undefined,
                        bio: user?.profile?.bio || undefined,
                        avatar: user?.profile?.avatar || undefined,
                      }}
                      onSuccess={handleUpdateSuccess}
                    />
                  </DialogContent>
                </Dialog>
              </div>
              <p className="text-muted-foreground">
                @{user?.walletAddress.slice(0, 6)}...
                {user?.walletAddress.slice(-4)}
              </p>
              {user?.profile?.bio && (
                <p className="mt-2 text-muted-foreground">{user.profile.bio}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="p-4 sm:p-6 hover:shadow-lg transition-all duration-300 border-none bg-gradient-to-br from-purple-500/10 to-purple-500/5">
          <h3 className="text-sm font-semibold mb-2 text-purple-600">
            Content Created
          </h3>
          <p className="text-2xl sm:text-3xl font-bold text-purple-700">
            {pagination?.total || 0}
          </p>
          <p className="text-xs text-purple-500/70">Total Posts</p>
        </Card>
        <Card className="p-4 sm:p-6 hover:shadow-lg transition-all duration-300 border-none bg-gradient-to-br from-blue-500/10 to-blue-500/5">
          <h3 className="text-sm font-semibold mb-2 text-blue-600">
            Total Auction Revenue
          </h3>
          <p className="text-2xl sm:text-3xl font-bold text-blue-700">
            {userData?.data?.user?.auctionEarnings || 0} SUI
          </p>
          <p className="text-xs text-blue-500/70">From Auctions</p>
        </Card>
        <Card className="p-4 sm:p-6 hover:shadow-lg transition-all duration-300 border-none bg-gradient-to-br from-green-500/10 to-green-500/5">
          <h3 className="text-sm font-semibold mb-2 text-green-600">
            Total Received Rewards
          </h3>
          <p className="text-2xl sm:text-3xl font-bold text-green-700">
            {userData?.data?.user?.rewardEarnings || 0} SUI
          </p>
          <p className="text-xs text-green-500/70">From Community</p>
        </Card>
        <Card className="p-4 sm:p-6 hover:shadow-lg transition-all duration-300 border-none bg-gradient-to-br from-pink-500/10 to-pink-500/5">
          <h3 className="text-sm font-semibold mb-2 text-pink-600">
            Total Given Rewards
          </h3>
          <p className="text-2xl sm:text-3xl font-bold text-pink-700">
            {userData?.data?.user?.rewardSpent || 0} SUI
          </p>
          <p className="text-xs text-pink-500/70">To Community</p>
        </Card>
      </div>

      <Tabs defaultValue="wallet" className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-muted/50 p-1 rounded-xl">
          <TabsTrigger
            value="wallet"
            className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/10 data-[state=active]:to-purple-500/5 data-[state=active]:text-purple-600 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-purple-500/20"
          >
            Transaction
          </TabsTrigger>
          <TabsTrigger
            value="content"
            className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/10 data-[state=active]:to-blue-500/5 data-[state=active]:text-blue-600 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-blue-500/20"
          >
            Content
          </TabsTrigger>
          <TabsTrigger
            value="nfts"
            className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500/10 data-[state=active]:to-green-500/5 data-[state=active]:text-green-600 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-green-500/20"
          >
            NFTs
          </TabsTrigger>
          <TabsTrigger
            value="claim"
            className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500/10 data-[state=active]:to-pink-500/5 data-[state=active]:text-pink-600 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-pink-500/20"
          >
            Claim
          </TabsTrigger>
          <TabsTrigger
            value="settings"
            className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500/10 data-[state=active]:to-orange-500/5 data-[state=active]:text-orange-600 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-orange-500/20"
          >
            Settings
          </TabsTrigger>
        </TabsList>
        <TabsContent value="wallet" className="mt-6">
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-foreground">
                Transaction History On Sphere
              </h3>
              <div className="space-y-4">
                {transactions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="rounded-full bg-muted p-4 mb-4">
                      <Coins className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground text-lg">
                      No transactions yet
                    </p>
                    <p className="text-muted-foreground text-sm mt-2">
                      Your transaction history will appear here
                    </p>
                  </div>
                ) : (
                  <>
                    {transactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-4 bg-card border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`rounded-full p-2 ${
                              transaction.type === "reward"
                                ? "bg-green-100 text-green-600"
                                : transaction.type === "bid"
                                  ? "bg-blue-100 text-blue-600"
                                  : "bg-purple-100 text-purple-600"
                            }`}
                          >
                            {transaction.type === "reward" ? (
                              <ArrowUpRight className="h-5 w-5" />
                            ) : transaction.type === "bid" ? (
                              <ArrowDownLeft className="h-5 w-5" />
                            ) : (
                              <Coins className="h-5 w-5" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              {transaction.type === "reward" &&
                                "Content Creation Reward"}
                              {transaction.type === "bid" && "Content Purchase"}
                              {transaction.type === "referral" &&
                                "Community Reward"}
                              {!["reward", "bid", "referral"].includes(
                                transaction.type
                              ) && transaction.type}
                            </p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                              <Clock className="h-3 w-3" />
                              <span>
                                {new Date(
                                  transaction.createdAt
                                ).toLocaleString()}
                              </span>
                            </div>
                            {transaction.post && (
                              <p className="text-sm text-muted-foreground mt-1">
                                Post: {transaction.post.title}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div
                            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                              transaction.status === "success"
                                ? "bg-green-100 text-green-700"
                                : transaction.status === "failed"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {transaction.status === "success" ? (
                              <CheckCircle2 className="h-3 w-3" />
                            ) : transaction.status === "failed" ? (
                              <XCircle className="h-3 w-3" />
                            ) : (
                              <AlertCircle className="h-3 w-3" />
                            )}
                            <span className="capitalize">
                              {transaction.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {transactionsPagination &&
                      transactionsPagination.totalPages > 1 && (
                        <div className="flex items-center justify-between mt-6 pt-4 border-t">
                          <div className="text-sm text-muted-foreground">
                            Showing {(currentPage - 1) * pageSize + 1}-
                            {Math.min(
                              currentPage * pageSize,
                              transactionsPagination.total
                            )}{" "}
                            of {transactionsPagination.total} items
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setCurrentPage((prev) => Math.max(1, prev - 1))
                              }
                              disabled={currentPage === 1}
                            >
                              Previous
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setCurrentPage((prev) =>
                                  Math.min(
                                    transactionsPagination.totalPages,
                                    prev + 1
                                  )
                                )
                              }
                              disabled={
                                currentPage ===
                                transactionsPagination.totalPages
                              }
                            >
                              Next
                            </Button>
                          </div>
                        </div>
                      )}
                  </>
                )}
              </div>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="content" className="mt-6">
          <div className="space-y-4">
            {posts?.length === 0 ? (
              <p className="text-muted-foreground">No content yet.</p>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Content</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {posts.map((post: PostListItem) => (
                      <TableRow key={post.id}>
                        <TableCell className="font-medium">
                          {post.title}
                        </TableCell>
                        <TableCell className="max-w-[300px] truncate">
                          {post.content}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                              post.status === "PUBLISHED"
                                ? "bg-green-100 text-green-700"
                                : post.status === "DRAFT"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {post.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          {new Date(post.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/post/${post.id}`)}
                            >
                              View Details
                            </Button>
                            {!post.allowBidding && !post.auctionHistory?.length && post.nftObjectId && (
                              <StartAuctionButton
                                nftObjectId={post.nftObjectId}
                                postId={post.id}
                                onSuccess={() => {
                                  router.refresh();
                                  refetchPosts();
                                }}
                              />
                            )}
                            {post.allowBidding && post.auctionHistory?.length > 0 && new Date(post.biddingDueDate || "") < new Date() && (
                              <CompleteAuctionDialog
                                isOpen={isDialogOpen && selectedPost?.id === post.id}
                                onOpenChange={(open) => {
                                  setIsDialogOpen(open);
                                  if (!open) {
                                    setSelectedPost(null);
                                    router.refresh();
                                    refetchPosts();
                                  }
                                }}
                                postId={post.id}
                                auctionId={post.auctionHistory.find(auction => auction.round === post.auctionRound)?.auctionObjectId || ""}
                                auctionCapId={post.auctionHistory.find(auction => auction.round === post.auctionRound)?.auctionCapObjectId || ""}
                                currentHighestBid={post.auctionHistory.find(auction => auction.round === post.auctionRound)?.finalPrice || undefined}
                                highestBidder={post.auctionHistory.find(auction => auction.round === post.auctionRound)?.winner ? {
                                  name: post.auctionHistory.find(auction => auction.round === post.auctionRound)?.winner?.name || "",
                                  avatar: post.auctionHistory.find(auction => auction.round === post.auctionRound)?.winner?.avatar || undefined
                                } : undefined}
                                trigger={
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="bg-gradient-to-r from-violet-500 to-indigo-500 text-white hover:from-violet-600 hover:to-indigo-600 border-none"
                                    onClick={() => {
                                      const currentAuction = post.auctionHistory.find(auction => auction.round === post.auctionRound);
                                      if (currentAuction) {
                                        setSelectedPost({
                                          id: post.id,
                                          auctionId: currentAuction.auctionObjectId,
                                          auctionCapId: currentAuction.auctionCapObjectId
                                        });
                                        setIsDialogOpen(true);
                                      }
                                    }}
                                  >
                                    Complete Auction
                                  </Button>
                                }
                              />
                            )}
                            {post.status === "WAITING_CLAIM" && post.auctionHistory?.length > 0 && (
                              <ClaimContentDialog
                                isOpen={isClaimDialogOpen && selectedClaimPost?.id === post.id}
                                onOpenChange={(open) => {
                                  setIsClaimDialogOpen(open);
                                  if (!open) {
                                    setSelectedClaimPost(null);
                                    router.refresh();
                                    refetchPosts();
                                  }
                                }}
                                postId={post.id}
                                auctionId={post.auctionHistory.find(auction => auction.round === post.auctionRound)?.auctionObjectId || ""}
                                trigger={
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 border-none"
                                    onClick={() => {
                                      const currentAuction = post.auctionHistory.find(auction => auction.round === post.auctionRound);
                                      if (currentAuction) {
                                        setSelectedClaimPost({
                                          id: post.id,
                                          auctionId: currentAuction.auctionObjectId
                                        });
                                        setIsClaimDialogOpen(true);
                                      }
                                    }}
                                  >
                                    Claim Content
                                  </Button>
                                }
                              />
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {pagination && pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-muted-foreground">
                      Showing {(currentPage - 1) * pageSize + 1}-
                      {Math.min(currentPage * pageSize, pagination.total)} of{" "}
                      {pagination.total} items
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(1, prev - 1))
                        }
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(pagination.totalPages, prev + 1)
                          )
                        }
                        disabled={currentPage === pagination.totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </TabsContent>
        <TabsContent value="nfts" className="mt-6">
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">My NFTs</h2>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Total: 2</span>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <Card className="p-4 hover:shadow-lg transition-shadow">
                <div className="aspect-square relative rounded-lg overflow-hidden mb-4">
                  <Image
                    src="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=500&auto=format&fit=crop&q=60"
                    alt="NFT"
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                </div>
                <h3 className="font-semibold text-foreground">
                  Sphere Creator #1
                </h3>
                <p className="text-sm text-muted-foreground">
                  Minted on 2024-03-20
                </p>
                <div className="mt-2">
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </Card>
              <Card className="p-4 hover:shadow-lg transition-shadow">
                <div className="aspect-square relative rounded-lg overflow-hidden mb-4">
                  <Image
                    src="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=500&auto=format&fit=crop&q=60"
                    alt="NFT"
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                </div>
                <h3 className="font-semibold text-foreground">
                  Sphere Creator #2
                </h3>
                <p className="text-sm text-muted-foreground">
                  Minted on 2024-03-21
                </p>
                <div className="mt-2">
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </Card>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing 1-2 of 2 items
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled>
                  Previous
                </Button>
                <Button variant="outline" size="sm" disabled>
                  Next
                </Button>
              </div>
            </div>

            <div className="pt-8 border-t">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground">
                  Mintable NFTs
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Available: 2
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <Card className="p-4 hover:shadow-lg transition-shadow">
                  <div className="aspect-square relative rounded-lg overflow-hidden mb-4">
                    <Image
                      src="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=500&auto=format&fit=crop&q=60"
                      alt="NFT"
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                  </div>
                  <h3 className="font-semibold text-foreground">
                    Sphere Creator #3
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Limited Edition
                  </p>
                  <div className="mt-2">
                    <Button size="sm">Mint Now</Button>
                  </div>
                </Card>
                <Card className="p-4 hover:shadow-lg transition-shadow">
                  <div className="aspect-square relative rounded-lg overflow-hidden mb-4">
                    <Image
                      src="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=500&auto=format&fit=crop&q=60"
                      alt="NFT"
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                  </div>
                  <h3 className="font-semibold text-foreground">
                    Sphere Creator #4
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Limited Edition
                  </p>
                  <div className="mt-2">
                    <Button size="sm">Mint Now</Button>
                  </div>
                </Card>
              </div>
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Showing 1-2 of 2 items
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" disabled>
                    Previous
                  </Button>
                  <Button variant="outline" size="sm" disabled>
                    Next
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="claim" className="mt-6">
          <div className="space-y-8">
            {/* Unclaimed Rewards Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Unclaimed Rewards</h2>
              </div>

              <div className="space-y-6">
                {/* Recipient Rewards */}
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-purple-500"></span>
                      As Recipient
                    </h3>
                    <ClaimRewardDialog
                      isOpen={isRecipientClaimDialogOpen}
                      onOpenChange={setIsRecipientClaimDialogOpen}
                      type="recipient"
                      trigger={
                        <Button
                          disabled={!unclaimedRewardsData?.recipientRewards?.length}
                          className="bg-purple-500 hover:bg-purple-600"
                        >
                          Claim All
                        </Button>
                      }
                    />
                  </div>
                  {!unclaimedRewardsData?.recipientRewards?.length ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <div className="rounded-full bg-purple-500/10 p-3 mb-3">
                        <Coins className="h-6 w-6 text-purple-500" />
                      </div>
                      <p className="text-muted-foreground">
                        No unclaimed rewards as recipient
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {unclaimedRewardsData.recipientRewards.map((reward) => (
                        <div
                          key={reward.id}
                          className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                        >
                          <div className="space-y-1">
                            <p className="font-medium">{reward.post.title}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>
                                From: {reward.sender.walletAddress.slice(0, 6)}
                                ...{reward.sender.walletAddress.slice(-4)}
                              </span>
                              <span>•</span>
                              <span className="text-purple-500 font-medium">
                                {reward.recipientAmount} SUI
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>

                {/* Referrer Rewards */}
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                      As Referrer
                    </h3>
                    <ClaimRewardDialog
                      isOpen={isReferrerClaimDialogOpen}
                      onOpenChange={setIsReferrerClaimDialogOpen}
                      type="referrer"
                      trigger={
                        <Button
                          disabled={!unclaimedRewardsData?.referrerRewards?.length}
                          className="bg-blue-500 hover:bg-blue-600"
                        >
                          Claim All
                        </Button>
                      }
                    />
                  </div>
                  {!unclaimedRewardsData?.referrerRewards?.length ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <div className="rounded-full bg-blue-500/10 p-3 mb-3">
                        <Coins className="h-6 w-6 text-blue-500" />
                      </div>
                      <p className="text-muted-foreground">
                        No unclaimed rewards as referrer
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {unclaimedRewardsData.referrerRewards.map((reward) => (
                        <div
                          key={reward.id}
                          className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                        >
                          <div className="space-y-1">
                            <p className="font-medium">{reward.post.title}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>
                                From: {reward.sender.walletAddress.slice(0, 6)}
                                ...{reward.sender.walletAddress.slice(-4)}
                              </span>
                              <span>•</span>
                              <span className="text-blue-500 font-medium">
                                {reward.referrerAmount} SUI
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </div>
            </div>

            {/* Unclaimed Bids Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Unclaimed Bid Rewards</h2>
              </div>

              <div className="space-y-6">
                {/* Creator Bids */}
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-green-500"></span>
                      As Creator
                    </h3>
                  </div>
                  {!unclaimedBidsData?.creatorBids?.length ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <div className="rounded-full bg-green-500/10 p-3 mb-3">
                        <Coins className="h-6 w-6 text-green-500" />
                      </div>
                      <p className="text-muted-foreground">
                        No unclaimed bid rewards as creator
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {unclaimedBidsData.creatorBids.map((bid) => (
                        <div
                          key={bid.id}
                          className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                        >
                          <div className="space-y-1">
                            <p className="font-medium">{bid.post.title}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>
                                From: {bid.user.walletAddress.slice(0, 6)}...
                                {bid.user.walletAddress.slice(-4)}
                              </span>
                              <span>•</span>
                              <span className="text-green-500 font-medium">
                                {bid.creatorAmount} SUI
                              </span>
                            </div>
                          </div>
                          <ClaimRewardDialog
                            isOpen={isCreatorBidClaimDialogOpen && selectedClaimPost?.id === bid.id}
                            onOpenChange={(open) => {
                              setIsCreatorBidClaimDialogOpen(open);
                              if (!open) {
                                setSelectedClaimPost(null);
                              }
                            }}
                            type="creator"
                            auctionId={bid.auctionObjectId}
                            trigger={
                              <Button
                                size="sm"
                                className="bg-green-500 hover:bg-green-600"
                                onClick={() => {
                                  setSelectedClaimPost({
                                    id: bid.id,
                                    auctionId: bid.auctionObjectId || ""
                                  });
                                  setIsCreatorBidClaimDialogOpen(true);
                                }}
                              >
                                Claim
                              </Button>
                            }
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </Card>

                {/* Referrer Bids */}
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-orange-500"></span>
                      As Referrer
                    </h3>
                  </div>
                  {!unclaimedBidsData?.referrerBids?.length ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <div className="rounded-full bg-orange-500/10 p-3 mb-3">
                        <Coins className="h-6 w-6 text-orange-500" />
                      </div>
                      <p className="text-muted-foreground">
                        No unclaimed bid rewards as referrer
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {unclaimedBidsData.referrerBids.map((bid) => (
                        <div
                          key={bid.id}
                          className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                        >
                          <div className="space-y-1">
                            <p className="font-medium">{bid.post.title}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>
                                From: {bid.user.walletAddress.slice(0, 6)}...
                                {bid.user.walletAddress.slice(-4)}
                              </span>
                              <span>•</span>
                              <span className="text-orange-500 font-medium">
                                {bid.referrerAmount} SUI
                              </span>
                            </div>
                          </div>
                          <ClaimRewardDialog
                            isOpen={isReferrerBidClaimDialogOpen && selectedClaimPost?.id === bid.id}
                            onOpenChange={(open) => {
                              setIsReferrerBidClaimDialogOpen(open);
                              if (!open) {
                                setSelectedClaimPost(null);
                              }
                            }}
                            type="referrer"
                            auctionId={bid.auctionObjectId}
                            trigger={
                              <Button
                                size="sm"
                                className="bg-orange-500 hover:bg-orange-600"
                                onClick={() => {
                                  setSelectedClaimPost({
                                    id: bid.id,
                                    auctionId: bid.auctionObjectId || ""
                                  });
                                  setIsReferrerBidClaimDialogOpen(true);
                                }}
                              >
                                Claim
                              </Button>
                            }
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </div>
            </div>

            {/* Unclaimed Lottery Pools Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Unclaimed Lottery Pools</h2>
              </div>

              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-indigo-500"></span>
                    Lottery Pools
                  </h3>
                  <ClaimLotteryPoolDialog
                    isOpen={isLotteryPoolDialogOpen}
                    onOpenChange={setIsLotteryPoolDialogOpen}
                    lotteryPools={unclaimedLotteryPoolsData?.lotteryPools || []}
                    trigger={
                      <Button
                        disabled={!unclaimedLotteryPoolsData?.lotteryPools?.length}
                        className="bg-indigo-500 hover:bg-indigo-600"
                      >
                        Claim All
                      </Button>
                    }
                  />
                </div>
                {!unclaimedLotteryPoolsData?.lotteryPools?.length ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="rounded-full bg-indigo-500/10 p-3 mb-3">
                      <Coins className="h-6 w-6 text-indigo-500" />
                    </div>
                    <p className="text-muted-foreground">
                      No unclaimed lottery pools
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {unclaimedLotteryPoolsData.lotteryPools.map((pool) => (
                      <div
                        key={pool.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div className="space-y-1">
                          <p className="font-medium">
                            {pool.post?.title || "Untitled Post"}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>Round: {pool.round}</span>
                            <span>•</span>
                            <span className="text-indigo-500 font-medium">
                              {pool.amount} SUI
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="settings" className="mt-6">
          <div className="space-y-4">
            {/* Settings will go here */}
            <p className="text-muted-foreground">Settings coming soon.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

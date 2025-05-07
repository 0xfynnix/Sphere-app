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
import { User, Pencil, Coins, Loader2 } from "lucide-react";
import Image from "next/image";
import { useUser } from "@/lib/api/hooks";
import { useUserPosts } from "@/lib/api/hooks";
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
import { useClaimReward, useUnclaimedRewards, useClaimBid, useUnclaimedBids } from "@/lib/api/hooks";

export default function ProfilePage() {
  const { user } = useUserStore();
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  // const createBid = useCreateBid();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const {
    data: userData,
    isLoading: isUserLoading,
    isError: isUserError,
  } = useUser();
  const { data: postsData, isLoading: isPostsLoading } = useUserPosts(
    user?.walletAddress || "",
    currentPage,
    pageSize
  );
  const { data: unclaimedRewardsData } = useUnclaimedRewards();
  const { data: unclaimedBidsData } = useUnclaimedBids();
  const claimReward = useClaimReward();
  const claimBid = useClaimBid();

  useEffect(() => {
    if (isUserError) {
      toast.error("Please connect and login to view your profile");
      router.push("/");
    }
  }, [isUserError, router]);

  if (isUserLoading || isPostsLoading) {
    return <LoadingSpinner />;
  }

  const posts = postsData?.data?.posts || [];
  const pagination = postsData?.data?.pagination;
  // logger.debug('Profile', { profile, posts, pagination });

  const handleCancelBidding = async (postId: string) => {
    try {
      // TODO: 实现取消竞拍的 API 调用
      console.log("postId", postId);
      toast.success("Bidding cancelled successfully");
    } catch (error) {
      console.error("Failed to cancel bidding", error);
      toast.error("Failed to cancel bidding");
    }
  };

  const handleStartBidding = async (postId: string) => {
    try {
      // TODO: 实现开始竞拍的 API 调用
      console.log("postId", postId);
      toast.success("Bidding started successfully");
    } catch (error) {
      console.error("Failed to start bidding", error);
      toast.error("Failed to start bidding");
    }
  };

  const handleUpdateSuccess = () => {
    setIsDialogOpen(false);
    router.refresh();
  };

  const handleClaimReward = async (rewardId: string, type: 'recipient' | 'referrer') => {
    try {
      await claimReward.mutateAsync({ rewardId, type });
      toast.success('Reward claimed successfully');
    } catch (error) {
      console.error('Failed to claim reward:', error);
      toast.error('Failed to claim reward');
    }
  };

  const handleClaimBid = async (bidId: string, type: 'creator' | 'referrer') => {
    try {
      await claimBid.mutateAsync({ bidId, type });
      toast.success('Bid reward claimed successfully');
    } catch (error) {
      console.error('Failed to claim bid reward:', error);
      toast.error('Failed to claim bid reward');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Avatar className="h-20 w-20">
            {user?.profile?.avatar ? (
              <AvatarImage src={user.profile.avatar} />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-muted">
                <User className="h-10 w-10 text-muted-foreground" />
              </div>
            )}
            {user?.profile?.avatar && (
              <AvatarFallback>{user.profile?.name?.[0] || "U"}</AvatarFallback>
            )}
          </Avatar>
          <div className="flex items-start gap-2 flex-col">
            <h1 className="text-3xl font-bold text-foreground">
              {user?.profile?.name || "Anonymous"}
            </h1>
          <p className="text-muted-foreground">
            @{user?.walletAddress.slice(0, 6)}...{user?.walletAddress.slice(-4)}
          </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Pencil className="h-4 w-4" />
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
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="p-4 sm:p-6 hover:shadow-lg transition-shadow">
          <h3 className="text-sm font-semibold mb-2 text-foreground">
            Content Created
          </h3>
          <p className="text-xl sm:text-2xl font-bold text-foreground">
            {pagination?.total || 0}
          </p>
          <p className="text-xs text-muted-foreground">Total Posts</p>
        </Card>
        <Card className="p-4 sm:p-6 hover:shadow-lg transition-shadow">
          <h3 className="text-sm font-semibold mb-2 text-foreground">
            Total Auction Revenue
          </h3>
          <p className="text-xl sm:text-2xl font-bold text-foreground">
            {userData?.data?.user?.auctionEarnings || 0} SUI
          </p>
          <p className="text-xs text-muted-foreground">From Auctions</p>
        </Card>
        <Card className="p-4 sm:p-6 hover:shadow-lg transition-shadow">
          <h3 className="text-sm font-semibold mb-2 text-foreground">
            Total Received Rewards
          </h3>
          <p className="text-xl sm:text-2xl font-bold text-foreground">
            {userData?.data?.user?.rewardEarnings || 0} SUI
          </p>
          <p className="text-xs text-muted-foreground">From Community</p>
        </Card>
        <Card className="p-4 sm:p-6 hover:shadow-lg transition-shadow">
          <h3 className="text-sm font-semibold mb-2 text-foreground">
            Total Given Rewards
          </h3>
          <p className="text-xl sm:text-2xl font-bold text-foreground">
            {userData?.data?.user?.rewardSpent || 0} SUI
          </p>
          <p className="text-xs text-muted-foreground">To Community</p>
        </Card>
      </div>

      <Tabs defaultValue="wallet" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="wallet">Transaction</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="nfts">NFTs</TabsTrigger>
          <TabsTrigger value="claim">Claim</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="wallet" className="mt-6">
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-foreground">
                Transaction History On Sphere
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">
                      Content Creation Reward
                    </p>
                    <p className="text-sm text-muted-foreground">2 hours ago</p>
                  </div>
                  <p className="text-green-500 font-semibold">+5.2 SUI</p>
                </div>
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">
                      Content Purchase
                    </p>
                    <p className="text-sm text-muted-foreground">1 day ago</p>
                  </div>
                  <p className="text-red-500 font-semibold">-2.5 SUI</p>
                </div>
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">
                      Community Reward
                    </p>
                    <p className="text-sm text-muted-foreground">3 days ago</p>
                  </div>
                  <p className="text-green-500 font-semibold">+1.8 SUI</p>
                </div>
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
                    {posts.map((post) => (
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
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                            {post.allowBidding ? (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleCancelBidding(post.id)}
                              >
                                Cancel Bidding
                              </Button>
                            ) : (
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleStartBidding(post.id)}
                              >
                                Start Bidding
                              </Button>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Recipient Rewards */}
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-purple-500"></span>
                      As Recipient
                    </h3>
                    <Button
                      onClick={() => {
                        const rewards = unclaimedRewardsData?.recipientRewards || [];
                        rewards.forEach(reward => handleClaimReward(reward.id, 'recipient'));
                      }}
                      disabled={!unclaimedRewardsData?.recipientRewards?.length || claimReward.isPending}
                      className="bg-purple-500 hover:bg-purple-600"
                    >
                      {claimReward.isPending ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Claiming...
                        </div>
                      ) : (
                        'Claim All'
                      )}
                    </Button>
                  </div>
                  {!unclaimedRewardsData?.recipientRewards?.length ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <div className="rounded-full bg-purple-500/10 p-3 mb-3">
                        <Coins className="h-6 w-6 text-purple-500" />
                      </div>
                      <p className="text-muted-foreground">No unclaimed rewards as recipient</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {unclaimedRewardsData.recipientRewards.map((reward) => (
                        <div key={reward.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                          <div className="space-y-1">
                            <p className="font-medium">{reward.post.title}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>From: {reward.sender.walletAddress.slice(0, 6)}...{reward.sender.walletAddress.slice(-4)}</span>
                              <span>•</span>
                              <span className="text-purple-500 font-medium">{reward.recipientAmount} SUI</span>
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
                    <Button
                      onClick={() => {
                        const rewards = unclaimedRewardsData?.referrerRewards || [];
                        rewards.forEach(reward => handleClaimReward(reward.id, 'referrer'));
                      }}
                      disabled={!unclaimedRewardsData?.referrerRewards?.length || claimReward.isPending}
                      className="bg-blue-500 hover:bg-blue-600"
                    >
                      {claimReward.isPending ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Claiming...
                        </div>
                      ) : (
                        'Claim All'
                      )}
                    </Button>
                  </div>
                  {!unclaimedRewardsData?.referrerRewards?.length ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <div className="rounded-full bg-blue-500/10 p-3 mb-3">
                        <Coins className="h-6 w-6 text-blue-500" />
                      </div>
                      <p className="text-muted-foreground">No unclaimed rewards as referrer</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {unclaimedRewardsData.referrerRewards.map((reward) => (
                        <div key={reward.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                          <div className="space-y-1">
                            <p className="font-medium">{reward.post.title}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>From: {reward.sender.walletAddress.slice(0, 6)}...{reward.sender.walletAddress.slice(-4)}</span>
                              <span>•</span>
                              <span className="text-blue-500 font-medium">{reward.referrerAmount} SUI</span>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Creator Bids */}
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-green-500"></span>
                      As Creator
                    </h3>
                    <Button
                      onClick={() => {
                        const bids = unclaimedBidsData?.creatorBids || [];
                        bids.forEach(bid => handleClaimBid(bid.id, 'creator'));
                      }}
                      disabled={!unclaimedBidsData?.creatorBids?.length || claimBid.isPending}
                      className="bg-green-500 hover:bg-green-600"
                    >
                      {claimBid.isPending ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Claiming...
                        </div>
                      ) : (
                        'Claim All'
                      )}
                    </Button>
                  </div>
                  {!unclaimedBidsData?.creatorBids?.length ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <div className="rounded-full bg-green-500/10 p-3 mb-3">
                        <Coins className="h-6 w-6 text-green-500" />
                      </div>
                      <p className="text-muted-foreground">No unclaimed bid rewards as creator</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {unclaimedBidsData.creatorBids.map((bid) => (
                        <div key={bid.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                          <div className="space-y-1">
                            <p className="font-medium">{bid.post.title}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>From: {bid.user.walletAddress.slice(0, 6)}...{bid.user.walletAddress.slice(-4)}</span>
                              <span>•</span>
                              <span className="text-green-500 font-medium">{bid.creatorAmount} SUI</span>
                            </div>
                          </div>
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
                    <Button
                      onClick={() => {
                        const bids = unclaimedBidsData?.referrerBids || [];
                        bids.forEach(bid => handleClaimBid(bid.id, 'referrer'));
                      }}
                      disabled={!unclaimedBidsData?.referrerBids?.length || claimBid.isPending}
                      className="bg-orange-500 hover:bg-orange-600"
                    >
                      {claimBid.isPending ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Claiming...
                        </div>
                      ) : (
                        'Claim All'
                      )}
                    </Button>
                  </div>
                  {!unclaimedBidsData?.referrerBids?.length ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <div className="rounded-full bg-orange-500/10 p-3 mb-3">
                        <Coins className="h-6 w-6 text-orange-500" />
                      </div>
                      <p className="text-muted-foreground">No unclaimed bid rewards as referrer</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {unclaimedBidsData.referrerBids.map((bid) => (
                        <div key={bid.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                          <div className="space-y-1">
                            <p className="font-medium">{bid.post.title}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>From: {bid.user.walletAddress.slice(0, 6)}...{bid.user.walletAddress.slice(-4)}</span>
                              <span>•</span>
                              <span className="text-orange-500 font-medium">{bid.referrerAmount} SUI</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </div>
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

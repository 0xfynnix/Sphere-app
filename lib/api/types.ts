import { PostStatus } from "@prisma/client";

// API 响应基础类型
export interface ApiResponse<T> {
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
  success: boolean;
}

// 用户资料类型
export interface UserProfileData {
  id: string;
  name: string | null | undefined;
  bio: string | null | undefined;
  avatar: string | null | undefined;
}

// 用户相关类型
export enum UserType {
  ARTIST = "ARTIST", // 艺术家
  GEEK = "GEEK", // 极客
  STORYTELLER = "STORYTELLER", // 故事家
  MEME_LORD = "MEME_LORD", // 迷因王
  EXPLORER = "EXPLORER", // 探索者
}

export interface UserProfile {
  id: string;
  walletAddress: string;
  email?: string;
  userType?: string;
  shareCode: string;
  profile: UserProfileData | null;
  createdAt: string;
  updatedAt: string;
  auctionEarnings: number;
  rewardEarnings: number;
  rewardSpent: number;
  nftCount: number;
  sentRewards: Reward[];
  receivedRewards: Reward[];
  posts?: Post[];
}

export interface UserUpdateInput {
  userType?: UserType;
  email?: string;
  txDigest?: string;
}

// 同步用户响应
export type SyncUserResponse = ApiResponse<{
  user: UserProfile;
}>;

// 获取用户响应
export type GetUserResponse = ApiResponse<{
  user: UserProfile;
}>;

export interface Post {
  id: string;
  title: string;
  content: string;
  userId: string;
  shareCode: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    walletAddress: string;
  };
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED" | "DELETED" | "PENDING" | "FAILED" | "WAITING_CLAIM";
  category?: {
    id: string;
    name: string;
  };
  tags: {
    id: string;
    name: string;
  }[];
  comments: {
    id: string;
    content: string;
    author: {
      id: string;
      name: string;
      avatar?: string;
    };
    timestamp: string;
  }[];
  images: {
    id: string;
    url: string;
  }[];
  chainId?: string;
  contentHash?: string;
  nftObjectId: string;
  audienceCount: number;
  totalRewards: number;
  postType: "NORMAL" | "MEME_LORD";
  allowBidding: boolean;
  currentHighestBid: number;
  biddingDueDate?: string;
  startPrice?: number;
  createdAt: string;
  updatedAt: string;
  _count?: {
    comments: number;
    bookmarks: number;
  };
  // 当前轮次的奖池信息
  currentLotteryPool?: {
    id: string;
    amount: number;
    round: number;
    claimed: boolean;
    winner?: {
      id: string;
      walletAddress: string;
      name: string;
      avatar?: string;
    } | null;
  } | null;
  // 当前轮次的拍卖信息
  currentAuction?: {
    id: string;
    round: number;
    startPrice: number;
    finalPrice: number | null;
    totalBids: number;
    biddingDueDate: string;
    auctionObjectId: string;
    auctionCapObjectId: string;
    winner?: {
      id: string;
      walletAddress: string;
      name: string;
      avatar?: string;
    } | null;
  } | null;
}

export interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  timestamp: Date;
}

// 更新用户请求参数
export interface UpdateUserRequest {
  userType: UserType;
  txDigest: string;
}

// 更新用户响应
export type UpdateUserResponse = ApiResponse<{
  user: UserProfile;
}>;

export interface Bid {
  id: string;
  amount: number;
  postId: string;
  userId: string;
  chainId?: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export interface CreateBidRequest {
  postId: string;
  amount: number;
  digest: string;
  ref?: string;
}

export interface CreateBidResponse {
  success: boolean;
  bid: Bid;
}

export interface Pagination {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface GetBidsResponse {
  success: boolean;
  bids: Bid[];
  pagination: Pagination;
}

export interface AuctionHistory {
  id: string;
  postId: string;
  round: number;
  startPrice: number;
  finalPrice: number | null;
  totalBids: number;
  winnerId: string | null;
  winner: {
    id: string;
    walletAddress: string;
    profile?: {
      name: string | null;
      avatar: string | null;
    };
  } | null;
  biddingDueDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetAuctionHistoryResponse {
  history: AuctionHistory[];
}

export interface Reward {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  postId: string;
  amount: number;
  senderId: string;
  recipientId: string;
  referrerId: string | null;
  lotteryPoolId: string | null;
}

export interface CreateRewardRequest {
  ref: string;
  amount: number;
  postId: string;
  digest: string;
}

export interface UpdateProfileRequest {
  name?: string;
  bio?: string;
  avatar?: File;
}

export interface UpdateProfileResponse {
  success: boolean;
  data?: {
    profile: {
      id: string;
      name: string | null;
      bio: string | null;
      avatar: string | null;
    };
  };
  error?: {
    message: string;
  };
}

export interface AuctionInfo {
  startPrice: number;
  auctionDigest: string;
  auctionId: string;
  auctionCapId: string;
  durationHours: number;
  durationMinutes: number;
}

export interface UpdatePostAuctionRequest {
  postId: string;
  auctionInfo: AuctionInfo;
}

// 打赏奖励领取类型
export type RewardClaimType = 'recipient' | 'referrer';

// 竞拍奖励领取类型
export type BidClaimType = 'creator' | 'referrer';

// 打赏奖励领取请求
export interface RewardClaimRequest {
  digest: string;
  type: RewardClaimType;
}

// 竞拍奖励领取请求
export interface BidClaimRequest {
  digest: string;
  type: BidClaimType;
}

// 打赏奖励领取响应
export interface RewardClaimResponse {
  success: boolean;
  amount: number;
}

// 竞拍奖励领取响应
export interface BidClaimResponse {
  success: boolean;
  amount: number;
}

// 未领取的打赏奖励
export interface UnclaimedReward {
  id: string;
  amount: number;
  recipientAmount: number;
  referrerAmount?: number;
  post: {
    title: string;
    shareCode: string;
  };
  sender: {
    walletAddress: string;
  };
}

// 未领取的竞拍奖励
export interface UnclaimedBid {
  id: string;
  amount: number;
  creatorAmount?: number;
  referrerAmount?: number;
  post: {
    title: string;
    shareCode: string;
  };
  user: {
    walletAddress: string;
  };
  auctionHistoryId?: string;
  auctionObjectId?: string;
}

// 未领取奖励响应
export interface UnclaimedRewardsResponse {
  recipientRewards: UnclaimedReward[];
  referrerRewards: UnclaimedReward[];
}

export interface UnclaimedBidsResponse {
  creatorBids: UnclaimedBid[];
  referrerBids: UnclaimedBid[];
}

// 交易记录相关类型
export interface Transaction {
  id: string;
  digest: string;
  type: string;
  status: string;
  data?: unknown;
  post?: {
    id: string;
    title: string;
  };
  reward?: {
    id: string;
    amount: number;
  };
  bid?: {
    id: string;
    amount: number;
    isWinner: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface GetTransactionsResponse {
  success: boolean;
  data: Transaction[];
  pagination: Pagination;
}

export interface GetTransactionsParams {
  page?: number;
  pageSize?: number;
  type?: string;
  status?: string;
}

// 推荐帖子响应类型
export interface RecommendedPost {
  id: string;
  title: string;
  content: string;
  totalRewards: number;
  rewardCount: number;
  audienceCount: number;
  createdAt: string;
  user: {
    id: string;
    walletAddress: string;
    profile: {
      name: string | null;
      avatar: string | null;
    } | null;
  };
  category: {
    id: string;
    name: string;
  } | null;
  tags: {
    id: string;
    name: string;
  }[];
  _count: {
    comments: number;
    bookmarks: number;
  };
  images: {
    id: string;
    url: string;
  }[];
  rank?: number;
}

export interface RecommendResponse {
  posts: RecommendedPost[];
  total: number;
}

// 奖池相关类型
export interface LotteryPool {
  id: string;
  postId: string;
  amount: number;
  winnerId: string | null;
  claimed: boolean;
  round: number;
  post?: {
    title: string;
    shareCode: string;
  };
}

export interface ClaimLotteryPoolResponse {
  success: boolean;
  data: {
    lotteryPool: LotteryPool;
    user: UserProfile;
  };
}

export interface UnclaimedLotteryPoolsResponse {
  lotteryPools: LotteryPool[];
}

export interface ClaimAuctionResponse {
  success: boolean;
  message: string;
  data: {
    post: {
      id: string;
      status: PostStatus;
      lotteryRound: number;
    };
    lotteryPool: {
      id: string;
      postId: string;
      amount: number;
      round: number;
      claimed: boolean;
    };
  };
}

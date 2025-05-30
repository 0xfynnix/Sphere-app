import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from './auth';
import { walletApi } from './wallet';
import { postsApi, GetUserPostsResponse } from './posts';
import { 
  SyncUserResponse, 
  GetUserResponse, 
  Post, 
  UpdateUserRequest, 
  UpdateProfileRequest, 
  UserProfileData 
} from './types';
import { useUserStore } from '@/store/userStore';
import { bidsApi } from './bids';
import { CreateBidRequest, GetBidsResponse } from './types';
import { createReward, type CreateRewardParams, type Reward } from './rewards';
import { profileApi } from './profile';
import { generateImage, type GenerateImageRequest, type GenerateImageResponse } from './ai';
import { claimReward, getUnclaimedRewards } from './rewards';
import { RewardClaimRequest, BidClaimRequest } from './types';
import { getTransactions } from './transactions';
import { GetTransactionsParams, GetTransactionsResponse } from './types';
import { getUnclaimedLotteryPools, claimLotteryPool, getLotteryPool } from './lottery';
import { RecommendedPost } from './types';
import { followUser, unfollowUser, checkFollowStatus } from './follow';
import { bookmarkPost, unbookmarkPost, getUserBookmarks, checkBookmarkStatus } from './bookmarks';
import { PaginatedPostsResponse } from './types';
import { notificationsApi } from './notifications';
import { useNotificationStore } from '@/store/notificationStore';

// User hooks
export const useUser = () => {
  return useQuery<GetUserResponse>({
    queryKey: ['user'],
    queryFn: () => authApi.get(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};

export const useSyncUser = () => {
  return useMutation<SyncUserResponse>({
    mutationFn: () => authApi.sync(),
  });
};

// Content hooks
export const useCreateContent = () => {
  return useMutation({
    mutationFn: postsApi.create,
  });
};

// Wallet hooks
export const useGetChallenge = () => {
  return useMutation({
    mutationFn: walletApi.getChallenge,
  });
};

export const useVerifySignature = () => {
  return useMutation({
    mutationFn: walletApi.verifySignature,
  });
};

export const useSyncWalletUser = () => {
  return useMutation({
    mutationFn: walletApi.syncUser,
  });
};

export const useGetUserByWallet = (walletAddress: string) => {
  return useQuery({
    queryKey: ['wallet-user', walletAddress],
    queryFn: () => walletApi.getUser(walletAddress),
    enabled: !!walletAddress,
  });
};

// Wallet login flow hook
export const useWalletLogin = () => {
  const queryClient = useQueryClient();
  const setToken = useUserStore((state) => state.setToken);
  const setUser = useUserStore((state) => state.setUser);

  const getChallenge = useGetChallenge();
  const verifySignature = useVerifySignature();
  const syncUser = useSyncWalletUser();

  const login = async (walletAddress: string, signMessage: (message: Uint8Array) => Promise<{ signature: string }>) => {
    try {
      // 1. 获取挑战码
      const { data: { challenge } } = await getChallenge.mutateAsync(walletAddress);
      
      // 2. 使用钱包签名挑战码
      const { signature } = await signMessage(new TextEncoder().encode(challenge));
      
      // 3. 验证签名并获取用户信息
      const { data: { token, user } } = await verifySignature.mutateAsync({
        walletAddress,
        signature,
        challenge,
      });

      // 4. 保存 token 和用户信息
      setToken(token);
      setUser(user);

      // 5. 使相关查询失效，触发重新获取
      await queryClient.invalidateQueries({ queryKey: ['user'] });

      return { success: true };
    } catch (error) {
      console.error('Login failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Login failed' 
      };
    }
  };

  return {
    login,
    getChallenge,
    verifySignature,
    isLoading: getChallenge.isPending || verifySignature.isPending || syncUser.isPending,
    error: getChallenge.error || verifySignature.error || syncUser.error,
  };
};

export const usePost = (id: string) => {
  return useQuery<Post>({
    queryKey: ['post', id],
    queryFn: () => postsApi.get(id),
  });
};

export const useCreateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, content }: { postId: string; content: string }) =>
      postsApi.createComment(postId, content),
    onSuccess: (_, { postId }) => {
      // 使帖子查询失效，触发重新获取
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
    },
  });
};

export const useToggleLike = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => postsApi.toggleLike(postId),
    onSuccess: (_, postId) => {
      // 使帖子查询失效，触发重新获取
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  const { setUser } = useUserStore();

  return useMutation({
    mutationFn: (data: UpdateUserRequest) => authApi.update(data),
    onSuccess: (response) => {
      if (response.data?.user) {
        setUser(response.data.user);
        queryClient.invalidateQueries({ queryKey: ['user'] });
      }
    },
  });
};

export const useUploadImage = () => {
  return useMutation({
    mutationFn: postsApi.uploadImage,
  });
};

export const useCreateBid = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBidRequest) => bidsApi.createBid(data),
    onSuccess: (_, { postId }) => {
      // 使竞拍列表查询失效，触发重新获取
      queryClient.invalidateQueries({ queryKey: ['bids', postId] });
    },
  });
};

export const useBids = (postId: string, page: number = 1, pageSize: number = 10) => {
  return useQuery<GetBidsResponse>({
    queryKey: ['bids', postId, page, pageSize],
    queryFn: () => bidsApi.getBids(postId, page, pageSize),
    enabled: !!postId,
  });
};

export function useAuctionHistory(postId: string) {
  return useQuery({
    queryKey: ['auctionHistory', postId],
    queryFn: () => bidsApi.getAuctionHistory(postId),
    enabled: !!postId,
  });
}

export const useCreateReward = () => {
  const queryClient = useQueryClient();

  return useMutation<Reward, Error, CreateRewardParams>({
    mutationFn: createReward,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['lotteryPool'] });
    },
  });
};

// 获取用户帖子列表
export const useUserPosts = (address: string, page: number = 1, pageSize: number = 10) => {
  return useQuery<GetUserPostsResponse>({
    queryKey: ['user-posts', address, page, pageSize],
    queryFn: () => postsApi.getUserPosts({ address, page, pageSize }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!address,
  });
};
export const useUserAllPosts = (address: string, page: number = 1, pageSize: number = 10) => {
  return useQuery<GetUserPostsResponse>({
    queryKey: ['user-all-posts', address, page, pageSize],
    queryFn: () => postsApi.getUserAllPosts({ address, page, pageSize }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!address,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { setUser } = useUserStore();

  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => profileApi.update(data),
    onSuccess: (response) => {
      if (response.data?.profile) {
        // 更新用户 store 中的 profile
        const currentUser = useUserStore.getState().user;
        if (currentUser) {
          const updatedProfile: UserProfileData = {
            id: response.data.profile.id,
            name: response.data.profile.name,
            bio: response.data.profile.bio,
            avatar: response.data.profile.avatar,
          };
          setUser({
            ...currentUser,
            profile: updatedProfile,
          });
        }
        // 使相关查询失效，触发重新获取
        queryClient.invalidateQueries({ queryKey: ['user'] });
      }
    },
  });
};

export const useGenerateImage = () => {
  return useMutation<GenerateImageResponse, Error, GenerateImageRequest>({
    mutationFn: generateImage,
  });
};

export const useUpdatePostAuction = () => {
  return useMutation({
    mutationFn: postsApi.updatePostAuction,
  });
};

// 领取打赏奖励
export const useClaimReward = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: RewardClaimRequest) => claimReward(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unclaimedRewards'] });
    },
  });
};

// 获取未领取的打赏奖励
export const useUnclaimedRewards = () => {
  return useQuery({
    queryKey: ['unclaimedRewards'],
    queryFn: getUnclaimedRewards,
  });
};

// 领取竞拍奖励
export const useClaimBid = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: BidClaimRequest) => bidsApi.claimBid(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unclaimedBids'] });
    },
  });
};

// 获取未领取的竞拍奖励
export const useUnclaimedBids = () => {
  return useQuery({
    queryKey: ['unclaimedBids'],
    queryFn: bidsApi.getUnclaimedBids,
  });
};

/**
 * 获取用户交易记录的hook
 */
export function useTransactions(params: GetTransactionsParams = {}) {
  return useQuery<GetTransactionsResponse>({
    queryKey: ['transactions', params],
    queryFn: () => getTransactions(params),
  });
}

/**
 * 获取推荐帖子的 Hook
 */
export function useRecommendedPosts() {
  return useQuery<{ posts: RecommendedPost[]; total: number }>({
    queryKey: ['popularPosts'],
    queryFn: () => postsApi.getRecommendedPosts(),
  });
}

// 奖池相关 hooks
export const useUnclaimedLotteryPools = () => {
  return useQuery({
    queryKey: ['unclaimedLotteryPools'],
    queryFn: getUnclaimedLotteryPools,
  });
};

export const useClaimLotteryPool = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { digest: string }) => 
      claimLotteryPool(params.digest),
    onSuccess: () => {
      // 更新未领取奖池列表
      queryClient.invalidateQueries({ queryKey: ['unclaimedLotteryPools'] });
      // 更新用户信息
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
};

// 获取指定帖子的奖池信息
export const useLotteryPool = (postId: string) => {
  return useQuery({
    queryKey: ['lotteryPool', postId],
    queryFn: () => getLotteryPool(postId),
    enabled: !!postId,
  });
};

// 领取竞拍奖励
export const useClaimAuction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { postId: string; digest: string }) => bidsApi.claimAuction(data.postId, data.digest),
    onSuccess: () => {
      // 使相关查询失效，触发重新获取
      queryClient.invalidateQueries({ queryKey: ['user'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['bids'] });
      queryClient.invalidateQueries({ queryKey: ['lotteryPools'] });
    },
  });
}; 

// 完成竞拍
export const useCompleteAuction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { postId: string; digest: string, lotteryPoolWinnerAddress?: string }) => bidsApi.completeAuction(params),
    onSuccess: () => {
      // 使相关查询失效，触发重新获取
      queryClient.invalidateQueries({ queryKey: ['post'] });
      queryClient.invalidateQueries({ queryKey: ['bids'] });
      queryClient.invalidateQueries({ queryKey: ['auctionHistory'] });
      queryClient.invalidateQueries({ queryKey: ['lotteryPool'] });
    },
  });
}; 

export function useComments(postId: string, page: number = 1, pageSize: number = 10) {
  return useQuery<{
    comments: Array<{
      id: string;
      content: string;
      createdAt: string;
      user: {
        id: string;
        walletAddress: string;
        profile: {
          name: string | null;
          avatar: string | null;
        } | null;
      };
    }>;
    pagination: {
      total: number;
      page: number;
      pageSize: number;
      totalPages: number;
    };
  }>({
    queryKey: ['comments', postId, page, pageSize],
    queryFn: () => postsApi.getComments(postId, page, pageSize),
    enabled: !!postId,
  });
}

export function usePopularPosts() {
  return useQuery<{ posts: RecommendedPost[]; total: number }>({
    queryKey: ['popularPosts'],
    queryFn: () => postsApi.getPopularPosts(),
  });
} 

export const useFollowUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: followUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['follow-status'] });
    },
  });
};

export const useUnfollowUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: unfollowUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['follow-status'] });
    },
  });
};

export const useFollowStatus = (followingId: string) => {
  return useQuery({
    queryKey: ['follow-status', followingId],
    queryFn: () => checkFollowStatus(followingId),
    enabled: !!followingId,
  });
};

export const useBookmarkPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bookmarkPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
    },
  });
};

export const useUnbookmarkPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: unbookmarkPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
    },
  });
};

export const useUserBookmarks = (userAddress: string, page: number = 1, pageSize: number = 10) => {
  return useQuery<PaginatedPostsResponse>({
    queryKey: ['bookmarks', userAddress, page, pageSize],
    queryFn: () => getUserBookmarks(userAddress, page, pageSize),
    enabled: !!userAddress,
  });
};

export const useBookmarkStatus = (postId: string) => {
  return useQuery({
    queryKey: ['bookmark-status', postId],
    queryFn: () => checkBookmarkStatus(postId),
    enabled: !!postId,
  });
};

// Hook to get posts from users followed by a specific user
export const useFollowedUsersPosts = (address: string, page: number = 1, pageSize: number = 10) => {
  return useQuery<GetUserPostsResponse>({
    queryKey: ['followed-users-posts', address, page, pageSize],
    queryFn: () => postsApi.getFollowedUsersPosts({ page, pageSize }),
    enabled: !!address,
  });
};

// Notifications hooks
export const useNotifications = () => {
  const setNotifications = useNotificationStore((state) => state.setNotifications);

  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await notificationsApi.getNotifications();
      setNotifications(response.notifications);
      return response;
    },
  });
};

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();
  const markAsRead = useNotificationStore((state) => state.markAsRead);

  return useMutation({
    mutationFn: async (notificationId: number) => {
      await notificationsApi.markAsRead(notificationId);
      markAsRead(notificationId);
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();
  const markAllAsRead = useNotificationStore((state) => state.markAllAsRead);

  return useMutation({
    mutationFn: async () => {
      await notificationsApi.markAllAsRead();
      markAllAsRead();
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}; 
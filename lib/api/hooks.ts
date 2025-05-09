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
import { getUnclaimedLotteryPools, claimLotteryPool } from './lottery';

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
  return useMutation({
    mutationFn: (data: RewardClaimRequest) => claimReward(data),
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
  return useMutation({
    mutationFn: (data: BidClaimRequest) => bidsApi.claimBid(data),
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
  return useQuery({
    queryKey: ['recommendedPosts'],
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
    mutationFn: claimLotteryPool,
    onSuccess: () => {
      // 更新未领取奖池列表
      queryClient.invalidateQueries({ queryKey: ['unclaimedLotteryPools'] });
      // 更新用户信息
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
};

// 领取竞拍奖励
export const useClaimAuction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => bidsApi.claimAuction(postId),
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
    mutationFn: (params: { postId: string; digest: string }) => bidsApi.completeAuction(params),
    onSuccess: () => {
      // 使相关查询失效，触发重新获取
      queryClient.invalidateQueries({ queryKey: ['post'] });
      queryClient.invalidateQueries({ queryKey: ['bids'] });
      queryClient.invalidateQueries({ queryKey: ['auctionHistory'] });
    },
  });
}; 
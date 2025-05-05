import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from './auth';
import { walletApi } from './wallet';
import { postsApi } from './posts';
import { SyncUserResponse, GetUserResponse, Post, UpdateUserRequest } from './types';
import { useUserStore } from '@/store/userStore';
import { bidsApi } from './bids';
import { CreateBidRequest, GetBidsResponse } from './types';

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
    mutationFn: (data: CreateBidRequest) => bidsApi.create(data),
    onSuccess: (_, { postId }) => {
      // 使竞拍列表查询失效，触发重新获取
      queryClient.invalidateQueries({ queryKey: ['bids', postId] });
    },
  });
};

export const useBids = (postId: string) => {
  return useQuery<GetBidsResponse>({
    queryKey: ['bids', postId],
    queryFn: () => bidsApi.get(postId),
    enabled: !!postId,
  });
}; 
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from './auth';
import { walletApi } from './wallet';
import { contentApi } from './content';
import { SyncUserResponse, GetUserResponse } from './types';
import { useUserStore } from '@/store/userStore';

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
    mutationFn: contentApi.create,
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
    isLoading: getChallenge.isPending || verifySignature.isPending || syncUser.isPending,
    error: getChallenge.error || verifySignature.error || syncUser.error,
  };
}; 
import { request } from './requests';
import type { 
  ClaimLotteryPoolResponse, 
  UnclaimedLotteryPoolsResponse,
  LotteryPoolResponse
} from './types';

// 领取奖池奖励
export const claimLotteryPool = async (digest: string) => {
  const response = await request<ClaimLotteryPoolResponse>('/api/lottery-pool/claim', {
    method: 'POST',
    body: JSON.stringify({ digest }),
  });
  return response;
};

// 获取未领取的奖池奖励
export const getUnclaimedLotteryPools = async () => {
  const response = await request<UnclaimedLotteryPoolsResponse>('/api/lottery-pool/claim');
  return response;
};

// 获取指定帖子的奖池信息
export const getLotteryPool = async (postId: string) => {
  const response = await request<LotteryPoolResponse>(`/api/lottery-pool/${postId}`);
  return response;
}; 
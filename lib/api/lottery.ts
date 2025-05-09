import { request } from './requests';
import type { 
  ClaimLotteryPoolResponse, 
  UnclaimedLotteryPoolsResponse 
} from './types';

// 领取奖池奖励
export const claimLotteryPool = async (postId: string) => {
  const response = await request<ClaimLotteryPoolResponse>('/api/lottery-pool/claim', {
    method: 'POST',
    body: JSON.stringify({ postId }),
  });
  return response;
};

// 获取未领取的奖池奖励
export const getUnclaimedLotteryPools = async () => {
  const response = await request<UnclaimedLotteryPoolsResponse>('/api/lottery-pool/claim');
  return response;
}; 
import { request } from './requests';
import { RewardClaimRequest, RewardClaimResponse, UnclaimedRewardsResponse } from './types';

export interface CreateRewardParams {
  ref: string;
  amount: number;
  postId: string;
  digest: string;
}

export interface Reward {
  id: string;
  postId: string;
  amount: number;
  referrerId?: string;
  createdAt: string;
}

export const createReward = async (params: CreateRewardParams) => {
  return request<Reward>('/api/rewards', {
    method: 'POST',
    body: JSON.stringify(params),
  });
};

// 领取打赏奖励
export const claimReward = async (data: RewardClaimRequest): Promise<RewardClaimResponse> => {
  return request('/api/rewards/claim', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

// 获取未领取的打赏奖励
export const getUnclaimedRewards = async (): Promise<UnclaimedRewardsResponse> => {
  return request('/api/rewards/claim', {
    method: 'GET',
  });
}; 
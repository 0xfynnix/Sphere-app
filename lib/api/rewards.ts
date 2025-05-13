import { request } from './requests';
import { RewardClaimRequest, RewardClaimResponse } from './types';

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

export interface PostReward {
  post: {
    id: string;
    title: string;
    shareCode: string;
    nftObjectId: string;
    content: string;
    createdAt: string;
    user: {
      walletAddress: string;
      profile: {
        name: string | null;
        avatar: string | null;
      } | null;
    };
  };
  totalAmount: number;
  rewards: Array<{
    id: string;
    amount: number;
    sender: {
      walletAddress: string;
      profile: {
        name: string | null;
        avatar: string | null;
      } | null;
    };
    createdAt: string;
  }>;
}

export interface UnclaimedRewardsResponse {
  recipientPosts: PostReward[];
  referrerPosts: PostReward[];
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
import { request } from './requests';

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
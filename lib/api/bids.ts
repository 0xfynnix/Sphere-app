import { request } from './requests';
import { CreateBidRequest, CreateBidResponse, GetBidsResponse, GetAuctionHistoryResponse, BidClaimRequest, BidClaimResponse, UnclaimedBidsResponse, ClaimAuctionResponse } from './types';
export const bidsApi = {
  // 创建竞拍
  createBid: async (params: CreateBidRequest): Promise<CreateBidResponse> => {
    return request('/api/bids', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  // 获取竞拍列表
  getBids: async (postId: string, page: number = 1, pageSize: number = 10): Promise<GetBidsResponse> => {
    return request(`/api/bids?postId=${postId}&page=${page}&pageSize=${pageSize}`);
  },

// 获取竞拍历史
  getAuctionHistory: async (postId: string, page: number = 1, pageSize: number = 10): Promise<GetAuctionHistoryResponse> => {
    return request(`/api/bids/history?postId=${postId}&page=${page}&pageSize=${pageSize}`);
  },

// 领取竞拍奖励
  claimBid: async (data: BidClaimRequest): Promise<BidClaimResponse> => {
    return request('/api/bids/claim', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

// 获取未领取的竞拍奖励
  getUnclaimedBids: async (): Promise<UnclaimedBidsResponse> => {
    return request('/api/bids/claim', {
      method: 'GET',
    });
  },

  // 领取竞拍奖励
  claimAuction: async (postId: string, digest: string): Promise<ClaimAuctionResponse> => {
    const response = await request<ClaimAuctionResponse>('/api/auction/claim', {
      method: 'POST',
      body: JSON.stringify({ postId, digest }),
    });
    return response;
  },

  // 完成竞拍
  completeAuction: async (params: { postId: string; digest: string, lotteryPoolWinnerAddress?: string }): Promise<{ success: boolean; message: string }> => {
    return request('/api/auction/process-expired', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },
}
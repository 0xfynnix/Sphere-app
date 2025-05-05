import { request } from './requests';
import { API_ENDPOINTS } from './requests';
import { CreateBidRequest, CreateBidResponse, GetBidsResponse, GetAuctionHistoryResponse } from './types';

export const bidsApi = {
  // 创建竞拍
  create: async (data: CreateBidRequest): Promise<CreateBidResponse> => {
    return request(API_ENDPOINTS.BIDS.CREATE, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // 获取竞拍列表
  get: async (postId: string, page: number = 1, pageSize: number = 10): Promise<GetBidsResponse> => {
    return request(API_ENDPOINTS.BIDS.GET(postId, page, pageSize), {
      method: 'GET',
    });
  },

  getHistory: (postId: string) => {
    return request<GetAuctionHistoryResponse>(`/api/bids/history?postId=${postId}`);
  }
}; 
import { request } from './requests';
import { API_ENDPOINTS } from './requests';
import { CreateBidRequest, CreateBidResponse, GetBidsResponse } from './types';

export const bidsApi = {
  // 创建竞拍
  create: async (data: CreateBidRequest): Promise<CreateBidResponse> => {
    return request(API_ENDPOINTS.BIDS.CREATE, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // 获取竞拍列表
  get: async (postId: string): Promise<GetBidsResponse> => {
    return request(API_ENDPOINTS.BIDS.GET(postId), {
      method: 'GET',
    });
  },
}; 
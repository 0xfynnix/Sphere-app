import { request } from './requests';
import { API_ENDPOINTS } from './requests';
import { SyncUserResponse, GetUserResponse } from './types';

export const authApi = {
  // 同步用户数据
  sync: async (): Promise<SyncUserResponse> => {
    return request<SyncUserResponse>(API_ENDPOINTS.AUTH.SYNC, {
      method: 'POST',
    });
  },

  // 获取用户数据
  get: async (): Promise<GetUserResponse> => {
    return request<GetUserResponse>(API_ENDPOINTS.AUTH.USER, {
      method: 'GET',
    });
  },
}; 
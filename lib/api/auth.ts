import { request } from './requests';
import { API_ENDPOINTS } from './requests';
import { SyncUserResponse, GetUserResponse, UpdateUserRequest, UpdateUserResponse } from './types';

export const authApi = {
  // 同步用户数据
  sync: async (): Promise<SyncUserResponse> => {
    return request<SyncUserResponse>(API_ENDPOINTS.AUTH.SYNC, {
      method: 'POST',
    });
  },

  // 获取用户数据
  get: () => request<GetUserResponse>(API_ENDPOINTS.AUTH.USER, {
      method: 'GET',
  }),

  update: (data: UpdateUserRequest) => request<UpdateUserResponse>(API_ENDPOINTS.AUTH.USER, {
    method: 'PATCH',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
  },
  }),
}; 
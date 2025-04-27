import { SyncUserResponse, GetUserResponse } from './types';
import { useUserStore } from '@/store/userStore';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

// 统一的请求处理函数
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = useUserStore.getState().token;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Request failed');
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Unknown error occurred');
  }
}

// 用户相关 API
export const userApi = {
  // 同步用户数据
  sync: async (): Promise<SyncUserResponse> => {
    return request<SyncUserResponse>('/api/auth/sync', {
      method: 'POST',
    });
  },

  // 获取用户数据
  get: async (): Promise<GetUserResponse> => {
    return request<GetUserResponse>('/api/user', {
      method: 'GET',
    });
  },
}; 
import { useUserStore } from '@/store/userStore';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

// API endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    SYNC: '/api/auth/sync',
    USER: '/api/user',
  },
  // Login endpoints
  LOGIN: {
    CHALLENGE: '/api/login/challenge',
    VERIFY: '/api/login/verify',
    SYNC: '/api/login/sync',
    USER: (walletAddress: string) => `/api/login/user/${walletAddress}`,
  },
  // Content endpoints
  CONTENT: {
    CREATE: '/api/content',
  },
} as const;

// 统一的请求处理函数
export async function request<T>(
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
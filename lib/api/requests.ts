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
  },
  WALLET: {
    USER: (walletAddress: string) => `/api/wallet/user/${walletAddress}`,
  },
  // Content endpoints
  CONTENT: {
    CREATE: '/api/content',
    LIST: (page?: number, pageSize?: number, address?: string) => 
      `/api/content?${address ? `address=${address}` : ''}${page ? `&page=${page}` : ''}${pageSize ? `&pageSize=${pageSize}` : ''}`,
    ALL: (page?: number, pageSize?: number, address?: string) => 
      `/api/content/all?${address ? `address=${address}` : ''}${page ? `&page=${page}` : ''}${pageSize ? `&pageSize=${pageSize}` : ''}`,
  },
  // Images endpoints
  IMAGES: {
    UPLOAD: '/api/images',
  },
  // Post endpoints
  POSTS: {
    GET: (id: string) => `/api/posts/${id}`,
    COMMENT: (id: string) => `/api/posts/${id}/comment`,
    LIKE: (id: string) => `/api/posts/${id}/like`,
    POPULAR: `/api/posts/popular`,
    RECOMMEND: `/api/posts/recommend`,
    COMMENTS: (id: string, page?: number, pageSize?: number) => 
      `/api/posts/${id}/comment?${page ? `page=${page}` : ''}${pageSize ? `&pageSize=${pageSize}` : ''}`,
  },
  // Bids endpoints
  BIDS: {
    CREATE: '/api/bids',
    GET: (postId: string, page?: number, pageSize?: number) => 
      `/api/bids?postId=${postId}${page ? `&page=${page}` : ''}${pageSize ? `&pageSize=${pageSize}` : ''}`,
  },
  PROFILE: {
    UPDATE: '/api/profile',
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
    // 如果是 FormData，不要设置 Content-Type，让浏览器自动设置
    const headers: Record<string, string> = {
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers as Record<string, string>,
    };

    // 如果不是 FormData，则设置默认的 Content-Type
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(url, {
      ...options,
      headers,
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
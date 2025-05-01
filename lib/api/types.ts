// API 响应基础类型
export interface ApiResponse<T> {
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
  success: boolean;
}

// 用户资料类型
export interface UserProfileData {
  id: string;
  name: string | null | undefined;
  bio: string | null | undefined;
  avatar: string | null | undefined;
}

// 用户相关类型
export interface UserProfile {
  id: string;
  walletAddress: string;
  email: string | null;
  profile: UserProfileData | null;
  createdAt: string;
  updatedAt: string;
}

// 同步用户响应
export type SyncUserResponse = ApiResponse<{
  user: UserProfile;
}>;

// 获取用户响应
export type GetUserResponse = ApiResponse<{
  user: UserProfile;
}>;

export interface Post {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  likes: number;
  comments: Comment[];
  images: {
    url: string;
    type: 'walrus' | 'vercel';
  }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  timestamp: Date;
} 
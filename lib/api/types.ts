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
  name: string | null;
  bio: string | null;
  avatar: string | null;
  wallets: string[];
}

// 用户相关类型
export interface UserProfile {
  id: string;
  walletAddress: string;
  email: string | null;
  profile: UserProfileData | null;
}

// 同步用户响应
export type SyncUserResponse = ApiResponse<{
  user: UserProfile;
}>;

// 获取用户响应
export type GetUserResponse = ApiResponse<{
  user: UserProfile;
}>; 
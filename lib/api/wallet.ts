import { request } from './requests';
import { API_ENDPOINTS } from './requests';
import { UserProfile } from './types';

export const walletApi = {
  // 获取挑战码
  getChallenge: async (walletAddress: string) => {
    return request<{ data: { challenge: string } }>(API_ENDPOINTS.LOGIN.CHALLENGE, {
      method: 'POST',
      body: JSON.stringify({ walletAddress }),
    });
  },

  // 验证签名
  verifySignature: async (data: {
    walletAddress: string;
    signature: string;
    challenge: string;
  }) => {
    return request<{ data: { token: string; user: UserProfile } }>(API_ENDPOINTS.LOGIN.VERIFY, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // 同步钱包用户
  syncUser: async (walletAddress: string) => {
    return request<{ data: { user: UserProfile } }>(API_ENDPOINTS.LOGIN.SYNC, {
      method: 'POST',
      body: JSON.stringify({ walletAddress }),
    });
  },

  // 获取用户
  getUser: async (walletAddress: string) => {
    return request<{ data: { user: UserProfile } }>(API_ENDPOINTS.WALLET.USER(walletAddress));
  },
}; 
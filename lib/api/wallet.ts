import { UserProfile } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

// 获取挑战码
export async function getChallenge(walletAddress: string): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/wallet/challenge`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ walletAddress }),
  });

  if (!response.ok) {
    throw new Error('Failed to get challenge');
  }

  const data = await response.json();
  return data.data.challenge;
}

// 验证签名
export async function verifySignature(
  walletAddress: string,
  signature: string,
  challenge: string
): Promise<{ token: string; user: UserProfile }> {
  const response = await fetch(`${API_BASE_URL}/wallet/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      walletAddress,
      signature,
      challenge,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to verify signature');
  }

  const data = await response.json();
  return data.data;
}

export async function syncWalletUser(walletAddress: string): Promise<UserProfile> {
  const response = await fetch(`${API_BASE_URL}/wallet/sync`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ walletAddress }),
  });

  if (!response.ok) {
    throw new Error('Failed to sync wallet user');
  }

  const data = await response.json();
  return data.data.user;
}

export async function getUserByWallet(walletAddress: string): Promise<UserProfile> {
  const response = await fetch(`${API_BASE_URL}/wallet/${walletAddress}`);

  if (!response.ok) {
    throw new Error('Failed to get user by wallet');
  }

  const data = await response.json();
  return data.data.user;
} 
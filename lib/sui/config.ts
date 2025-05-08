import { getFullnodeUrl } from '@mysten/sui/client';

export const NETWORK = (process.env.NEXT_PUBLIC_SUI_NETWORK || 'testnet') as 'testnet' | 'mainnet' | 'devnet' | 'localnet';

export const RPC_URL = getFullnodeUrl(NETWORK);

// Contract address
export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

// Contract module names
export const MODULE_NAMES = {
  IDENTITY: 'identity',
  // NFT_AUCTION: 'nft_auction',
  COPYRIGHT_NFT: 'copyright_nft',
  BADGE_NFT: 'badge_nft',
} as const; 
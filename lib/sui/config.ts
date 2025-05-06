import { getFullnodeUrl } from '@mysten/sui/client';

export const NETWORK = (process.env.NEXT_PUBLIC_SUI_NETWORK || 'testnet') as 'testnet' | 'mainnet' | 'devnet' | 'localnet';

export const RPC_URL = getFullnodeUrl(NETWORK);

// Contract address
export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x3919abf59f55712c2ba4749376377e1ed813f19cc91354b473e74d045ba34988';

// Contract module names
export const MODULE_NAMES = {
  IDENTITY: 'identity',
  NFT_AUCTION: 'nft_auction',
  COPYRIGHT_NFT: 'copyright_nft',
  BADGE_NFT: 'badge_nft',
} as const; 
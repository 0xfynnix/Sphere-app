import { useSuiClient } from '@mysten/dapp-kit';
import { useQuery } from '@tanstack/react-query';
import { CONTRACT_ADDRESSES, MODULE_NAMES } from '@/lib/sui/config';

export function useIdentity(address?: string) {
  const client = useSuiClient();

  return useQuery({
    queryKey: ['identity', address],
    queryFn: async () => {
      if (!address) return null;
      try {
        const result = await client.getObject({
          id: address,
          options: {
            showContent: true,
            showOwner: true,
          },
        });
        
        // Check if the object is of the correct type
        if (result.data?.type !== `${CONTRACT_ADDRESSES.IDENTITY}::${MODULE_NAMES.IDENTITY}::Identity`) {
          return null;
        }
        
        return result;
      } catch (error) {
        console.error('Failed to fetch identity:', error);
        return null;
      }
    },
    enabled: !!address,
  });
}

export function useAuction(auctionId?: string) {
  const client = useSuiClient();

  return useQuery({
    queryKey: ['auction', auctionId],
    queryFn: async () => {
      if (!auctionId) return null;
      try {
        const result = await client.getObject({
          id: auctionId,
          options: {
            showContent: true,
            showOwner: true,
          },
        });
        
        // Check if the object is of the correct type
        if (result.data?.type !== `${CONTRACT_ADDRESSES.NFT_AUCTION}::${MODULE_NAMES.NFT_AUCTION}::Auction`) {
          return null;
        }
        
        return result;
      } catch (error) {
        console.error('Failed to fetch auction:', error);
        return null;
      }
    },
    enabled: !!auctionId,
  });
}

export function useCopyrightNFT(nftId?: string) {
  const client = useSuiClient();

  return useQuery({
    queryKey: ['copyrightNFT', nftId],
    queryFn: async () => {
      if (!nftId) return null;
      try {
        const result = await client.getObject({
          id: nftId,
          options: {
            showContent: true,
            showOwner: true,
          },
        });
        
        // Check if the object is of the correct type
        if (result.data?.type !== `${CONTRACT_ADDRESSES.COPYRIGHT_NFT}::${MODULE_NAMES.COPYRIGHT_NFT}::CopyrightNFT`) {
          return null;
        }
        
        return result;
      } catch (error) {
        console.error('Failed to fetch copyright NFT:', error);
        return null;
      }
    },
    enabled: !!nftId,
  });
}

export function useBadgeNFT(nftId?: string) {
  const client = useSuiClient();

  return useQuery({
    queryKey: ['badgeNFT', nftId],
    queryFn: async () => {
      if (!nftId) return null;
      try {
        const result = await client.getObject({
          id: nftId,
          options: {
            showContent: true,
            showOwner: true,
          },
        });
        
        // Check if the object is of the correct type
        if (result.data?.type !== `${CONTRACT_ADDRESSES.BADGE_NFT}::${MODULE_NAMES.BADGE_NFT}::BadgeNFT`) {
          return null;
        }
        
        return result;
      } catch (error) {
        console.error('Failed to fetch badge NFT:', error);
        return null;
      }
    },
    enabled: !!nftId,
  });
} 
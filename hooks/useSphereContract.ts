import { useSuiClient, useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { CONTRACT_ADDRESS, MODULE_NAMES } from '@/lib/sui/config';

export function useSphereContract() {
  const client = useSuiClient();
  const account = useCurrentAccount();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();

  // Identity functions
  const register = async (type: number) => {
    if (!account) throw new Error('No account connected');
    
    const tx = new Transaction();
    tx.moveCall({
      target: `${CONTRACT_ADDRESS}::${MODULE_NAMES.IDENTITY}::register`,
      arguments: [tx.pure.u8(type)],
    });

    const result = await signAndExecute({
      transaction: tx,
    });

    // Wait for transaction to be confirmed
    await client.waitForTransaction({
      digest: result.digest,
      options: {
        showEffects: true,
        showEvents: true,
      },
    });

    return result;
  };

  // NFT Auction functions
  const createAuction = async (nftId: string, minPrice: number, duration: number) => {
    if (!account) throw new Error('No account connected');
    
    const tx = new Transaction();
    tx.moveCall({
      target: `${CONTRACT_ADDRESS}::${MODULE_NAMES.NFT_AUCTION}::create_auction`,
      arguments: [tx.object(nftId), tx.pure.u64(minPrice), tx.pure.u64(duration)],
    });

    return signAndExecute({
      transaction: tx,
    });
  };

  // Copyright NFT functions
  const mintCopyrightNFT = async (
    mintRecord: string,
    creatorRecord: string,
    name: string,
    description: string,
    link: string,
    imageUrl: string,
    thumbnailUrl: string,
    projectUrl: string,
    creator: string
  ) => {
    if (!account) throw new Error('No account connected');
    
    const tx = new Transaction();
    tx.moveCall({
      target: `${CONTRACT_ADDRESS}::${MODULE_NAMES.COPYRIGHT_NFT}::mint`,
      arguments: [
        tx.object(mintRecord),
        tx.object(creatorRecord),
        tx.pure.string(name),
        tx.pure.string(description),
        tx.pure.string(link),
        tx.pure.string(imageUrl),
        tx.pure.string(thumbnailUrl),
        tx.pure.string(projectUrl),
        tx.pure.address(creator),
      ],
    });

    return signAndExecute({
      transaction: tx,
    });
  };

  // Badge NFT functions
  const createRevenueCap = async (nftType: string, totalSupply: number, revenue: string) => {
    if (!account) throw new Error('No account connected');
    
    const tx = new Transaction();
    tx.moveCall({
      target: `${CONTRACT_ADDRESS}::${MODULE_NAMES.BADGE_NFT}::create_revenue_cap`,
      arguments: [tx.pure.string(nftType), tx.pure.u64(totalSupply), tx.pure.address(revenue)],
    });

    return signAndExecute({
      transaction: tx,
    });
  };

  return {
    register,
    createAuction,
    mintCopyrightNFT,
    createRevenueCap,
  };
} 
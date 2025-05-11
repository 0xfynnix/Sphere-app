import { useSuiClient, useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { CONTRACT_ADDRESS, MODULE_NAMES } from '@/lib/sui/config';
import { MIST_PER_SUI } from '@mysten/sui/utils';

export function useSphereContract() {
  const client = useSuiClient();
  const account = useCurrentAccount();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();

  // Utility function to convert SUI to MIST
  const suiToMist = (sui: number): number => {
    return Math.floor(sui * Number(MIST_PER_SUI));
  };

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
      target: `${CONTRACT_ADDRESS}::${MODULE_NAMES.COPYRIGHT_NFT}::create_auction`,
      arguments: [
        tx.object(nftId), 
        tx.pure.u64(suiToMist(minPrice)), 
        tx.pure.u64(duration),
        tx.object.clock(), // Use the Clock object helper
      ],
    });

    return signAndExecute({
      transaction: tx,
    });
  };

  /**
   * 用于在拍卖中出价
   * @param auctionId - 拍卖对象 ID
   * @param bidAmount - 出价金额(SUI)
   * @param reference - 推荐人地址，如果没有则为 0x0
   * 使用 gas coin 作为出价代币
   * 使用 Clock 对象检查时间
   */
  const placeBid = async (auctionId: string, bidAmount: number, reference: string) => {
    if (!account) throw new Error('No account connected');
    
    // First transaction: Split coin from gas
    const splitTx = new Transaction();
    const [bidCoin] = splitTx.splitCoins(splitTx.gas, [suiToMist(bidAmount)]);
    splitTx.transferObjects([bidCoin], account.address);

    const splitResult = await signAndExecute({
      transaction: splitTx,
    });

    // Wait for the split transaction to be confirmed
    await client.waitForTransaction({
      digest: splitResult.digest,
      options: {
        showEffects: true,
        showEvents: true,
      },
    });

    // Get the created coin object ID from the transaction effects
    const effects = await client.getTransactionBlock({
      digest: splitResult.digest,
      options: {
        showEffects: true,
        showEvents: true,
      },
    });

    const createdCoins = effects.effects?.created || [];
    const bidCoinId = createdCoins[0]?.reference?.objectId;

    if (!bidCoinId) {
      throw new Error('Failed to get split coin ID');
    }

    // Second transaction: Place bid using the split coin
    const bidTx = new Transaction();
    bidTx.moveCall({
      target: `${CONTRACT_ADDRESS}::${MODULE_NAMES.COPYRIGHT_NFT}::place_bid`,
      arguments: [
        bidTx.object(auctionId),
        bidTx.object.clock(),
        bidTx.object(bidCoinId),
        bidTx.pure.address(reference),
      ],
    });

    return signAndExecute({
      transaction: bidTx,
    });
  };

  /**
   * 用于结束拍卖
   * @param auctionId - 拍卖对象 ID
   * @param auctionCapId - 拍卖权限对象 ID
   * @param revenueShare - 收入分成比例
   * @param revenueCapId - 收入分成权限对象 ID
   * @param achievementRecordId - 成就记录对象 ID
   * 使用 Clock 对象检查时间
   */
  const endAuction = async (auctionId: string, auctionCapId: string) => {
    if (!account) throw new Error('No account connected');
    
    const tx = new Transaction();
    tx.moveCall({
      target: `${CONTRACT_ADDRESS}::${MODULE_NAMES.COPYRIGHT_NFT}::end_auction`,
      arguments: [
        tx.object(process.env.NEXT_PUBLIC_COPY_RIGHT_ACHIEVEMENT_RECORD!),
        tx.pure.u64(10),
        tx.object(auctionCapId),
        tx.object(auctionId),
        tx.object.clock(),
        tx.object(process.env.NEXT_PUBLIC_COPY_RIGHT_REVENUE_CAP!),
      ],
    });

    return signAndExecute({
      transaction: tx,
    });
  };

  /**
   * 用于获胜者领取 NFT
   * @param auctionId - 拍卖对象 ID
   */
  const claimNFT = async (auctionId: string) => {
    if (!account) throw new Error('No account connected');
    
    const tx = new Transaction();
    tx.moveCall({
      target: `${CONTRACT_ADDRESS}::${MODULE_NAMES.COPYRIGHT_NFT}::claim_nft`,
      arguments: [tx.object(auctionId)],
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
    console.log(mintRecord, creatorRecord, name, description, link, imageUrl, thumbnailUrl, projectUrl, creator);
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

  /**
   * 用于给 NFT 打赏
   * @param achievementRecord - 成就记录对象 ID
   * @param creatorRecord - 创作者记录对象 ID
   * @param nftAddress - NFT 地址
   * @param revenueTipPool - 收入分成池对象 ID
   * @param referenceTipPool - 推荐分成池对象 ID
   * @param creatorTipPool - 创作者分成池对象 ID
   * @param tipAmount - 打赏金额（SUI）
   * @param revenueAddress - 收入地址
   * @param referenceAddress - 推荐地址
   * 使用 splitCoins 从 gas 中分割出打赏金额
   */
  const tipNFT = async (
    achievementRecord: string,
    creatorRecord: string,
    nftAddress: string,
    revenueTipPool: string,
    referenceTipPool: string,
    creatorTipPool: string,
    tipAmount: number,
    revenueAddress: string,
    referenceAddress: string
  ) => {
    if (!account) throw new Error('No account connected');
    
    const tx = new Transaction();
    // Split coins for tip
    const [tipCoin] = tx.splitCoins(tx.gas, [suiToMist(tipAmount)]);
    
    tx.moveCall({
      target: `${CONTRACT_ADDRESS}::${MODULE_NAMES.COPYRIGHT_NFT}::tip_nft`,
      arguments: [
        tx.object(achievementRecord),
        tx.object(creatorRecord),
        tx.pure.address(nftAddress),
        tx.object(revenueTipPool),
        tx.object(referenceTipPool),
        tx.object(creatorTipPool),
        tipCoin,
        tx.pure.address(revenueAddress),
        tx.pure.address(referenceAddress),
      ],
    });

    return signAndExecute({
      transaction: tx,
    });
  };

  /**
   * 用于领取收入分成
   * @param revenueTipPool - 收入分成池对象 ID
   */
  const claimRevenueTip = async (revenueTipPool: string) => {
    if (!account) throw new Error('No account connected');
    
    const tx = new Transaction();
    tx.moveCall({
      target: `${CONTRACT_ADDRESS}::${MODULE_NAMES.COPYRIGHT_NFT}::revenue_claim_tip`,
      arguments: [tx.object(revenueTipPool)],
    });

    return signAndExecute({
      transaction: tx,
    });
  };

  /**
   * 用于推荐者领取打赏推荐分成
   * @param referenceTipPool - 推荐分成池对象 ID
   */
  const claimReferenceTip = async (referenceTipPool: string) => {
    if (!account) throw new Error('No account connected');
    
    const tx = new Transaction();
    tx.moveCall({
      target: `${CONTRACT_ADDRESS}::${MODULE_NAMES.COPYRIGHT_NFT}::reference_claim_tip`,
      arguments: [tx.object(referenceTipPool)],
    });

    return signAndExecute({
      transaction: tx,
    });
  };

  /**
   * 用于创作者领取打赏分成
   * @param creatorTipPool - 创作者分成池对象 ID
   */
  const claimCreatorTip = async (creatorTipPool: string) => {
    if (!account) throw new Error('No account connected');
    
    const tx = new Transaction();
    tx.moveCall({
      target: `${CONTRACT_ADDRESS}::${MODULE_NAMES.COPYRIGHT_NFT}::creator_claim_tip`,
      arguments: [tx.object(creatorTipPool)],
    });

    return signAndExecute({
      transaction: tx,
    });
  };

  /**
   * 用于领取拍卖奖励
   * @param auctionId - 拍卖对象 ID
   */
  const claimReward = async (auctionId: string) => {
    if (!account) throw new Error('No account connected');
    
    const tx = new Transaction();
    tx.moveCall({
      target: `${CONTRACT_ADDRESS}::${MODULE_NAMES.COPYRIGHT_NFT}::claim_reward`,
      arguments: [tx.object(auctionId)],
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
    placeBid,
    endAuction,
    claimNFT,
    mintCopyrightNFT,
    tipNFT,
    claimRevenueTip,
    claimReferenceTip,
    claimCreatorTip,
    claimReward,
    createRevenueCap,
  };
} 
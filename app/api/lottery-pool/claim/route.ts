import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const address = request.headers.get("x-user-address");
    if (!address) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { digest } = await request.json();
    if (!digest) {
      return NextResponse.json({ error: "Transaction digest is required" }, { status: 400 });
    }

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { walletAddress: address },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 查找所有未领取的奖池
    const unclaimedLotteryPools = await prisma.lotteryPool.findMany({
      where: {
        winnerId: user.id,
        claimed: false,
        amount: {
          gt: 0
        }
      },
    });

    if (unclaimedLotteryPools.length === 0) {
      return NextResponse.json(
        { error: "No unclaimed lottery pools found for this user" },
        { status: 404 }
      );
    }

    // 开始事务
    const result = await prisma.$transaction(async (tx) => {
      // 更新所有奖池状态为已领取
      const updatedLotteryPools = await Promise.all(
        unclaimedLotteryPools.map(pool =>
          tx.lotteryPool.update({
            where: { id: pool.id },
            data: {
              claimed: true,
            },
          })
        )
      );

      // 计算总金额
      const totalAmount = unclaimedLotteryPools.reduce((sum, pool) => sum + pool.amount, 0);

      // 更新用户的奖池收益
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: {
          lotteryEarnings: {
            increment: totalAmount,
          },
        },
        include: {
          profile: true,
          sentRewards: true,
          receivedRewards: true
        },
      });

      // 创建交易记录
      const transaction = await tx.suiTransaction.create({
        data: {
          digest,
          type: 'claim lottery pool',
          status: 'SUCCESS',
          userId: user.id,
          data: {
            totalAmount,
            processedCount: unclaimedLotteryPools.length,
            pools: unclaimedLotteryPools.map(pool => ({
              id: pool.id,
              postId: pool.postId,
              amount: pool.amount,
              round: pool.round
            }))
          }
        },
      });

      return {
        lotteryPools: updatedLotteryPools,
        user: {
          id: updatedUser.id,
          walletAddress: updatedUser.walletAddress,
          email: updatedUser.email || undefined,
          shareCode: updatedUser.shareCode || "",
          createdAt: updatedUser.createdAt.toISOString(),
          updatedAt: updatedUser.updatedAt.toISOString(),
          profile: {
            id: updatedUser.id,
            name: updatedUser.profile?.name,
            avatar: updatedUser.profile?.avatar,
            bio: updatedUser.profile?.bio,
          },
          auctionEarnings: updatedUser.auctionEarnings,
          rewardEarnings: updatedUser.rewardEarnings,
          rewardSpent: updatedUser.rewardSpent,
          nftCount: updatedUser.nftCount,
          sentRewards: updatedUser.sentRewards,
          receivedRewards: updatedUser.receivedRewards,
        },
        transaction,
      };
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error claiming lottery pools:", error);
    return NextResponse.json(
      { error: "Failed to claim lottery pools" },
      { status: 500 }
    );
  }
}

// 获取未领取的奖池奖励
export async function GET(request: Request) {
  try {
    const address = request.headers.get("x-user-address");
    if (!address) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { walletAddress: address },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 获取未领取的奖池奖励
    const unclaimedLotteryPools = await prisma.lotteryPool.findMany({
      where: {
        winnerId: user.id,
        claimed: false,
        amount: {
          gt: 0
        }
      },
      include: {
        post: {
          select: {
            title: true,
            shareCode: true
          }
        }
      }
    });

    return NextResponse.json({
      lotteryPools: unclaimedLotteryPools
    });
  } catch (error) {
    console.error("Error fetching unclaimed lottery pool rewards:", error);
    return NextResponse.json(
      { error: "Failed to fetch unclaimed lottery pool rewards" },
      { status: 500 }
    );
  }
} 
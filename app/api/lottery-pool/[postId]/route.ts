import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  context: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await context.params;
    console.log("request", request.url);
    // 获取帖子信息
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: {
        id: true,
        lotteryRound: true,
        title: true,
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // 获取当前轮次的奖池信息
    const currentLotteryPool = await prisma.lotteryPool.findFirst({
      where: {
        postId: post.id,
        round: post.lotteryRound,
      },
      include: {
        winner: true,
      },
    });

    // 获取历史奖池信息
    const historicalLotteryPools = await prisma.lotteryPool.findMany({
      where: {
        postId: post.id,
        round: {
          lt: post.lotteryRound,
        },
      },
      include: {
        winner: true,
      },
      orderBy: {
        round: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        post: {
          id: post.id,
          title: post.title,
          currentRound: post.lotteryRound,
        },
        currentLotteryPool: currentLotteryPool
          ? {
              id: currentLotteryPool.id,
              round: currentLotteryPool.round,
              amount: currentLotteryPool.amount,
              winner: currentLotteryPool.winner,
              createdAt: currentLotteryPool.createdAt,
              updatedAt: currentLotteryPool.updatedAt,
            }
          : null,
        historicalLotteryPools: historicalLotteryPools.map((pool) => ({
          id: pool.id,
          round: pool.round,
          amount: pool.amount,
          winner: pool.winner,
          createdAt: pool.createdAt,
          updatedAt: pool.updatedAt,
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching lottery pool:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch lottery pool information" },
      { status: 500 }
    );
  }
}

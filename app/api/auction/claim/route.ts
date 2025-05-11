import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PostStatus } from "@prisma/client";

export async function POST(request: Request) {
  try {
    // 从请求头获取用户地址
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

    // 获取请求体中的帖子ID和交易digest
    const { postId, digest } = await request.json();
    if (!postId) {
      return NextResponse.json(
        { error: "Post ID is required" },
        { status: 400 }
      );
    }

    if (!digest) {
      return NextResponse.json(
        { error: "Transaction digest is required" },
        { status: 400 }
      );
    }

    // 查找帖子
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        bids: {
          where: { isWinner: true },
          include: {
            user: true,
          },
        },
        lotteryPools: {
          orderBy: { round: 'desc' },
          take: 1,
        },
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // 验证帖子状态是否为等待领取
    if (post.status !== PostStatus.WAITING_CLAIM) {
      return NextResponse.json(
        { error: "Post is not in waiting claim status" },
        { status: 400 }
      );
    }

    // 验证用户是否为获胜者
    const winningBid = post.bids[0];
    if (!winningBid || winningBid.userId !== user.id) {
      return NextResponse.json(
        { error: "You are not the winner of this auction" },
        { status: 403 }
      );
    }

    // 开始事务
    const result = await prisma.$transaction(async (tx) => {
      // 更新帖子状态为已发布
      const updatedPost = await tx.post.update({
        where: { id: post.id },
        data: {
          status: PostStatus.PUBLISHED,
          lotteryRound: post.lotteryRound + 1, // 增加奖池轮次
        },
      });

      // 创建新的奖池轮次
      const newLotteryPool = await tx.lotteryPool.create({
        data: {
          postId: post.id,
          amount: 0, // 初始金额为0
          round: post.lotteryRound + 1, // 新的轮次
          claimed: false, // 初始状态为未领取
        },
      });

      // 创建交易记录
      const transaction = await tx.suiTransaction.create({
        data: {
          digest,
          type: 'claim content',
          status: 'SUCCESS',
          userId: user.id,
          postId: post.id,
        },
      });

      return {
        post: updatedPost,
        lotteryPool: newLotteryPool,
        transaction,
      };
    });

    return NextResponse.json({
      success: true,
      message: "Successfully claimed auction rewards",
      data: result,
    });
  } catch (error) {
    console.error("Error claiming auction rewards:", error);
    return NextResponse.json(
      { success: false, error: "Failed to claim auction rewards" },
      { status: 500 }
    );
  }
} 
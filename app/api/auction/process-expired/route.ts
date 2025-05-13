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

    // 获取请求体中的竞拍ID和交易digest
    const { postId, digest, lotteryPoolWinnerAddress } = await request.json();
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

    // 查找竞拍帖子
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        bids: {
          orderBy: [{ amount: "desc" }, { createdAt: "asc" }],
          include: {
            user: true,
          },
        }
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // 获取当前轮次的奖池
    const currentLotteryPool = await prisma.lotteryPool.findFirst({
      where: {
        postId: post.id,
        round: post.lotteryRound
      }
    });

    // 如果提供了lotteryPoolWinnerAddress，查找对应的用户
    let lotteryPoolWinnerId = post.userId; // 默认使用帖子创作者
    if (lotteryPoolWinnerAddress) {
      const winnerUser = await prisma.user.findUnique({
        where: { walletAddress: lotteryPoolWinnerAddress }
      });
      if (winnerUser) {
        lotteryPoolWinnerId = winnerUser.id;
      }
    }

    // 验证帖子是否属于当前用户
    if (post.userId !== user.id) {
      return NextResponse.json(
        { error: "You can only process your own auctions" },
        { status: 403 }
      );
    }

    // 验证帖子是否已到期
    if (!post.biddingDueDate || new Date(post.biddingDueDate) > new Date()) {
      return NextResponse.json(
        { error: "Auction has not expired yet" },
        { status: 400 }
      );
    }

    // 验证帖子是否允许竞拍且状态为已发布
    if (!post.allowBidding || post.status !== PostStatus.PUBLISHED) {
      return NextResponse.json(
        { error: "Auction is not active" },
        { status: 400 }
      );
    }

    // 如果没有竞拍记录，直接关闭竞拍
    if (post.bids.length === 0) {
      await prisma.post.update({
        where: { id: post.id },
        data: {
          allowBidding: false,
          biddingDueDate: null,
          startPrice: null,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Auction closed with no bids",
      });
    }

    // 获取最高出价者
    const winningBid = post.bids[0];

    // 创建交易记录
    const transaction = await prisma.suiTransaction.create({
      data: {
        digest,
        type: "complete_auction",
        status: "success",
        userId: user.id,
        postId: post.id,
      },
    });

    // 更新获胜者的竞拍记录
    await prisma.bid.update({
      where: { id: winningBid.id },
      data: {
        isWinner: true,
        // 设置各方可获得的金额
        creatorAmount: winningBid.amount * 0.8, // 创作者获得80%
        referrerAmount: winningBid.referrerId ? winningBid.amount * 0.05 : null, // 推荐人获得5%
        platformAmount: winningBid.amount * 0.1, // 平台获得10%
        lotteryAmount: winningBid.amount * 0.05, // 奖池获得5%
      },
    });

    // 更新抽奖池金额（5%）
    if (currentLotteryPool) {
      await prisma.lotteryPool.update({
        where: { id: currentLotteryPool.id },
        data: {
          amount: {
            increment: winningBid.amount * 0.05,
          },
          winnerId: lotteryPoolWinnerId,
        },
      });
    }

    // 更新帖子状态
    await prisma.post.update({
      where: { id: post.id },
      data: {
        userId: winningBid.userId,
        allowBidding: false,
        biddingDueDate: null,
        startPrice: null,
        currentHighestBid: null,
        status: PostStatus.WAITING_CLAIM,
        lotteryRound: post.lotteryRound + 1,
      },
    });

    // 创建新的奖池轮次
    await prisma.lotteryPool.create({
      data: {
        postId: post.id,
        amount: 0, // 初始金额为0
        round: post.lotteryRound + 1, // 新的轮次
        claimed: false, // 初始状态为未领取
      },
    });

    // 更新当前轮次的拍卖历史记录
    await prisma.auctionHistory.updateMany({
      where: {
        postId: post.id,
        round: post.auctionRound,
      },
      data: {
        finalPrice: winningBid.amount,
        winnerId: winningBid.userId,
        transactionId: transaction.id
      }
    });

    // 创建通知
    // 1. 给竞拍胜利者发送通知
    await prisma.notification.create({
      data: {
        type: "auction win",
        content: `Congratulations! You won the auction for "${post.title}" with a bid of ${winningBid.amount} SUI`,
        userId: winningBid.userId,
        postId: post.id,
      },
    });

    // 2. 给发起竞拍者（原创作者）发送通知
    await prisma.notification.create({
      data: {
        type: "auction end",
        content: `Your auction for "${post.title}" has ended. The winning bid was ${winningBid.amount} SUI`,
        userId: post.creatorId,
        postId: post.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Successfully processed auction",
      winner: {
        userId: winningBid.userId,
        amount: winningBid.amount,
      },
    });
  } catch (error) {
    console.error("Error processing auction:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process auction" },
      { status: 500 }
    );
  }
}


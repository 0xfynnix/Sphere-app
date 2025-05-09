import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AuctionInfo } from '@/lib/api/types';


// 启动拍卖
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const walletAddress = request.headers.get('x-user-address');
    if (!walletAddress) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // 等待路由参数解析
    const { id: postId } = await context.params;
    if (!postId) {
      return new NextResponse('Post ID is required', { status: 400 });
    }

    const auctionInfo: AuctionInfo = await request.json();

    // 验证用户是否是帖子作者
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        user: true,
      },
    });

    if (!post) {
      return new NextResponse('Post not found', { status: 404 });
    }

    if (post.user.walletAddress !== walletAddress) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // 计算拍卖结束时间
    const biddingDueDate = new Date(Date.now() + auctionInfo.durationHours * 60 * 60 * 1000 + auctionInfo.durationMinutes * 60 * 1000);

    // 创建拍卖历史记录
    const auctionHistory = await prisma.auctionHistory.create({
      data: {
        postId: postId,
        round: post.auctionRound + 1,
        startPrice: auctionInfo.startPrice,
        biddingDueDate: biddingDueDate,
        totalBids: 0,
        auctionObjectId: auctionInfo.auctionId,
        auctionCapObjectId: auctionInfo.auctionCapId,
      },
    });

    // 更新帖子拍卖信息
    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: {
        allowBidding: true,
        startPrice: auctionInfo.startPrice,
        biddingDueDate: biddingDueDate,
        auctionRound: post.auctionRound + 1,
      },
      include: {
        user: true,
        comments: {
          include: {
            user: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    // 创建拍卖交易记录
    await prisma.suiTransaction.create({
      data: {
        digest: auctionInfo.auctionDigest,
        userId: post.user.id,
        postId: postId,
        type: 'create auction',
        status: 'success',
        data: {
          nftObjectId: post.nftObjectId,
          auctionObjectId: auctionInfo.auctionId,
          auctionCapObjectId: auctionInfo.auctionCapId,
          startPrice: auctionInfo.startPrice,
          dueDate: biddingDueDate,
          round: post.auctionRound + 1,
          auctionHistoryId: auctionHistory.id,
        },
      },
    });

    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error('Failed to update post auction:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 